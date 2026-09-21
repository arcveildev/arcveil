import { buildWithdrawInputs, contextFor, deriveNote, poolState, withdrawalFor } from "@arcveil/bridge";
import { describe, expect, it } from "vitest";

import { planSpend, spendFromPayload, SpendPlanError, type SpendTerms } from "./spend";

const SEED = `0x${"ab".repeat(65)}` as const;
const ENTRYPOINT = "0x00000000000000000000000000000000000000c3" as const;

const note = deriveNote(SEED, 0);

const deposit = {
  commitment: 222n,
  label: 20n,
  value: 25_000_000n,
  precommitment: note.precommitment,
  blockNumber: 2n,
  logIndex: 0,
};

const state = poolState(
  [
    { commitment: 111n, label: 10n, value: 1n, precommitment: 1n, blockNumber: 1n, logIndex: 0 },
    deposit,
    { commitment: 333n, label: 30n, value: 1n, precommitment: 3n, blockNumber: 3n, logIndex: 0 },
  ],
  [
    { index: 1n, leaf: 111n },
    { index: 2n, leaf: 222n },
    { index: 3n, leaf: 333n },
  ],
);

const owned = { note, deposit };

const terms: SpendTerms = {
  entrypoint: ENTRYPOINT,
  recipient: "0x00000000000000000000000000000000000000A1",
  feeRecipient: "0x00000000000000000000000000000000000000b2",
  relayFeeBPS: 25n,
  scope: 777n,
};

describe("planning a spend", () => {
  it("tells the page which leaf it is about to prove, out of how many", () => {
    const plan = planSpend(state, owned, 10_000_000n, terms, SEED, 1);

    expect(plan.leafIndex).toBe(1);
    expect(plan.leafCount).toBe(3);
    expect(plan.anonymitySet).toBe(3);
  });

  it("binds the proof to this recipient, this fee and this pool", () => {
    const plan = planSpend(state, owned, 10_000_000n, terms, SEED, 1);
    const expected = contextFor(
      withdrawalFor(ENTRYPOINT, {
        recipient: terms.recipient,
        feeRecipient: terms.feeRecipient,
        relayFeeBPS: terms.relayFeeBPS,
      }),
      terms.scope,
    );

    expect(plan.context).toBe(expected);
  });

  it("refuses to spend more than the deposit holds", () => {
    expect(() => planSpend(state, owned, 26_000_000n, terms, SEED, 1)).toThrow(SpendPlanError);
  });

  it("refuses a withdrawal of nothing", () => {
    expect(() => planSpend(state, owned, 0n, terms, SEED, 1)).toThrow(/has to move something/);
  });

  it("refuses to reuse the spent note as its own change", () => {
    expect(() => planSpend(state, owned, 10_000_000n, terms, SEED, 0)).toThrow(/has not used/);
  });

  it("refuses a deposit whose label the association set has not admitted", () => {
    const unadmitted = poolState(
      [{ ...deposit, label: 99n }],
      [
        { index: 1n, leaf: 111n },
        { index: 2n, leaf: 222n },
      ],
    );
    const elsewhere = { note, deposit: { ...deposit, label: 77n } };

    expect(() => planSpend(unadmitted, elsewhere, 1n, terms, SEED, 1)).toThrow(/not in this tree/);
  });
});

describe("crossing into the worker", () => {
  const plan = planSpend(state, owned, 10_000_000n, terms, SEED, 1);

  it("carries no bigint, because postMessage does not reliably carry one", () => {
    const values = Object.values(plan.payload).flat();
    expect(values.every((value) => typeof value !== "bigint")).toBe(true);
  });

  it("survives a structured-clone round trip unchanged", () => {
    const cloned = JSON.parse(JSON.stringify(plan.payload));
    expect(spendFromPayload(cloned)).toEqual(spendFromPayload(plan.payload));
  });

  it("rebuilds inputs the circuit will accept", () => {
    const inputs = buildWithdrawInputs(spendFromPayload(plan.payload));

    expect(inputs.withdrawnValue).toBe(10_000_000n);
    expect(inputs.existingValue).toBe(25_000_000n);
    expect(inputs.existingNullifier).toBe(note.nullifier);
    expect(inputs.context).toBe(plan.context);
    expect(inputs.stateRoot).toBe(BigInt(plan.payload.stateRoot));
    expect(inputs.stateSiblings).toHaveLength(32);
  });

  it("keeps the leaf, which the input builder refuses to go without", () => {
    expect(BigInt(plan.payload.stateLeaf)).toBe(222n);
    expect(spendFromPayload(plan.payload).stateWitness.leaf).toBe(222n);
  });
});
