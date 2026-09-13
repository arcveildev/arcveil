import { describe, expect, it } from "vitest";
import { computeReceiptId } from "./canonical";
import { generateSigner, issueReceipt } from "./sign";
import { verifyReceipts } from "./verify";
import { checkOf, chainFixture, draftFixture, receiptFixture, testSigner } from "./testing";
import type { ChainReader } from "./chain";
import type { Receipt } from "./types";

const report = (receipts: readonly Receipt[], chain: ChainReader = chainFixture()) =>
  verifyReceipts(receipts, { chain });

describe("verifyReceipts", () => {
  it("passes every check for an untouched receipt", async () => {
    const result = await report([await receiptFixture()]);
    expect(result.status).toBe("pass");
    expect(result.receipts[0].checks.map((c) => c.status)).toEqual(["pass", "pass", "pass", "pass", "pass"]);
  });

  it("fails integrity and signature when a field is edited after signing", async () => {
    const receipt = await receiptFixture();
    const tampered = { ...receipt, action: { ...receipt.action, kind: "transfer" as const } };
    const result = await report([tampered]);
    expect(checkOf(result, "integrity").status).toBe("fail");
    expect(checkOf(result, "signature").status).toBe("fail");
    expect(result.status).toBe("fail");
  });

  it("fails the signature when the body was signed by another key", async () => {
    const other = await generateSigner();
    const draft = await draftFixture({ proof: { type: "attestation", signer: other.publicKey } });
    const signed = await issueReceipt(draft, other.privateKey);
    if (signed.proof.type !== "attestation") throw new Error("expected an attestation receipt");
    const stolen: Receipt = { ...signed, proof: { ...signed.proof, signer: (await testSigner()).publicKey } };
    expect(checkOf(await report([stolen]), "signature").status).toBe("fail");
  });

  it("reports an unknown signature for a zk proof until that verifier ships", async () => {
    const receipt = await receiptFixture();
    const body = { ...receipt, proof: { type: "zk" as const, system: "groth16-bn254", data: "0xabcd" as const } };
    const zk: Receipt = { ...body, id: await computeReceiptId(body) };
    const result = await report([zk]);
    expect(checkOf(result, "signature").status).toBe("unknown");
    expect(result.status).toBe("unknown");
  });

  it("fails when the mandate commitment does not match the chain", async () => {
    const chain = chainFixture({ mandate: { commitment: `0x${"11".repeat(32)}` } });
    expect(checkOf(await report([await receiptFixture()], chain), "mandate").status).toBe("fail");
  });

  it("fails when the mandate was revoked", async () => {
    expect(checkOf(await report([await receiptFixture()], chainFixture({ revoked: true })), "mandate").status).toBe("fail");
  });

  it("fails when that mandate epoch is unknown on chain", async () => {
    expect(checkOf(await report([await receiptFixture()], chainFixture({ epoch: 9 })), "mandate").status).toBe("fail");
  });

  it("links consecutive receipts through the counter commitments", async () => {
    const first = await receiptFixture();
    const second = await receiptFixture({ counter: { prev: first.counter.next, next: `0x${"ab".repeat(32)}` } });
    expect((await report([first, second])).status).toBe("pass");
  });

  it("fails linkage when a receipt is missing from the sequence", async () => {
    const first = await receiptFixture();
    const second = await receiptFixture({ counter: { prev: `0x${"cd".repeat(32)}`, next: `0x${"ab".repeat(32)}` } });
    const result = await report([first, second]);
    expect(result.receipts[1].checks.find((c) => c.id === "linkage")?.status).toBe("fail");
  });

  it("cannot judge linkage of a lone receipt whose predecessor is unknown", async () => {
    expect(checkOf(await report([await receiptFixture()], chainFixture({ anchors: [] })), "linkage").status).toBe("unknown");
  });

  it("fails settlement when the transaction reverted", async () => {
    const chain = chainFixture({ tx: { status: "failed" } });
    expect(checkOf(await report([await receiptFixture()], chain), "settlement").status).toBe("fail");
  });

  it("reports unknown settlement when the transaction is not visible yet", async () => {
    const result = await report([await receiptFixture()], chainFixture({ tx: null }));
    expect(checkOf(result, "settlement").status).toBe("unknown");
    expect(result.status).toBe("unknown");
  });

  it("reports a chain reader failure instead of throwing", async () => {
    const chain: ChainReader = {
      ...chainFixture(),
      getTransaction: async () => {
        throw new Error("rpc down");
      },
    };
    const result = await report([await receiptFixture()], chain);
    expect(checkOf(result, "settlement").status).toBe("unknown");
    expect(checkOf(result, "settlement").detail).toMatch(/rpc down/);
  });
});
