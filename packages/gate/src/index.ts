import { z } from "zod";
import {
  affordable,
  applySelection,
  buildEvaluation,
  buildSelection,
  decide,
  judgeCommitment,
  selectionClauses,
  type Candidate,
} from "@arcveildev/sdk";
import { loadClauses, loadSelectionPolicy } from "./config";
import { ask, JEV_MODEL } from "./judge";
import { authorise, corsHeaders, fail, json, rateLimit, readJson } from "./http";
import { page, wantsPage } from "./landing";
import type { Env } from "./env";

/**
 * The policy gate.
 *
 * It holds a mandate's semantic clauses, puts them to the judge, and answers
 * allow or deny. It never answers *how close* the call was: the probabilities
 * come back to this service and stop here, because a caller that can watch a
 * score move can walk a threshold until it finds the edge — and the thresholds
 * are the mandate. What leaves is a verdict and the names of the checks, which
 * is exactly what a receipt carries anyway.
 */

// Jev takes one state: a string, or a structure. Anything else is not a state.
const stateSchema = z.union([
  z.string().min(1),
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()).min(1),
]);

const evaluateSchema = z.object({ state: stateSchema }).strict();

const selectSchema = z
  .object({
    task: z.string().min(1).max(2_000),
    candidates: z
      .array(
        z
          .object({ id: z.string().min(1), description: z.string().min(1).max(2_000), priceUsd: z.number().min(0) })
          .strict(),
      )
      .min(1)
      .max(20),
  })
  .strict();

const issues = (error: z.ZodError): string =>
  error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");

type Headers = Readonly<Record<string, string>>;

/** What this gate checks, and under which commitment. Names only — never the terms. */
function describe(env: Env, headers: Headers): Response {
  const clauses = loadClauses(env);
  if (!clauses.ok) return fail(503, clauses.error, headers);
  return json(
    {
      gate: "arcveil",
      model: JEV_MODEL,
      checks: clauses.value.map((clause) => clause.id),
      commitment: judgeCommitment(clauses.value),
    },
    200,
    headers,
  );
}

/** Puts one proposed action to the mandate's semantic clauses. */
async function evaluate(request: Request, env: Env, headers: Headers): Promise<Response> {
  const clauses = loadClauses(env);
  if (!clauses.ok) return fail(503, clauses.error, headers);

  const body = await readJson(request, headers);
  if (!body.ok) return body.response;
  const parsed = evaluateSchema.safeParse(body.value);
  if (!parsed.success) return fail(400, issues(parsed.error), headers);

  const answered = await ask(env.AI, buildEvaluation(clauses.value, parsed.data.state));
  // A judge that did not answer has not allowed anything.
  if (!answered.ok) return fail(502, answered.error, headers);

  const decision = decide(clauses.value, answered.judgement);
  return json(
    {
      allow: decision.allow,
      checks: decision.checks,
      failed: decision.failed,
      judge: { model: decision.model, commitment: judgeCommitment(clauses.value) },
    },
    200,
    headers,
  );
}

/** Chooses which paid tool to buy, if any. The cap is applied before the judge sees the field. */
async function select(request: Request, env: Env, headers: Headers): Promise<Response> {
  const policy = loadSelectionPolicy(env);
  if (!policy.ok) return fail(503, policy.error, headers);

  const body = await readJson(request, headers);
  if (!body.ok) return body.response;
  const parsed = selectSchema.safeParse(body.value);
  if (!parsed.success) return fail(400, issues(parsed.error), headers);

  const candidates: readonly Candidate[] = affordable(parsed.data.candidates, policy.value);
  // Nothing affordable is a refusal the mandate makes on its own, unpaid.
  if (candidates.length === 0) {
    return json({ chosen: null, checks: ["price_cap"], failed: ["price_cap"], judge: null }, 200, headers);
  }

  const answered = await ask(env.AI, buildSelection(parsed.data.task, candidates));
  if (!answered.ok) return fail(502, answered.error, headers);

  const selection = applySelection(candidates, policy.value, answered.judgement);
  return json(
    {
      chosen: selection.chosen,
      checks: selection.checks,
      failed: selection.failed,
      judge: {
        model: answered.judgement.model,
        commitment: judgeCommitment(selectionClauses(candidates, policy.value)),
      },
    },
    200,
    headers,
  );
}

/**
 * The raw judgement, for an operator setting thresholds.
 *
 * This is the one place probabilities leave the service, and it is off by
 * default: with GATE_CALIBRATION unset the route 404s exactly like a typo, so
 * a deployed gate does not advertise that it exists. Calibration happens
 * against `wrangler dev` on the machine of whoever owns the mandate, which is
 * the only party the numbers were ever for.
 */
async function calibrate(request: Request, env: Env, headers: Headers): Promise<Response> {
  const clauses = loadClauses(env);
  if (!clauses.ok) return fail(503, clauses.error, headers);

  const body = await readJson(request, headers);
  if (!body.ok) return body.response;
  const parsed = evaluateSchema.safeParse(body.value);
  if (!parsed.success) return fail(400, issues(parsed.error), headers);

  const answered = await ask(env.AI, buildEvaluation(clauses.value, parsed.data.state));
  if (!answered.ok) return fail(502, answered.error, headers);

  const decision = decide(clauses.value, answered.judgement);
  return json(
    {
      allow: decision.allow,
      checks: decision.checks,
      failed: decision.failed,
      judgement: answered.judgement,
    },
    200,
    headers,
  );
}

const gate = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(env, request);
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    // A person who typed the hostname in gets a door rather than a JSON 401.
    // It is static, so it costs nothing and cannot say more than the site does.
    // HEAD as well as GET: an uptime check or a link preview that HEADs the
    // root and reads 401 reports this gate as down, which is the same wrong
    // impression the page exists to correct.
    const browsing = request.method === "GET" || request.method === "HEAD";
    if (browsing && pathname === "/" && wantsPage(request)) return page(headers);

    const refused = authorise(env, request, headers);
    if (refused !== null) return refused.response;

    const limited = await rateLimit(env, request, headers);
    if (limited !== null) return limited.response;

    if (request.method === "GET" && pathname === "/") return describe(env, headers);
    if (request.method === "POST" && pathname === "/evaluate") return evaluate(request, env, headers);
    if (request.method === "POST" && pathname === "/select") return select(request, env, headers);
    if (request.method === "POST" && pathname === "/calibrate" && (env.GATE_CALIBRATION ?? "") !== "") {
      return calibrate(request, env, headers);
    }

    return fail(404, `No route for ${request.method} ${pathname}.`, headers);
  },
};

export default gate;
