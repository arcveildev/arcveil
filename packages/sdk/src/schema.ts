import { z } from "zod";
import { RECEIPT_VERSION, type Receipt } from "./types";

const hex = (bytes?: number) =>
  z.string().regex(bytes === undefined ? /^0x[0-9a-fA-F]+$/ : new RegExp(`^0x[0-9a-fA-F]{${bytes * 2}}$`), {
    message: bytes === undefined ? "must be a 0x-prefixed hex string" : `must be ${bytes} bytes of 0x-prefixed hex`,
  });

const proofSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("attestation"), signer: hex(65), signature: hex(64) }).strict(),
  z.object({ type: z.literal("zk"), system: z.string().min(1), data: hex() }).strict(),
]);

const receiptSchema = z
  .object({
    v: z.literal(RECEIPT_VERSION),
    id: hex(32),
    chain: z.number().int().positive(),
    account: hex(20),
    mandate: z.object({ commitment: hex(32), epoch: z.number().int().nonnegative() }).strict(),
    agent: z
      .object({ id: hex(32), session: hex(16), vision: z.enum(["relative-only", "absolute"]) })
      .strict(),
    action: z
      .object({
        kind: z.enum(["transfer", "swap", "approve"]),
        userOpHash: hex(32),
        settledTx: hex(32),
        at: z.iso.datetime(),
      })
      .strict(),
    checks: z.array(z.string().min(1)).min(1),
    counter: z.object({ prev: hex(32), next: hex(32) }).strict(),
    proof: proofSchema,
  })
  .strict();

const bundleSchema = z.array(receiptSchema).min(1, { message: "a bundle needs at least one receipt" });

export type ParseResult = { ok: true; receipts: readonly Receipt[] } | { ok: false; errors: readonly string[] };

const formatIssues = (error: z.ZodError): string[] =>
  error.issues.map((issue) => `${issue.path.join(".") || "receipt"}: ${issue.message}`);

/** Everything crossing the boundary from a text box is untrusted until this says otherwise. */
export function parseReceiptInput(input: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(input);
  } catch (error) {
    return { ok: false, errors: [`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`] };
  }
  // Parsed per shape rather than through a union, so error paths stay readable.
  const parsed = Array.isArray(json) ? bundleSchema.safeParse(json) : receiptSchema.safeParse(json);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const receipts = (Array.isArray(parsed.data) ? parsed.data : [parsed.data]) as Receipt[];
  return { ok: true, receipts };
}
