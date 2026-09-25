import { createOnrampServerKit } from "@circle-fin/onramp-kit/server";
import { createMembership } from "./chain";
import { loadConfig, type Env } from "./env";
import { createHandler } from "./handler";

const jsonError = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const loaded = loadConfig(env);
    if (!loaded.ok) {
      console.error("onramp misconfigured:", loaded.error);
      return jsonError(503, "This service is not configured, so it is not in service.");
    }
    const { config } = loaded;

    if (env.RATE_LIMIT !== undefined && request.method === "POST") {
      const { success } = await env.RATE_LIMIT.limit({ key: request.headers.get("cf-connecting-ip") ?? "anonymous" });
      if (!success) return jsonError(429, "Too many requests. Slow down.");
    }

    const kit = createOnrampServerKit({
      apiKey: config.CIRCLE_API_KEY,
      baseUrl: config.ONRAMP_API_BASE_URL,
      widgetBaseUrl: config.ONRAMP_WIDGET_BASE_URL,
      ...(config.ONRAMP_REFERRER_DOMAIN ? { referrerDomain: config.ONRAMP_REFERRER_DOMAIN } : {}),
    });

    const handle = createHandler({
      mint: (body) => kit.createSession(body),
      isMember: createMembership(config.ARC_RPC),
      now: () => Date.now(),
      chainId: config.ARC_CHAIN_ID,
      ...(config.ONRAMP_ORIGIN ? { origin: config.ONRAMP_ORIGIN } : {}),
    });
    return handle(request);
  },
};
