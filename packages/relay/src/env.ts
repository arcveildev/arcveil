import { z } from "zod";

/**
 * What the relayer is given at runtime.
 *
 * There is no database binding here and that is deliberate. A relayer sees
 * recipients and amounts; anything it writes down is a record of who was paid
 * out of the pool, which is the one link the pool exists to break. So it keeps
 * nothing: every check it makes, it makes against the chain, in the moment.
 */
export type Env = {
  /** Arc JSON-RPC. Reads and one write per withdrawal. */
  ARC_RPC?: string;
  /** The Privacy Pool Entrypoint on Arc. */
  ENTRYPOINT?: string;
  /** The pool's scope, which selects the pool inside the Entrypoint. */
  SCOPE?: string;
  /** The hot key that pays gas. Funded with USDC, holds nothing else, rotatable. */
  RELAYER_KEY?: string;
  /** Minimum fee, in basis points of the withdrawal, this relayer will work for. */
  MIN_FEE_BPS?: string;
  /** The one browser origin allowed to call this relayer, if any. */
  RELAY_ORIGIN?: string;
  /** The postman key that publishes association-set roots. Never the relayer key, never the 2-of-3. */
  POSTMAN_KEY?: string;
  RATE_LIMIT?: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
};

const address = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "expected an address")
  .transform((value) => value as `0x${string}`);

const privateKey = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, "expected a 32-byte private key")
  .transform((value) => value as `0x${string}`);

const ConfigSchema = z.object({
  rpc: z.url(),
  entrypoint: address,
  scope: z.string().regex(/^\d+$/, "expected a decimal scope").transform(BigInt),
  key: privateKey,
  minFeeBps: z
    .string()
    .optional()
    .default("25")
    .regex(/^\d+$/, "expected basis points as a whole number")
    .transform(BigInt)
    .refine((bps) => bps <= 10_000n, "a fee cannot exceed the whole withdrawal"),
});

export type Config = z.infer<typeof ConfigSchema>;

export type Loaded<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Fails closed. A relayer missing any of this is not a relayer that quietly
 * misbehaves — it is one that answers 503 and explains which binding is absent.
 */
export const loadConfig = (env: Env): Loaded<Config> => {
  const parsed = ConfigSchema.safeParse({
    rpc: env.ARC_RPC,
    entrypoint: env.ENTRYPOINT,
    scope: env.SCOPE,
    key: env.RELAYER_KEY,
    minFeeBps: env.MIN_FEE_BPS,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`);
    return { ok: false, error: `This relayer is not configured — ${missing.join("; ")}.` };
  }

  return { ok: true, value: parsed.data };
};
