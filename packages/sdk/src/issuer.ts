import { concatHex, keccak256 } from "viem";
import { issueReceipt } from "./sign";
import type { ActionKind, Hex, Receipt } from "./types";

const ZERO_COMMITMENT: Hex = `0x${"00".repeat(32)}`;

/**
 * Advances the budget chain. Each step binds the previous commitment to the
 * action, so receipts form a sequence in which a missing one leaves a gap.
 *
 * `spendCommitment` is where cumulative budget use enters, and the SDK cannot
 * compute it: receipts carry no amounts, and the numbers live inside the
 * enclave. Pass it from there when you have it; omit it and the chain still
 * binds order and completeness, just not spend.
 */
export const nextCounter = (previous: Hex, actionHash: Hex, spendCommitment: Hex = ZERO_COMMITMENT): Hex =>
  keccak256(concatHex([previous, actionHash, spendCommitment]));

export type ActionInput = {
  kind: ActionKind;
  userOpHash: Hex;
  settledTx: Hex;
  at?: Date;
  spendCommitment?: Hex;
};

export type IssuerConfig = {
  chainId: number;
  account: Hex;
  mandate: { commitment: Hex; epoch: number };
  agent: { id: Hex; session: Hex; vision: "relative-only" | "absolute" };
  /** Names of the clauses that were evaluated. Their thresholds stay in the mandate. */
  checks: readonly string[];
  /** Set when any of those clauses was semantic. See `judgeCommitment`. */
  judge?: { model: string; commitment: Hex };
  signer: { publicKey: Hex; privateKey: CryptoKey };
  /** Head of the budget chain — the last anchored commitment. */
  counter: Hex;
};

export type Issuance = { receipt: Receipt; issuer: Issuer };

export type Issuer = {
  readonly counter: Hex;
  issue: (action: ActionInput) => Promise<Issuance>;
};

/**
 * Issuing advances the chain, so `issue` hands back the next issuer rather than
 * mutating this one: two receipts can never accidentally claim the same
 * position, and a caller that drops the new issuer notices immediately.
 */
export function createIssuer(config: IssuerConfig): Issuer {
  return {
    counter: config.counter,
    issue: async (action) => {
      const next = nextCounter(config.counter, action.userOpHash, action.spendCommitment);
      const receipt = await issueReceipt(
        {
          v: 1,
          chain: config.chainId,
          account: config.account,
          mandate: config.mandate,
          agent: config.agent,
          action: {
            kind: action.kind,
            userOpHash: action.userOpHash,
            settledTx: action.settledTx,
            at: (action.at ?? new Date()).toISOString(),
          },
          checks: config.checks,
          ...(config.judge === undefined ? {} : { judge: config.judge }),
          counter: { prev: config.counter, next },
          proof: { type: "attestation", signer: config.signer.publicKey },
        },
        config.signer.privateKey,
      );
      return { receipt, issuer: createIssuer({ ...config, counter: next }) };
    },
  };
}
