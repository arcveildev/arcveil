import { authorizeFunding, type Membership } from "./authorize";

/** Only Arc, only USDC: the account's mandate is written in USDC. */
export const ASSETS = { pairs: [{ token: "USDC", chain: "arc" }] } as const;

export type MintRequest = Readonly<{
  appUserId: string;
  destinationAddress: string;
  assets: typeof ASSETS;
}>;

export type MintedSession = Readonly<{ sessionToken: string; expiresAt: string; [key: string]: unknown }>;

/** Circle's server kit, narrowed to the one call this service makes. */
export type SessionMinter = (request: MintRequest) => Promise<MintedSession>;

export type HandlerDeps = Readonly<{
  mint: SessionMinter;
  isMember: Membership;
  now: () => number;
  chainId: number;
  /** The one browser origin allowed to call this service. */
  origin?: string;
}>;

const MAX_BODY_CHARS = 4_000;

const json = (body: unknown, status: number, headers: Readonly<Record<string, string>>): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

function cors(deps: HandlerDeps, request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (deps.origin === undefined || origin === null || origin !== deps.origin) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST,OPTIONS",
    vary: "origin",
  };
}

async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; error: string; status: number }> {
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) return { ok: false, status: 413, error: "Body is too large." };
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Body is not valid JSON." };
  }
}

/**
 * Opens a Circle onramp session into an Arcveil account, for a caller who
 * proves they hold one of its keys. The destination is never taken from the
 * request: it is the account the signature was checked against.
 */
export function createHandler(deps: HandlerDeps): (request: Request) => Promise<Response> {
  return async (request) => {
    const headers = cors(deps, request);
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    if (pathname === "/" && request.method === "GET") {
      return json(
        {
          service: "arcveil-onramp",
          chainId: deps.chainId,
          does: "POST /sessions with { account, issuedAt, signature } signed by one of the account's keys; returns a Circle Onramp session that can only fund that account.",
        },
        200,
        headers,
      );
    }

    if (pathname !== "/sessions") return json({ error: "Not found." }, 404, headers);
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, headers);

    const body = await readJson(request);
    if (!body.ok) return json({ error: body.error }, body.status, headers);

    const verdict = await authorizeFunding(body.value, deps);
    if (!verdict.ok) return json({ error: verdict.error }, verdict.status, headers);

    try {
      const session = await deps.mint({
        appUserId: verdict.account.toLowerCase(),
        destinationAddress: verdict.account,
        assets: ASSETS,
      });
      return json(session, 200, headers);
    } catch (error) {
      console.error("onramp mint failed", error instanceof Error ? error.name : "unknown");
      return json({ error: "Circle did not open a session. Try again shortly." }, 502, headers);
    }
  };
}
