#!/usr/bin/env bash
# Fetches every Solidity dependency into lib/, which is not committed.
#
# forge-std comes from git; the four the Privacy Pool protocol needs come from
# npm at the exact versions its own package.json pins, so this reproduces the
# dependency set the upstream audits were run against rather than "whatever the
# tag points at today".
set -euo pipefail
cd "$(dirname "$0")"

[ -d lib/forge-std ] || forge install foundry-rs/forge-std

fetch() {
  local spec="$1" dir="lib/$2"
  [ -d "$dir" ] && { echo "have   $spec"; return; }
  echo "fetch  $spec"
  mkdir -p "$dir"
  curl -sL "$(npm view "$spec" dist.tarball)" | tar xz -C "$dir" --strip-components=1
}

fetch @openzeppelin/contracts@5.1.0             openzeppelin-contracts
fetch @openzeppelin/contracts-upgradeable@5.0.2 openzeppelin-contracts-upgradeable
fetch @zk-kit/lean-imt.sol@2.0.0                lean-imt
fetch poseidon-solidity@0.0.5                   poseidon-solidity

echo "done. remappings are in remappings.txt"
