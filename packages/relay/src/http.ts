import type { Env } from "./env";

/** A proof is a few hundred numbers. Anything much larger is not a withdrawal. */
export const MAX_BODY_CHARS = 16_000;

export const json = (body: unknown, status = 200, headers: Readonly<Record<string, string>> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export const fail = (status: number, error: string, headers?: Readonly<Record<string, string>>): Response =>
  json({ error }, status, headers);

/**
 * One named origin, or none.
 *
 * @dev There is deliberately no bearer token. A token is an account, an
 *      account is an identity, and an identity attached to a withdrawal is the
 *      link this whole system exists to break. The relayer is open and rate
 *      limited instead: it only ever submits withdrawals that pay it, and it
 *      only signs after a free simulation says the transaction succeeds, so an
 *      abusive caller cannot make it spend anything.
 */
export function corsHeaders(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (env.RELAY_ORIGIN === undefined || origin === null || origin !== env.RELAY_ORIGIN) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    vary: "origin",
  };
}

export type Denial = { response: Response };

export async function rateLimit(
  env: Env,
  request: Request,
  headers: Readonly<Record<string, string>>,
): Promise<Denial | null> {
  if (env.RATE_LIMIT === undefined) return null;
  const key = request.headers.get("cf-connecting-ip") ?? "anonymous";
  const { success } = await env.RATE_LIMIT.limit({ key });
  return success ? null : { response: fail(429, "Too many requests. Slow down.", headers) };
}

export type Body = { ok: true; value: unknown } | { ok: false; response: Response };

export async function readJson(request: Request, headers: Readonly<Record<string, string>>): Promise<Body> {
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) {
    return { ok: false, response: fail(413, `Body is larger than ${MAX_BODY_CHARS} characters.`, headers) };
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, response: fail(400, "Body is not valid JSON.", headers) };
  }
}
