import { describe, expect, it } from "vitest";
import { fundingMessage as worker } from "../../packages/onramp/src/message";
import { castSignCommand, fundingMessage } from "./fundingMessage";

const CLAIMS = [
  { account: "0xb1c0983a7b84f38fbaf5f3af92f0fecaa62ce25d", chainId: 5042, issuedAt: "2026-09-25T16:30:00.000Z" },
  { account: "0x96B698308B01473E3A0041634B01F652C4608C2A", chainId: 5042002, issuedAt: "2026-01-01T00:00:00.000Z" },
];

describe("fundingMessage", () => {
  it("is byte-identical to the Worker's, or every signature is refused", () => {
    for (const claim of CLAIMS) expect(fundingMessage(claim)).toBe(worker(claim));
  });

  it("gives a cast command whose printf reproduces the message exactly", () => {
    const message = fundingMessage(CLAIMS[0]!);
    const command = castSignCommand(message);
    expect(command.startsWith("cast wallet sign --account device ")).toBe(true);
    const printed = command.match(/printf '(.*)'\)"$/)![1]!.replace(/\\n/g, "\n");
    expect(printed).toBe(message);
  });
});
