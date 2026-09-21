import { ENTRYPOINT_ABI } from "@arcveil/bridge";
import { privateKeyToAccount } from "viem/accounts";

import { publishRoot, readState } from "./asp";
import { clientsFor } from "./clients";
import { loadConfig, loadFromBlock, loadPostman, type Env, type ExecutionContext, type ScheduledController } from "./env";
import { corsHeaders, fail, json, rateLimit, readJson } from "./http";
import { submit } from "./relay";
import { issues, WithdrawRequestSchema } from "./schema";

/**
 * The relayer.
 *
 * It submits shielded withdrawals so that a fresh address never has to hold
 * gas to be paid — on Arc gas is USDC, so funding the recipient first would
 * rebuild the exact link the pool was used to break.
 *
 * It keeps no records. Not as a policy that could be changed, but because it
 * has nothing to keep: every check it makes it makes against the chain, in the
 * request, and forgets. What it unavoidably sees while a request is in flight
 * — a recipient, an amount, an IP — is stated on the page rather than denied.
 */

type Headers = Readonly<Record<string, string>>;

/** What a client needs to know before it builds a proof, since the fee is bound into it. */
async function quote(env: Env, headers: Headers): Promise<Response> {
  const config = loadConfig(env);
  if (!config.ok) return fail(503, config.error, headers);

  const { publicClient } = await clientsFor(config.value.rpc, config.value.key);
  const feeRecipient = privateKeyToAccount(config.value.key).address;

  const pool = await publicClient.readContract({
    address: config.value.entrypoint,
    abi: ENTRYPOINT_ABI,
    functionName: "scopeToPool",
    args: [config.value.scope],
  });

  return json(
    {
      entrypoint: config.value.entrypoint,
      pool,
      scope: config.value.scope.toString(),
      feeRecipient,
      minFeeBPS: config.value.minFeeBps.toString(),
      // Said here so it is not only in the prose: these three are hashed into
      // the proof, so the relayer cannot change them after the fact.
      bound: ["recipient", "feeRecipient", "relayFeeBPS"],
    },
    200,
    headers,
  );
}

async function withdraw(env: Env, request: Request, headers: Headers): Promise<Response> {
  const config = loadConfig(env);
  if (!config.ok) return fail(503, config.error, headers);

  const body = await readJson(request, headers);
  if (!body.ok) return body.response;

  const parsed = WithdrawRequestSchema.safeParse(body.value);
  if (!parsed.success) return fail(400, issues(parsed.error), headers);

  const clients = await clientsFor(config.value.rpc, config.value.key);
  const outcome = await submit(parsed.data, config.value, clients);

  return outcome.ok
    ? json({ hash: outcome.hash }, 200, headers)
    : fail(outcome.status, outcome.error, headers);
}

/** What the pool looks like right now, including how little privacy a small one gives. */
async function status(env: Env, headers: Headers): Promise<Response> {
  const config = loadConfig(env);
  if (!config.ok) return fail(503, config.error, headers);
  const fromBlock = loadFromBlock(env);
  if (!fromBlock.ok) return fail(503, `${fromBlock.error}.`, headers);

  const { publicClient } = await clientsFor(config.value.rpc, config.value.key);
  const pool = await publicClient.readContract({
    address: config.value.entrypoint,
    abi: ENTRYPOINT_ABI,
    functionName: "scopeToPool",
    args: [config.value.scope],
  });

  const state = await readState(publicClient, config.value.entrypoint, pool, fromBlock.value);

  return json(
    {
      deposits: state.labels.length,
      root: state.root.toString(),
      publishedRoot: state.published.toString(),
      upToDate: state.upToDate,
      policy: "every label, unfiltered",
    },
    200,
    headers,
  );
}

const relayer = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(env, request);
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    if (request.method === "GET" && pathname === "/quote") return quote(env, headers);
    if (request.method === "GET" && pathname === "/status") return status(env, headers);

    if (request.method === "POST" && pathname === "/withdraw") {
      const limited = await rateLimit(env, request, headers);
      if (limited) return limited.response;
      return withdraw(env, request, headers);
    }

    return fail(404, "GET /quote, GET /status, or POST /withdraw.", headers);
  },

  /**
   * Publishes the association-set root when it has moved.
   *
   * Until this runs, a deposit's label is not in any published set and cannot
   * be withdrawn privately. That is the postman's one power, and the reason
   * `VeilGateway.ragequit` exists: a depositor whose label never arrives can
   * still take their money back, publicly, without asking anyone.
   */
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const config = loadConfig(env);
    const postman = loadPostman(env);
    if (!config.ok || !postman.ok) return;

    ctx.waitUntil(
      (async () => {
        const clients = await clientsFor(config.value.rpc, postman.value.key);
        const pool = await clients.publicClient.readContract({
          address: config.value.entrypoint,
          abi: ENTRYPOINT_ABI,
          functionName: "scopeToPool",
          args: [config.value.scope],
        });

        const state = await readState(clients.publicClient, config.value.entrypoint, pool, postman.value.fromBlock);
        await publishRoot(state, config.value.entrypoint, clients);
      })(),
    );
  },
};

export default relayer;
