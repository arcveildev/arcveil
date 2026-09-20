import { z } from "zod";
import type { Clause, SelectionPolicy } from "@arcveil/sdk";
import type { Env } from "./env";

/**
 * The mandate, as this service receives it. It arrives as a secret string, so
 * it is untrusted in exactly the way a text box is: a typo in a threshold is a
 * gate that silently waves things through, which is the failure that must not
 * be possible. Anything that does not parse takes the gate out of service.
 */

const base = {
  id: z.string().min(1),
  instructions: z.string().min(1),
  confidence: z.number().min(0).max(1),
};

const clauseSchema = z.discriminatedUnion("type", [
  z
    .object({
      ...base,
      type: z.literal("noul"),
      require: z.boolean(),
      criteria: z.object({ true: z.string().min(1), false: z.string().min(1) }).strict().optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("choice"),
      criteria: z.record(z.string(), z.string().min(1)),
      allow: z.array(z.string().min(1)).min(1),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("score"),
      criteria: z.array(z.string().min(1)).min(2),
      band: z.object({ min: z.number().optional(), max: z.number().optional() }).strict(),
    })
    .strict(),
]);

const clausesSchema = z.array(clauseSchema).min(1);

const selectionSchema = z
  .object({
    maxPriceUsd: z.number().positive(),
    fitConfidence: z.number().min(0).max(1),
    worthConfidence: z.number().min(0).max(1),
  })
  .strict();

export type Loaded<T> = { ok: true; value: T } | { ok: false; error: string };

const parseSecret = <T>(name: string, raw: string | undefined, schema: z.ZodType<T>): Loaded<T> => {
  if (raw === undefined || raw.trim() === "") return { ok: false, error: `${name} is not configured.` };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: `${name} is not valid JSON.` };
  }
  const parsed = schema.safeParse(json);
  if (parsed.success) return { ok: true, value: parsed.data };
  const first = parsed.error.issues[0];
  return { ok: false, error: `${name} is malformed at ${first?.path.join(".") || name}: ${first?.message}` };
};

export const loadClauses = (env: Env): Loaded<readonly Clause[]> =>
  parseSecret("GATE_CLAUSES", env.GATE_CLAUSES, clausesSchema as unknown as z.ZodType<readonly Clause[]>);

export const loadSelectionPolicy = (env: Env): Loaded<SelectionPolicy> =>
  parseSecret("GATE_SELECTION", env.GATE_SELECTION, selectionSchema);
