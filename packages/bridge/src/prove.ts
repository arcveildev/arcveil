import type { Note } from "./note";
import type { MerkleWitness } from "./tree";
import type { WithdrawProof } from "./withdrawal";

/**
 * Building the zero-knowledge proof that spends a note.
 *
 * The proof says: *I know the secrets behind a commitment in this state tree,
 * whose label is in this association set, and I am moving this much of it to
 * the withdrawal this context describes.* It says nothing about which
 * commitment, which deposit, or who made it.
 *
 * Proving runs where the secrets are and nowhere else. The inputs below never
 * leave the device: a relayer receives the proof and the public signals, which
 * is everything it needs and nothing it can trace.
 */

/** Exactly the signals `withdraw.circom` declares, in its names, not ours. */
export type WithdrawInputs = {
  readonly withdrawnValue: bigint;
  readonly stateRoot: bigint;
  readonly stateTreeDepth: bigint;
  readonly ASPRoot: bigint;
  readonly ASPTreeDepth: bigint;
  readonly context: bigint;
  readonly label: bigint;
  readonly existingValue: bigint;
  readonly existingNullifier: bigint;
  readonly existingSecret: bigint;
  readonly newNullifier: bigint;
  readonly newSecret: bigint;
  readonly stateSiblings: readonly bigint[];
  readonly stateIndex: bigint;
  readonly ASPSiblings: readonly bigint[];
  readonly ASPIndex: bigint;
};

export type SpendRequest = {
  /** The note being spent. */
  readonly note: Note;
  /** A fresh note that will hold the remainder. Never the same as `note`. */
  readonly change: Note;
  /** The label the pool gave this deposit. Read from its `Deposited` event. */
  readonly label: bigint;
  /** What the commitment is currently worth. */
  readonly existingValue: bigint;
  /** How much of it to take out. The rest lives on in `change`. */
  readonly withdrawnValue: bigint;
  readonly stateWitness: MerkleWitness;
  readonly aspWitness: MerkleWitness;
  /** `contextFor(withdrawal, scope)` — what binds this proof to one withdrawal. */
  readonly context: bigint;
};

export class SpendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpendError";
  }
}

/**
 * @dev The checks here are the circuit's own constraints, restated where a
 *      person can read the failure. Left to the circuit they surface as
 *      "Assert Failed" after a few seconds of proving, which tells the user
 *      nothing about what they did.
 */
export const buildWithdrawInputs = (request: SpendRequest): WithdrawInputs => {
  const { note, change, existingValue, withdrawnValue } = request;

  if (withdrawnValue <= 0n) throw new SpendError("A withdrawal has to move something.");
  if (withdrawnValue > existingValue) {
    throw new SpendError(`This note holds ${existingValue}; it cannot pay out ${withdrawnValue}.`);
  }
  if (note.nullifier === change.nullifier) {
    throw new SpendError("The change note must be a different note, or the circuit refuses the spend.");
  }
  if (request.stateWitness.leaf === 0n) throw new SpendError("The state witness has no leaf.");

  return {
    withdrawnValue,
    stateRoot: request.stateWitness.root,
    stateTreeDepth: BigInt(request.stateWitness.depth),
    ASPRoot: request.aspWitness.root,
    ASPTreeDepth: BigInt(request.aspWitness.depth),
    context: request.context,
    label: request.label,
    existingValue,
    existingNullifier: note.nullifier,
    existingSecret: note.secret,
    newNullifier: change.nullifier,
    newSecret: change.secret,
    stateSiblings: request.stateWitness.siblings,
    stateIndex: BigInt(request.stateWitness.index),
    ASPSiblings: request.aspWitness.siblings,
    ASPIndex: BigInt(request.aspWitness.index),
  };
};

/** snarkjs's shape, before it is put into the one the contract takes. */
export type SnarkjsProof = {
  readonly pi_a: readonly string[];
  readonly pi_b: readonly (readonly string[])[];
  readonly pi_c: readonly string[];
};

/**
 * Converts a snarkjs proof into the contract's argument shape.
 *
 * @dev `pB`'s coordinate pairs are **swapped**. Solidity's pairing precompile
 *      reads Fp2 elements in the opposite order to snarkjs's JSON, and getting
 *      it wrong produces a proof that is well formed, costs a full
 *      verification, and always returns false. It is the single easiest
 *      mistake to make here, which is why `prove.test.ts` pins the conversion
 *      against snarkjs's own `exportSolidityCallData`.
 */
export const toSolidityProof = (proof: SnarkjsProof, publicSignals: readonly string[]): WithdrawProof => {
  if (publicSignals.length !== 8) {
    throw new SpendError(`expected 8 public signals, got ${publicSignals.length}`);
  }

  const at = (row: readonly string[], index: number): bigint => BigInt(row[index] as string);
  const b = (row: number): readonly [bigint, bigint] => {
    const pair = proof.pi_b[row] as readonly string[];
    return [BigInt(pair[1] as string), BigInt(pair[0] as string)];
  };

  return {
    pA: [at(proof.pi_a, 0), at(proof.pi_a, 1)],
    pB: [b(0), b(1)],
    pC: [at(proof.pi_c, 0), at(proof.pi_c, 1)],
    pubSignals: publicSignals.map((signal) => BigInt(signal)) as unknown as WithdrawProof["pubSignals"],
  };
};

/** The circuit artifacts, as bytes. Both are fetched and verified before use. */
export type Artifacts = { readonly wasm: Uint8Array; readonly zkey: Uint8Array };

/** Only the part of snarkjs this module uses, so it can be injected and mocked. */
export type Groth16 = {
  fullProve: (
    input: Record<string, unknown>,
    wasm: Uint8Array | string,
    zkey: Uint8Array | string,
  ) => Promise<{ proof: SnarkjsProof; publicSignals: string[] }>;
};

/**
 * Proves a spend.
 *
 * @param groth16 Injected rather than imported so the 1 MB prover is loaded
 *        only when someone actually withdraws, and so tests can run without it.
 */
export const proveWithdrawal = async (
  request: SpendRequest,
  artifacts: Artifacts,
  groth16: Groth16,
): Promise<WithdrawProof> => {
  const inputs = buildWithdrawInputs(request);
  const { proof, publicSignals } = await groth16.fullProve(
    inputs as unknown as Record<string, unknown>,
    artifacts.wasm,
    artifacts.zkey,
  );

  return toSolidityProof(proof, publicSignals);
};
