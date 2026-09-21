import { toEventSignature, toFunctionSignature, type Abi, type AbiFunction, type AbiEvent } from "viem";

/**
 * Checks a hand-written ABI against a compiled Foundry artifact.
 *
 * It compares what the EVM actually reads — the function signature, which is
 * the selector, and the types of the outputs — and ignores what it does not:
 * parameter names, and Foundry's `internalType` annotations. A test that also
 * insisted on names would fail every time someone renamed an argument, and
 * would teach people to stop trusting it.
 *
 * Only used by tests, but it lives in `src` so it is typechecked like
 * everything else.
 */

export type ArtifactAbi = readonly unknown[];

type Shape = { readonly signature: string; readonly outputs: readonly string[] };

const typeOf = (parameter: unknown): string => {
  const p = parameter as { type: string; components?: readonly unknown[] };
  if (p.components) return `(${p.components.map(typeOf).join(",")})`;
  return p.type;
};

const shapeOf = (item: AbiFunction): Shape => ({
  signature: toFunctionSignature(item),
  outputs: (item.outputs ?? []).map(typeOf),
});

export type Mismatch = { readonly name: string; readonly reason: string };

/** Every entry of `ours` that the artifact does not have, with the reason. */
export const mismatches = (ours: Abi, artifact: ArtifactAbi): readonly Mismatch[] => {
  const theirFunctions = (artifact as Abi).filter((item): item is AbiFunction => item.type === "function").map(shapeOf);
  const theirEvents = new Set(
    (artifact as Abi).filter((item): item is AbiEvent => item.type === "event").map((item) => toEventSignature(item)),
  );

  const found: Mismatch[] = [];

  for (const item of ours) {
    if (item.type === "function") {
      const mine = shapeOf(item);
      const candidates = theirFunctions.filter((theirs) => theirs.signature === mine.signature);

      if (candidates.length === 0) {
        found.push({ name: mine.signature, reason: "no function with this signature in the compiled contract" });
        continue;
      }
      if (!candidates.some((theirs) => theirs.outputs.join(",") === mine.outputs.join(","))) {
        found.push({
          name: mine.signature,
          reason: `returns ${candidates[0]?.outputs.join(",") || "nothing"}, not ${mine.outputs.join(",") || "nothing"}`,
        });
      }
      continue;
    }

    if (item.type === "event") {
      const signature = toEventSignature(item);
      if (!theirEvents.has(signature)) {
        found.push({ name: signature, reason: "no event with this signature in the compiled contract" });
      }
    }
  }

  return found;
};
