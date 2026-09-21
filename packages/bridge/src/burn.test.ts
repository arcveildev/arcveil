import { decodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";

import { approveCall, burnCall, ERC20_APPROVE_ABI, TOKEN_MESSENGER_V2_ABI } from "./burn";
import { decodeVeilHook } from "./hook";
import { ARC_DOMAIN, FINALITY, routeFor } from "./routes";

const BASE = routeFor(8453)!;
const GATEWAY = "0x00000000000000000000000000000000000060A7" as const;
const REFUND = "0x000000000000000000000000000000000000FEeD" as const;
const AMOUNT = 25_000_000n;

const decodeBurn = (data: `0x${string}`) =>
  decodeFunctionData({ abi: TOKEN_MESSENGER_V2_ABI, data }) as {
    functionName: "depositForBurnWithHook";
    args: readonly [bigint, number, `0x${string}`, `0x${string}`, `0x${string}`, bigint, number, `0x${string}`];
  };

describe("burn", () => {
  it("approves the token messenger, not the gateway", () => {
    const call = approveCall({ route: BASE, amount: AMOUNT });

    expect(call.to).toBe(BASE.usdc);
    const { args } = decodeFunctionData({ abi: ERC20_APPROVE_ABI, data: call.data });
    expect(args).toEqual([BASE.tokenMessenger, AMOUNT]);
  });

  it("sends the burn to Arc, addressed to the gateway", () => {
    const { args } = decodeBurn(burnCall({ route: BASE, amount: AMOUNT, gateway: GATEWAY, hook: { precommitment: 7n, refund: REFUND } }).data);
    const [amount, domain, mintRecipient, burnToken] = args;

    expect(amount).toBe(AMOUNT);
    expect(domain).toBe(ARC_DOMAIN);
    expect(burnToken).toBe(BASE.usdc);
    expect(mintRecipient.toLowerCase()).toBe(`0x${"0".repeat(24)}${GATEWAY.slice(2)}`.toLowerCase());
  });

  it("names the gateway as the only address that may deliver the message", () => {
    // Without this, anyone could call receiveMessage and mint into the gateway
    // with no deposit behind it, stranding the funds.
    const { args } = decodeBurn(burnCall({ route: BASE, amount: AMOUNT, gateway: GATEWAY, hook: { precommitment: 7n, refund: REFUND } }).data);
    const [, , mintRecipient, , destinationCaller] = args;

    expect(destinationCaller).toBe(mintRecipient);
  });

  it("carries the hook the gateway will read back", () => {
    const hook = { precommitment: 99n, refund: REFUND };
    const { args } = decodeBurn(burnCall({ route: BASE, amount: AMOUNT, gateway: GATEWAY, hook }).data);

    expect(decodeVeilHook(args[7])).toEqual(hook);
  });

  it("defaults to standard finality and no fee", () => {
    const { args } = decodeBurn(burnCall({ route: BASE, amount: AMOUNT, gateway: GATEWAY, hook: { precommitment: 1n, refund: REFUND } }).data);
    const [, , , , , maxFee, finality] = args;

    expect(maxFee).toBe(0n);
    expect(finality).toBe(FINALITY.standard);
  });

  it("passes a fast transfer's fee through", () => {
    const { args } = decodeBurn(
      burnCall({
        route: BASE,
        amount: AMOUNT,
        gateway: GATEWAY,
        hook: { precommitment: 1n, refund: REFUND },
        maxFee: 2_500n,
        finality: FINALITY.fast,
      }).data,
    );

    expect(args[5]).toBe(2_500n);
    expect(args[6]).toBe(FINALITY.fast);
  });

  it("refuses to build a burn around an unusable hook", () => {
    expect(() =>
      burnCall({ route: BASE, amount: AMOUNT, gateway: GATEWAY, hook: { precommitment: 0n, refund: REFUND } }),
    ).toThrow(/field/);
  });
});
