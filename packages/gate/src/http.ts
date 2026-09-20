import type { Env } from "./env";

/** The most a caller may put in front of the judge. One evaluation is one paid inference. */
export const MAX_BODY_CHARS = 24_000;

export const json = (body: unknown, status = 200, headers: Readonly<Record<string, string>> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export const fail = (status: number, error: string, headers?: Readonly<Record<string, string>>): Response =>
  json({ error }, status, headers);

/** Length is allowed to leak; the contents are not. */
const equals = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
};

/**
 * One origin, named explicitly, or none at all. A gate that answers `*` is a
 * gate any page in any tab can spend against.
 */
export function corsHeaders(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (env.GATE_ORIGIN === undefined || origin === null || origin !== env.GATE_ORIGIN) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "authorization,content-type",
    "access-control-allow-methods": "POST,OPTIONS",
    vary: "origin",
  };
}

export type Denial = { response: Response };

/**
 * Fails closed in both directions: no token configured means the gate serves
 * nobody, and a wrong token is refused before a single inference is bought.
 */
export function authorise(env: Env, request: Request, headers: Readonly<Record<string, string>>): Denial | null {
  if (env.GATE_TOKEN === undefined || env.GATE_TOKEN === "") {
    return { response: fail(503, "This gate has no token configured, so it is not in service.", headers) };
  }
  const presented = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!presented.startsWith(prefix) || !equals(presented.slice(prefix.length), env.GATE_TOKEN)) {
    return { response: fail(401, "Present a bearer token this gate accepts.", headers) };
  }
  return null;
}

/** Bounds what a leaked token can spend, when the binding is configured. */
export async function rateLimit(env: Env, request: Request, headers: Readonly<Record<string, string>>): Promise<Denial | null> {
  if (env.RATE_LIMIT === undefined) return null;
  const key = request.headers.get("cf-connecting-ip") ?? "anonymous";
  const { success } = await env.RATE_LIMIT.limit({ key });
  return success ? null : { response: fail(429, "Too many evaluations. Slow down.", headers) };
}

export type Body = { ok: true; value: unknown } | { ok: false; response: Response };

/** Reads the request body under a hard size cap, before anything is spent on it. */
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
