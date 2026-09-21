import { z } from "zod";

/**
 * What a client may post. Everything here arrives from a stranger, so nothing
 * is trusted: a malformed proof should be a 400 with a sentence, never a
 * transaction that reverts after gas has been spent on it.
 */

const bigintish = z.union([z.string().regex(/^\d+$/), z.number().int().nonnegative()]).transform((v) => BigInt(v));

const address = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/)
  .transform((v) => v as `0x${string}`);

const pair = z.tuple([bigintish, bigintish]);

export const WithdrawRequestSchema = z
  .object({
    recipient: address,
    relayFeeBPS: bigintish,
    proof: z
      .object({
        pA: pair,
        pB: z.tuple([pair, pair]),
        pC: pair,
        pubSignals: z.tuple([
          bigintish,
          bigintish,
          bigintish,
          bigintish,
          bigintish,
          bigintish,
          bigintish,
          bigintish,
        ]),
      })
      .strict(),
  })
  .strict();

export type WithdrawRequest = z.infer<typeof WithdrawRequestSchema>;

export const issues = (error: z.ZodError): string =>
  error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
