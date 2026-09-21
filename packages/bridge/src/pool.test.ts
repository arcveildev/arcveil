import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Abi } from "viem";
import { describe, expect, it } from "vitest";

import { mismatches } from "./abi-check";
import { ENTRYPOINT_ABI, POOL_ABI } from "./pool";

/**
 * The vendored contracts are not ours to change, so drift between these
 * hand-written ABIs and the compiled artifacts is a mistake in `pool.ts`.
 * Needs `cd contracts && forge build`; skips without it.
 */
const out = (name: string) => join(dirname(fileURLToPath(import.meta.url)), `../../../contracts/out/${name}`);

const ENTRYPOINT = out("Entrypoint.sol/Entrypoint.json");
const POOL = out("PrivacyPoolComplex.sol/PrivacyPoolComplex.json");

const abiOf = (path: string): readonly unknown[] => JSON.parse(readFileSync(path, "utf8")).abi;

describe.skipIf(!existsSync(ENTRYPOINT))("Entrypoint ABI", () => {
  it("matches the compiled artifact", () => {
    expect(mismatches(ENTRYPOINT_ABI as unknown as Abi, abiOf(ENTRYPOINT))).toEqual([]);
  });
});

describe.skipIf(!existsSync(POOL))("PrivacyPool ABI", () => {
  it("matches the compiled artifact", () => {
    expect(mismatches(POOL_ABI as unknown as Abi, abiOf(POOL))).toEqual([]);
  });
});
