# Deploying the private bridge

Three systems have to come up in order: the contracts on Arc, the relayer that
submits withdrawals, and the site that points at both. Each step below either
verifies the one before it or refuses to continue.

Nothing here should be run against mainnet until the whole sequence has been
run against testnet and a real deposit has come out the other side.

## What you need first

**A funded deployer.** Gas on Arc is USDC. The deployment simulates at
17,473,952 gas, which is **about 0.92 USDC** at 20 gwei — it moves with the
base fee, and the script prints the estimate before it spends anything.

Testnet USDC comes from [Circle's faucet](https://faucet.circle.com): choose
Arc Testnet, paste the deployer's address. Use Circle's own faucet and not a
third-party one — a faucet that asks for anything beyond an address is asking
for something it does not need.

**Three keys that are three different holders.** They are separate because
their blast radii are different, and a deployment that reuses one has quietly
merged three risks into one:

| Key | Holds | If it leaks |
|---|---|---|
| deployer | Pays for the deployment. No authority afterwards. | Nothing. It renounces `OWNER_ROLE` in the same transaction. |
| relayer | Hot, on a server, funded with USDC for gas. | Whatever USDC it holds. It can refuse to relay; it can never redirect a withdrawal. |
| postman | Publishes association-set roots. Moves no money. | An attacker chooses which deposits are spendable. Ragequit still works without it. |

```bash
cast wallet new ~/.foundry/keystores arcveil-relayer
cast wallet new ~/.foundry/keystores arcveil-postman
cast wallet list              # this repo's earlier deploys used the one called `deployer`
```

## 1. Deploy the contracts

`VEIL_OWNER` is who can upgrade the Entrypoint afterwards. On testnet it can be
left unset and the script says loudly that a single key holds that power. On
mainnet it is the 2-of-3 `ArcveilAccount`, and the script grants the role and
renounces the deployer's in the same transaction.

```bash
cd contracts
POSTMAN=0x<postman> forge script script/DeployVeil.s.sol \
  --rpc-url arc_testnet --account <your-deployer-keystore> --broadcast
```

It prints the Entrypoint, the pool, the gateway and the scope. Do not copy them
by hand — step 2 exists so that nobody has to.

## 2. Point the site at what was deployed

```bash
pnpm veil:addresses               # add `mainnet` for mainnet
```

It reads Foundry's broadcast log, then asks the chain whether each address is
what the log claims: that the scope resolves to that pool inside that
Entrypoint, and that the gateway points back at the same Entrypoint. A
mismatch stops it. Only then does it write `src/data/site.ts` and the pool's
deployment block into `src/lib/veilConfig.ts`.

It writes the **network** alongside the addresses, and that is the only place
the bridge's network is set. `src/lib/veilNetwork.ts` turns it into the chain
id, the RPC, the explorer and the list of source chains — so the page reads the
chain it was deployed to, offers Sepolia sources on testnet, and says so in its
own copy. Nothing needs editing by hand, and there is no flip to remember to
undo.

`ARC` in the same file is deliberately untouched: that is where `/verify` reads
`MandateRegistry` and `AnchorRegistry`, which exist on mainnet only. A bridge on
testnet and a verifier on mainnet is the normal state, not a mistake.

Until this runs, `/bridge` reports every piece as *not deployed* and refuses to
draw a form that cannot work.

## 3. Deploy the relayer

```bash
cd packages/relay
wrangler secret put RELAYER_KEY     # hot key that pays gas and takes the fee
wrangler secret put POSTMAN_KEY     # publishes ASP roots; never the 2-of-3
```

and the settings, taking the values step 2 printed:

| | |
|---|---|
| `ARC_RPC` | `https://rpc.testnet.arc.io` |
| `ENTRYPOINT` | from step 1 |
| `GATEWAY` | from step 1 |
| `SCOPE` | from step 1 |
| `FROM_BLOCK` | the pool's deployment block, from step 2 |
| `MIN_FEE_BPS` | optional, defaults to 25 |
| `RELAY_ORIGIN` | the one browser origin allowed to call it |

```bash
pnpm relay:deploy
curl https://<worker>.workers.dev/quote     # should answer with the same addresses
```

Then fund `RELAYER_KEY` with USDC on Arc. It pays gas for every withdrawal and
for every deposit delivery, and it earns the relay fee on withdrawals only —
deliveries are a subsidy, because a burn that is never delivered is USDC
destroyed on one chain and minted on neither.

## 4. Tell the site where the relayer is

```bash
RELAYER=https://<worker>.workers.dev pnpm veil:addresses
```

`/bridge` goes live at this point: deposits send, withdrawals prove and submit.

## 5. Prove it end to end, with small money

1. Get testnet USDC on Base Sepolia, and bridge **10 USDC** in from `/bridge`.
2. Watch the stages: approve, burn, attest, deliver. Circle's attestation takes
   minutes at standard finality, and the page says so rather than hanging.
3. Wait for the postman. Its cron runs every ten minutes; until it publishes a
   root containing the new label, the deposit is **not** privately spendable and
   the page says so. `wrangler tail` shows the run.
4. Withdraw to an address that has never held anything of yours.
5. Check the three transactions on the explorer, and check the last one names a
   recipient with no link to the first.

Record the three hashes in `contracts/README.md`. That is how everything else
in this repository is proven, and a bridge should not be the exception.

## 6. Mainnet

Same sequence, `--rpc-url arc`, with three differences:

- `VEIL_OWNER` is the 2-of-3 account, not a single key.
- `minimumDepositAmount` stays where it is, and the first deposits stay small.
- Nobody has audited `VeilGateway`, the relayer or the postman. The pool
  contracts and circuits underneath are audited — ours are not, and the page
  says so.

## When it goes wrong

| Symptom | What happened |
|---|---|
| `veil:addresses` says the Entrypoint does not know the pool | The broadcast log is from a different run than the chain state. Re-deploy or point at the right log. |
| `/bridge` says a deposit is not privately spendable | The postman has not published a root containing its label. It can still be pulled back publicly through the gateway. |
| A withdrawal is refused with "not made for this withdrawal" | The proof was built against a different recipient, fee, entrypoint or scope. Re-fetch the quote and rebuild. |
| The deposit reached "attesting" and stopped | The USDC is burnt and safe. Circle has not attested yet; the message can be delivered later by anyone. |
| A USDC transfer reverts for no visible reason | Both the mint and the transfer path go through Arc precompiles whose code is not readable from outside. Nothing here overrides them. |
