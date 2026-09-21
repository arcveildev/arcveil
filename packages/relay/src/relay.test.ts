import { contextFor, withdrawalFor, type RelayData } from "@arcveil/bridge";
import { describe, expect, it } from "vitest";

import type { Config } from "./env";
import { check } from "./relay";
import type { WithdrawRequest } from "./schema";

const ENTRYPOINT = "0x00000000000000000000000000000000000000c3" as const;
const RECIPIENT = "0x00000000000000000000000000000000000000A1" as const;
const FEE_RECIPIENT = "0x00000000000000000000000000000000000000b2" as const;

const config: Config = {
  rpc: "https://rpc.mainnet.arc.io",
  entrypoint: ENTRYPOINT,
  gateway: "0x00000000000000000000000000000000000060A7",
  scope: 777n,
  key: `0x${"11".repeat(32)}`,
  minFeeBps: 25n,
};

const proofWith = (withdrawnValue: bigint, context: bigint): WithdrawRequest["proof"] => ({
  pA: [0n, 0n],
  pB: [
    [0n, 0n],
    [0n, 0n],
  ],
  pC: [0n, 0n],
  pubSignals: [1n, 2n, withdrawnValue, 4n, 5n, 6n, 7n, context],
});

const requestFor = (relay: RelayData, withdrawnValue = 1_000_000n): WithdrawRequest => ({
  recipient: relay.recipient,
  relayFeeBPS: relay.relayFeeBPS,
  proof: proofWith(withdrawnValue, contextFor(withdrawalFor(ENTRYPOINT, relay), config.scope)),
});

const relay: RelayData = { recipient: RECIPIENT, feeRecipient: FEE_RECIPIENT, relayFeeBPS: 25n };

describe("what the relayer checks before it signs anything", () => {
  it("accepts a withdrawal whose proof was made for it", () => {
    const result = check(requestFor(relay), config, FEE_RECIPIENT);
    expect(result.ok).toBe(true);
  });

  it("refuses to work below its own fee", () => {
    const cheap = { ...relay, relayFeeBPS: 5n };
    const result = check(requestFor(cheap), config, FEE_RECIPIENT);

    expect(result).toMatchObject({ ok: false, status: 402 });
  });

  it("refuses a withdrawal of nothing", () => {
    const result = check(requestFor(relay, 0n), config, FEE_RECIPIENT);
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it("refuses a proof made for a different recipient", () => {
    // The request says pay A1; the proof was made to pay b2. The pool would
    // reject this, and the relayer should not pay to find that out.
    const request = { ...requestFor({ ...relay, recipient: FEE_RECIPIENT }), recipient: RECIPIENT };
    const result = check(request, config, FEE_RECIPIENT);

    expect(result).toMatchObject({ ok: false, status: 400 });
    expect(result.ok === false && result.error).toMatch(/not made for this withdrawal/);
  });

  it("refuses a proof made for a different fee, so it cannot quietly overcharge", () => {
    const request = { ...requestFor({ ...relay, relayFeeBPS: 25n }), relayFeeBPS: 100n };
    expect(check(request, config, FEE_RECIPIENT)).toMatchObject({ ok: false, status: 400 });
  });

  it("refuses a proof made for a different relayer", () => {
    const stranger = "0x00000000000000000000000000000000000000c9" as const;
    expect(check(requestFor(relay), config, stranger)).toMatchObject({ ok: false, status: 400 });
  });

  it("refuses a proof made against another pool", () => {
    const otherScope = { ...config, scope: 778n };
    expect(check(requestFor(relay), otherScope, FEE_RECIPIENT)).toMatchObject({ ok: false, status: 400 });
  });
});
