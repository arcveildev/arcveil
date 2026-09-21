import { poseidon1, poseidon2, poseidon3 } from "poseidon-lite";
import { describe, expect, it } from "vitest";

import { SNARK_SCALAR_FIELD } from "./hook";
import { commitmentOf, deriveNote, deriveNotes, nullifierHashOf, veilKeyTypedData } from "./note";

const SIGNATURE = `0x${"ab".repeat(65)}` as const;
const GATEWAY = "0x00000000000000000000000000000000000060A7" as const;

describe("poseidon agrees with the contracts", () => {
  /**
   * Printed by `contracts/test/Poseidon.t.sol` from the same PoseidonT3/T4
   * libraries the pool links against. If these ever disagree, a note hashed
   * here produces a commitment the pool never inserted, and the funds behind
   * it cannot be withdrawn — so this is the most load-bearing test in the
   * package, and it is checked against another language on purpose.
   */
  it.each([
    [() => poseidon2([1n, 2n]), 7853200120776062878684798364095072458815029376092732009249414926327459813530n],
    [() => poseidon2([0n, 0n]), 14744269619966411208579211824598458697587494354926760081771325075741142829156n],
    [() => poseidon3([1n, 2n, 3n]), 6542985608222806190361240322586112750744169038454362455181422643027100751666n],
  ])("matches the Solidity vector %#", (compute, expected) => {
    expect(compute()).toBe(expected);
  });

  it("matches the Solidity vector for a whole commitment", () => {
    const precommitment = poseidon2([0x1111111111111111n, 0x2222222222222222n]);
    expect(precommitment).toBe(21294499990090944863352450547678259116864572907356590076767707706273626362443n);
    expect(commitmentOf(25_000_000n, 0x3333333333333333n, precommitment)).toBe(
      19456953432299417523882103241733576356917866914932637851205618695889826261915n,
    );
  });
});

describe("notes", () => {
  it("derives the same note from the same signature, every time", () => {
    expect(deriveNote(SIGNATURE, 0)).toEqual(deriveNote(SIGNATURE, 0));
  });

  it("gives every index a different note", () => {
    const notes = deriveNotes(SIGNATURE, 8);
    const nullifiers = new Set(notes.map((note) => note.nullifier));
    const secrets = new Set(notes.map((note) => note.secret));

    expect(nullifiers.size).toBe(8);
    expect(secrets.size).toBe(8);
  });

  it("never reuses a nullifier as a secret", () => {
    const note = deriveNote(SIGNATURE, 3);
    expect(note.nullifier).not.toBe(note.secret);
  });

  it("changes completely when the signature changes", () => {
    const other = `0x${"cd".repeat(65)}` as const;
    expect(deriveNote(other, 0).nullifier).not.toBe(deriveNote(SIGNATURE, 0).nullifier);
  });

  it("stays inside the scalar field", () => {
    for (const note of deriveNotes(SIGNATURE, 32)) {
      expect(note.nullifier).toBeGreaterThan(0n);
      expect(note.secret).toBeGreaterThan(0n);
      expect(note.nullifier).toBeLessThan(SNARK_SCALAR_FIELD);
      expect(note.secret).toBeLessThan(SNARK_SCALAR_FIELD);
      expect(note.precommitment).toBeLessThan(SNARK_SCALAR_FIELD);
    }
  });

  it("commits to the precommitment the circuit would compute", () => {
    const note = deriveNote(SIGNATURE, 5);
    expect(note.precommitment).toBe(poseidon2([note.nullifier, note.secret]));
  });

  it("refuses a nonsense index rather than deriving a surprise note", () => {
    expect(() => deriveNote(SIGNATURE, -1)).toThrow(RangeError);
    expect(() => deriveNote(SIGNATURE, 1.5)).toThrow(RangeError);
  });

  it("hashes a nullifier with Poseidon(1), as the circuit does", () => {
    expect(nullifierHashOf(1n)).toBe(poseidon1([1n]));
    // Not the same as hashing it with anything else, which is the mistake worth catching.
    expect(nullifierHashOf(1n)).not.toBe(poseidon2([1n, 0n]));
  });
});

describe("veil key", () => {
  it("binds the signature to one chain and one gateway", () => {
    const mainnet = veilKeyTypedData(5042, GATEWAY);
    const testnet = veilKeyTypedData(5_042_002, GATEWAY);

    expect(mainnet.domain.chainId).toBe(5042);
    expect(mainnet.domain.verifyingContract).toBe(GATEWAY);
    expect(testnet.domain.chainId).not.toBe(mainnet.domain.chainId);
  });

  it("says out loud what signing it costs", () => {
    expect(veilKeyTypedData(5042, GATEWAY).message.warning).toMatch(/can spend/i);
  });
});
