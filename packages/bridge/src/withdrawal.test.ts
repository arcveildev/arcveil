import { describe, expect, it } from "vitest";

import {
  amountAfterFee,
  contextFor,
  encodeRelayData,
  signal,
  withdrawalFor,
  type WithdrawProof,
} from "./withdrawal";

const RECIPIENT = "0x00000000000000000000000000000000000000A1" as const;
const FEE_RECIPIENT = "0x00000000000000000000000000000000000000b2" as const;
const ENTRYPOINT = "0x00000000000000000000000000000000000000c3" as const;

const RELAY = { recipient: RECIPIENT, feeRecipient: FEE_RECIPIENT, relayFeeBPS: 25n };

describe("withdrawal encoding agrees with the contracts", () => {
  /** Both printed by `contracts/test/Context.t.sol`. */
  const SOLIDITY_RELAY_DATA =
    "0x00000000000000000000000000000000000000000000000000000000000000a100000000000000000000000000000000000000000000000000000000000000b20000000000000000000000000000000000000000000000000000000000000019";
  const SOLIDITY_CONTEXT = 21504420942955024632172173956441898852626370613834229310629217171243911247320n;

  it("encodes RelayData the way the Entrypoint decodes it", () => {
    expect(encodeRelayData(RELAY)).toBe(SOLIDITY_RELAY_DATA);
  });

  it("computes the same context the pool recomputes", () => {
    expect(contextFor(withdrawalFor(ENTRYPOINT, RELAY), 777n)).toBe(SOLIDITY_CONTEXT);
  });

  it("binds the recipient: change it and the proof no longer fits", () => {
    const elsewhere = { ...RELAY, recipient: FEE_RECIPIENT };
    expect(contextFor(withdrawalFor(ENTRYPOINT, elsewhere), 777n)).not.toBe(SOLIDITY_CONTEXT);
  });

  it("binds the fee: a relayer cannot pay itself more than the proof allows", () => {
    const greedy = { ...RELAY, relayFeeBPS: 500n };
    expect(contextFor(withdrawalFor(ENTRYPOINT, greedy), 777n)).not.toBe(SOLIDITY_CONTEXT);
  });

  it("binds the scope, so a proof for one pool is useless against another", () => {
    expect(contextFor(withdrawalFor(ENTRYPOINT, RELAY), 778n)).not.toBe(SOLIDITY_CONTEXT);
  });
});

describe("public signals", () => {
  const proof: WithdrawProof = {
    pA: [0n, 0n],
    pB: [
      [0n, 0n],
      [0n, 0n],
    ],
    pC: [0n, 0n],
    pubSignals: [10n, 11n, 12n, 13n, 14n, 15n, 16n, 17n],
  };

  it("reads each signal at the index the contract reads it", () => {
    expect(signal(proof, "newCommitmentHash")).toBe(10n);
    expect(signal(proof, "existingNullifierHash")).toBe(11n);
    expect(signal(proof, "withdrawnValue")).toBe(12n);
    expect(signal(proof, "stateRoot")).toBe(13n);
    expect(signal(proof, "ASPRoot")).toBe(15n);
    expect(signal(proof, "context")).toBe(17n);
  });
});

describe("fees", () => {
  it("matches the Entrypoint's rounding, which favours the recipient", () => {
    // _afterFees = amount - ((amount * bps) / 10_000), integer division.
    expect(amountAfterFee(1_000_000n, 25n)).toBe(997_500n);
    expect(amountAfterFee(1n, 25n)).toBe(1n);
    expect(amountAfterFee(100_000_000n, 0n)).toBe(100_000_000n);
  });
});
