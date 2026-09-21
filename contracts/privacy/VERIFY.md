# Verifying the vendored protocol

Arcveil's private bridge does not implement zero-knowledge cryptography. It
deposits into the Privacy Pool protocol, unmodified, and the strength of that
claim rests entirely on the copy in this directory being the real one.

This file is how you check that without trusting us.

## 1. The sources match upstream

```bash
cd contracts/privacy
shasum -a 256 -c MANIFEST.sha256
```

Every line must say `OK`. `MANIFEST.sha256` covers all of `src/` and
`circuits/`, and is regenerated with:

```bash
find src circuits -type f | sort | xargs shasum -a 256 > MANIFEST.sha256
```

## 2. The manifest matches the upstream commit

```bash
git clone https://github.com/0xbow-io/privacy-pools-core /tmp/pp
git -C /tmp/pp checkout c312dcd58f6ad085204be61923c49f8065e4e9ae

diff -r /tmp/pp/packages/contracts/src contracts/privacy/src
diff -r /tmp/pp/packages/circuits/circuits contracts/privacy/circuits
```

Both must print nothing.

## 3. The circuits match the proving keys

The circuits here are reference copies; they are never compiled by this repo.
What is deployed is the Groth16 verifier upstream generated from the ceremony's
final keys, and what proves in the browser is the ceremony's `.zkey`. Those two
must be the same ceremony, or every proof fails — loudly, which is the good
case.

The ceremony artifacts are not committed here: `withdraw.zkey` alone is 17 MB.
Fetch them from the upstream clone and check them:

```bash
shasum -a 256 /tmp/pp/packages/circuits/trusted-setup/final-keys/*
```

| File | SHA-256 |
|---|---|
| `withdraw.zkey` | `2a893b42174c813566e5c40c715a8b90cd49fc4ecf384e3a6024158c3d6de677` |
| `withdraw.vkey` | `666bd0983b20c1611543b04f7712e067fbe8cad69f07ada8a310837ff398d21e` |
| `commitment.zkey` | `494ae92d64098fda2a5649690ddc5821fcd7449ca5fe8ef99ee7447544d7e1f3` |
| `commitment.vkey` | `7d48b4eb3dedc12fb774348287b587f0c18c3c7254cd60e9cf0f8b3636a570d8` |

The browser also needs the witness generator, from the same commit:

| File | SHA-256 |
|---|---|
| `packages/circuits/build/withdraw/withdraw_js/withdraw.wasm` | `36cda22791def3d520a55c0fc808369cd5849532a75fab65686e666ed3d55c10` |

`pnpm veil:artifacts` downloads both and refuses to write either if its hash
has moved.

Then confirm each key belongs to the circuit it claims to, and that the
ceremony's contributions are well formed:

```bash
npx snarkjs zkey verify \
  /tmp/pp/packages/circuits/build/withdraw/withdraw.r1cs \
  /tmp/pp/packages/circuits/ptau/powersOfTau28_hez_final_16.ptau \
  /tmp/pp/packages/circuits/trusted-setup/final-keys/withdraw.zkey
```

## 4. The deployed verifier matches the key

`WithdrawalVerifier.sol` is generated, not written, so it can be regenerated and
compared rather than read:

```bash
npx snarkjs zkey export solidityverifier \
  /tmp/pp/packages/circuits/trusted-setup/final-keys/withdraw.zkey \
  /tmp/WithdrawalVerifier.sol

diff /tmp/WithdrawalVerifier.sol contracts/privacy/src/contracts/verifiers/WithdrawalVerifier.sol
```

## What this does *not* establish

- **That the ceremony was honest.** A trusted setup is only as good as its
  participants; if every contributor colluded and kept their toxic waste, forged
  proofs are possible. We did not run this ceremony and cannot vouch for it. The
  transcript is upstream, in `trusted-setup/`.
- **That the audited contracts are bug-free.** Two audits are in the upstream
  `audit/` directory. Read their findings; they are not a guarantee.
- **That Arcveil's own code is safe.** `../src/VeilGateway.sol`, the relayer and
  the ASP postman are ours, and none of them has been audited. That is stated
  again wherever it matters.
