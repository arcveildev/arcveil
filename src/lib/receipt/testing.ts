/** Fixtures shared by the unit tests. Not imported by application code. */
import { createMemoryChainReader, type ChainReader, type MandateRecord, type TxRecord } from "./chain";
import { generateSigner, issueReceipt, type Signer } from "./sign";
import type { CheckId, CheckResult, Hex, Receipt, ReceiptDraft, VerificationReport } from "./types";

const byte = (value: string, bytes: number): Hex => `0x${value.repeat(bytes)}`;

export const ACCOUNT: Hex = byte("8f", 20);
export const COMMITMENT: Hex = byte("4d", 32);
export const COUNTER_PREV: Hex = byte("0c", 32);
export const COUNTER_NEXT: Hex = byte("7e", 32);
export const SETTLED_TX: Hex = byte("be", 32);

let cached: Promise<Signer> | null = null;
export const testSigner = (): Promise<Signer> => (cached ??= generateSigner());

export async function draftFixture(overrides: Partial<ReceiptDraft> = {}): Promise<ReceiptDraft> {
  const signer = await testSigner();
  return {
    v: 1,
    chain: 4663,
    account: ACCOUNT,
    mandate: { commitment: COMMITMENT, epoch: 7 },
    agent: { id: byte("a7", 32), session: byte("22", 16), vision: "relative-only" },
    action: { kind: "swap", userOpHash: byte("71", 32), settledTx: SETTLED_TX, at: "2026-09-13T21:14:02.000Z" },
    checks: ["asset_allowlist", "per_action_cap", "window_spend", "active_hours", "killswitch_clear"],
    counter: { prev: COUNTER_PREV, next: COUNTER_NEXT },
    proof: { type: "attestation", signer: signer.publicKey },
    ...overrides,
  };
}

export const receiptFixture = async (overrides: Partial<ReceiptDraft> = {}): Promise<Receipt> =>
  issueReceipt(await draftFixture(overrides), (await testSigner()).privateKey);

export const issueFixture = receiptFixture;

type ChainOptions = {
  mandate?: Partial<MandateRecord>;
  epoch?: number;
  revoked?: boolean;
  anchors?: readonly Hex[];
  tx?: TxRecord | null;
};

export function chainFixture(options: ChainOptions = {}): ChainReader {
  const mandate: MandateRecord = {
    account: ACCOUNT,
    commitment: COMMITMENT,
    epoch: options.epoch ?? 7,
    revoked: options.revoked ?? false,
    ...options.mandate,
  };
  const tx = options.tx === undefined ? ({ status: "success" } as TxRecord) : options.tx;
  return createMemoryChainReader({
    mandates: [mandate],
    transactions: tx === null ? {} : { [SETTLED_TX.toLowerCase()]: tx },
    anchors: options.anchors ?? [COUNTER_PREV],
  });
}

export const checkOf = (report: VerificationReport, id: CheckId): CheckResult => {
  const check = report.receipts[0]?.checks.find((c) => c.id === id);
  if (check === undefined) throw new Error(`Report has no ${id} check`);
  return check;
};
