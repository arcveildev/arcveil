import { parseJudgement, type Evaluation, type Judgement } from "@arcveil/sdk";
import type { JudgeBinding } from "./env";

/** TypeSafe's structured evaluation model, reached through the Workers AI binding. */
export const JEV_MODEL = "typesafe/jev";

export type Asked = { ok: true; judgement: Judgement } | { ok: false; error: string };

/**
 * Puts one evaluation to the judge.
 *
 * A judge that errors, times out or answers in a shape we do not recognise has
 * not said yes. Every one of those paths returns a failure the caller must
 * turn into a deny — there is no branch here that can become a silent allow.
 */
export async function ask(ai: JudgeBinding, evaluation: Evaluation): Promise<Asked> {
  let raw: unknown;
  try {
    raw = await ai.run(JEV_MODEL, evaluation);
  } catch (error) {
    return { ok: false, error: `The judge could not be reached: ${error instanceof Error ? error.message : String(error)}` };
  }
  const parsed = parseJudgement(raw);
  return parsed.ok
    ? { ok: true, judgement: parsed.judgement }
    : { ok: false, error: `The judge answered in an unexpected shape: ${parsed.errors.join("; ")}` };
}
