import { z } from "zod";

/**
 * What the Worker is given. The API key is the only secret: it is set with
 * `wrangler secret put CIRCLE_API_KEY` in production and read from the
 * gitignored `.dev.vars` locally. Everything else is public configuration.
 */
export type RateLimiter = { limit: (options: { key: string }) => Promise<{ success: boolean }> };

export type Env = {
  CIRCLE_API_KEY?: string;
  /** https://api-test.circle.com for sandbox, https://api.circle.com for production. */
  ONRAMP_API_BASE_URL?: string;
  /** https://onramp-sandbox.arc.io or https://onramp.arc.io — must match the page's. */
  ONRAMP_WIDGET_BASE_URL?: string;
  /** Hostname only. Needed for card, Apple Pay and Google Pay when embedded. */
  ONRAMP_REFERRER_DOMAIN?: string;
  /** The one browser origin allowed to call this Worker. */
  ONRAMP_ORIGIN?: string;
  /** Where membership is read. Always the chain the accounts live on. */
  ARC_RPC?: string;
  ARC_CHAIN_ID?: string;
  RATE_LIMIT?: RateLimiter;
};

const configSchema = z.object({
  // Circle's keys are `<ENV>_API_KEY:<keyId>:<keySecret>`; a value without the
  // prefix is rejected upstream with a message that does not say why.
  CIRCLE_API_KEY: z.string().regex(/^[A-Z]+_API_KEY:[^:]+:[^:]+$/, "CIRCLE_API_KEY must be the full <ENV>_API_KEY:<keyId>:<keySecret> value"),
  ONRAMP_API_BASE_URL: z.url(),
  ONRAMP_WIDGET_BASE_URL: z.url(),
  ONRAMP_REFERRER_DOMAIN: z.string().regex(/^[a-z0-9.-]+$/i, "hostname only, no scheme or path").optional(),
  ONRAMP_ORIGIN: z.url().optional(),
  ARC_RPC: z.url(),
  ARC_CHAIN_ID: z.coerce.number().int().positive(),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(env: Env): { ok: true; config: Config } | { ok: false; error: string } {
  const parsed = configSchema.safeParse(env);
  if (parsed.success) return { ok: true, config: parsed.data };
  // Names the setting, never echoes its value.
  return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
}
