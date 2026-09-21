import { parseJudgement, type Evaluation, type Judgement } from "@arcveildev/sdk";
import type { JudgeBinding } from "./env";

/** TypeSafe's structured evaluation model, reached through the Workers AI binding. */
export const JEV_MODEL = "typesafe/jev";

export type Asked = { ok: true; judgement: Judgement } | { ok: false; error: string };

/**
 * The binding wraps the model's answer.
 *
 * `env.AI.run("typesafe/jev", …)` came back as `{ state, result, gatewayMetadata }`
 * on 2026-09-21, with the documented flat response sitting in `result`. Both
 * shapes are accepted, so this keeps working whichever way it settles — and the
 * wrapper is dropped rather than carried, because `state` is the proposal we
 * just sent and it has no business travelling back out of this service.
 */
const unwrap = (raw: unknown): unknown =>
  typeof raw === "object" && raw !== null && "result" in raw ? (raw as { result: unknown }).result : raw;

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
  const answer = unwrap(raw);
  const parsed = parseJudgement(answer);
  if (parsed.ok) return { ok: true, judgement: parsed.judgement };
  // Name the keys of what was actually parsed — the wrapper is never the
  // interesting part — and never their values: an unparseable answer still
  // carries probabilities, and this message reaches the caller.
  const shape =
    typeof answer === "object" && answer !== null
      ? Object.keys(answer as Record<string, unknown>).join(", ")
      : typeof answer;
  return {
    ok: false,
    error: `The judge answered in an unexpected shape [${shape}]: ${parsed.errors.join("; ")}`,
  };
}
