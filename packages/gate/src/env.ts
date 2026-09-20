/**
 * What the gate is given at runtime. Everything sensitive is a secret binding:
 * the clauses carry the mandate's thresholds, and the token is the only thing
 * standing between a stranger and an account's inference budget.
 */

/** Workers AI, narrowed to the one call this service makes. */
export type JudgeBinding = { run: (model: string, input: unknown) => Promise<unknown> };

export type RateLimiter = { limit: (options: { key: string }) => Promise<{ success: boolean }> };

export type Env = {
  AI: JudgeBinding;
  /** The mandate's semantic clauses, as a JSON array. Thresholds live here. */
  GATE_CLAUSES?: string;
  /** Price cap and confidence bars for tool selection, as JSON. */
  GATE_SELECTION?: string;
  /** Shared secret every caller must present. Unset means the gate serves nobody. */
  GATE_TOKEN?: string;
  /** The single browser origin allowed to call this gate, if any. */
  GATE_ORIGIN?: string;
  RATE_LIMIT?: RateLimiter;
};
