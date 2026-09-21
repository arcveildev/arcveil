/**
 * Fetches the circuit artifacts the browser needs to build a withdrawal proof.
 *   pnpm veil:artifacts
 *
 * They are not committed: the proving key alone is 17 MB, and it is not ours —
 * it is the output of the Privacy Pools trusted setup. So it is downloaded
 * from the exact upstream commit the contracts in `contracts/privacy` were
 * copied from, and checked against the hashes recorded in
 * `contracts/privacy/VERIFY.md`.
 *
 * A mismatch stops the script. A proving key that is not the one the deployed
 * verifier was generated from produces proofs that always fail — silently, and
 * only after the user has waited for a 17 MB download.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The commit `contracts/privacy` was taken from. Changing this changes the ceremony. */
const COMMIT = "c312dcd58f6ad085204be61923c49f8065e4e9ae";
const BASE = `https://raw.githubusercontent.com/0xbow-io/privacy-pools-core/${COMMIT}`;

const OUT = join(process.cwd(), "public", "veil");

type Artifact = { readonly name: string; readonly path: string; readonly sha256: string };

const ARTIFACTS: readonly Artifact[] = [
  {
    name: "withdraw.zkey",
    path: "packages/circuits/trusted-setup/final-keys/withdraw.zkey",
    sha256: "2a893b42174c813566e5c40c715a8b90cd49fc4ecf384e3a6024158c3d6de677",
  },
  {
    name: "withdraw.wasm",
    path: "packages/circuits/build/withdraw/withdraw_js/withdraw.wasm",
    sha256: "36cda22791def3d520a55c0fc808369cd5849532a75fab65686e666ed3d55c10",
  },
];

const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

async function fetchArtifact(artifact: Artifact): Promise<void> {
  const url = `${BASE}/${artifact.path}`;
  process.stdout.write(`${artifact.name} … `);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`${artifact.name}: upstream returned ${response.status} for ${url}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = sha256(bytes);

  if (artifact.sha256 === "") {
    process.stdout.write(`${(bytes.length / 1e6).toFixed(1)} MB, sha256 ${digest}\n`);
    process.stdout.write(`  ^ pin this in scripts/veil-artifacts.mts and contracts/privacy/VERIFY.md\n`);
  } else if (digest !== artifact.sha256) {
    throw new Error(
      `${artifact.name}: expected sha256 ${artifact.sha256}, got ${digest}. ` +
        `Refusing to write it — a proving key that is not the ceremony's produces proofs nothing accepts.`,
    );
  } else {
    process.stdout.write(`${(bytes.length / 1e6).toFixed(1)} MB, sha256 ok\n`);
  }

  writeFileSync(join(OUT, artifact.name), bytes);
}

mkdirSync(OUT, { recursive: true });

for (const artifact of ARTIFACTS) {
  await fetchArtifact(artifact);
}

console.log(`\nWritten to public/veil/. They are gitignored; run this after a fresh clone.`);
