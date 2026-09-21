import { describe, expect, it } from "vitest";
import { createIssuer, nextCounter } from "./issuer.js";
import { generateSigner } from "./sign.js";
import { verifyReceipts } from "./verify.js";
import { createMemoryChainReader } from "./chain.js";
import type { Hex } from "./types.js";

const ACCOUNT = `0x${"8f".repeat(20)}` as Hex;
const COMMITMENT = `0x${"4d".repeat(32)}` as Hex;
const GENESIS = `0x${"0c".repeat(32)}` as Hex;
const TX = `0x${"be".repeat(32)}` as Hex;

const issuer = async () => {
  const signer = await generateSigner();
  return createIssuer({
    chainId: 5042,
    account: ACCOUNT,
    mandate: { commitment: COMMITMENT, epoch: 1 },
    agent: { id: `0x${"a7".repeat(32)}`, session: `0x${"22".repeat(16)}`, vision: "relative-only" },
    checks: ["asset_allowlist", "per_action_cap"],
    signer: { publicKey: signer.publicKey, privateKey: signer.privateKey },
    counter: GENESIS,
  });
};

const action = (n: string) => ({
  kind: "swap" as const,
  userOpHash: `0x${n.repeat(32)}` as Hex,
  settledTx: TX,
  at: new Date("2026-09-16T02:14:00.000Z"),
});

describe("nextCounter", () => {
  it("is deterministic", () => {
    expect(nextCounter(GENESIS, TX)).toBe(nextCounter(GENESIS, TX));
  });

  it("changes with the action, the predecessor, and the spend commitment", () => {
    const base = nextCounter(GENESIS, TX);
    expect(nextCounter(GENESIS, `0x${"71".repeat(32)}`)).not.toBe(base);
    expect(nextCounter(`0x${"11".repeat(32)}`, TX)).not.toBe(base);
    expect(nextCounter(GENESIS, TX, `0x${"99".repeat(32)}`)).not.toBe(base);
  });
});

describe("createIssuer", () => {
  it("issues a receipt that starts from the current head", async () => {
    const { receipt, issuer: next } = await (await issuer()).issue(action("71"));
    expect(receipt.counter.prev).toBe(GENESIS);
    expect(receipt.counter.next).toBe(next.counter);
    expect(receipt.chain).toBe(5042);
    expect(receipt.mandate).toEqual({ commitment: COMMITMENT, epoch: 1 });
  });

  /** Issuing must not mutate: two receipts could otherwise claim one position. */
  it("leaves the issuer it was called on untouched", async () => {
    const first = await issuer();
    await first.issue(action("71"));
    expect(first.counter).toBe(GENESIS);
  });

  it("chains consecutive receipts so a verifier sees one sequence", async () => {
    const start = await issuer();
    const one = await start.issue(action("71"));
    const two = await one.issuer.issue(action("72"));

    const chain = createMemoryChainReader(
      {
        mandates: [{ account: ACCOUNT, commitment: COMMITMENT, epoch: 1, revoked: false }],
        transactions: { [TX]: { status: "success" } },
        anchors: [GENESIS],
      },
      5042,
    );

    const report = await verifyReceipts([one.receipt, two.receipt], { chain });
    expect(report.status).toBe("pass");
  });

  it("produces receipts that fail verification if anything is edited", async () => {
    const { receipt } = await (await issuer()).issue(action("71"));
    const tampered = { ...receipt, action: { ...receipt.action, kind: "transfer" as const } };
    const chain = createMemoryChainReader({ mandates: [], transactions: {}, anchors: [] }, 5042);
    const report = await verifyReceipts([tampered], { chain });
    expect(report.receipts[0]?.checks[0]?.status).toBe("fail");
  });
});
