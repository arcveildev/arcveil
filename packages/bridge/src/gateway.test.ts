import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Abi } from "viem";
import { describe, expect, it } from "vitest";

import { mismatches } from "./abi-check";
import { VEIL_GATEWAY_ABI } from "./gateway";

/**
 * `VeilGateway` is ours, so this catches the ABI and the contract drifting
 * apart in either direction. Needs `cd contracts && forge build`.
 */
const ARTIFACT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../contracts/out/VeilGateway.sol/VeilGateway.json",
);

const artifact = (): { abi: readonly unknown[] } => JSON.parse(readFileSync(ARTIFACT, "utf8"));

describe.skipIf(!existsSync(ARTIFACT))("VeilGateway ABI", () => {
  it("matches the compiled contract", () => {
    expect(mismatches(VEIL_GATEWAY_ABI as unknown as Abi, artifact().abi)).toEqual([]);
  });

  it("still gives nobody a way to take funds out of the gateway", () => {
    // The gateway holds money only inside a single transaction. An owner, a
    // pause or a sweep appearing here would end that, quietly.
    const names = (artifact().abi as { type: string; name?: string }[])
      .filter((entry) => entry.type === "function")
      .map((entry) => entry.name ?? "")
      .sort();

    expect(names).toEqual(["ENTRYPOINT", "TOKEN_MESSENGER", "TRANSMITTER", "USDC", "ragequit", "refundOf", "relay"]);
  });
});
