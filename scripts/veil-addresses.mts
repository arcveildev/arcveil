/**
 * Writes the deployed bridge addresses into the site, after checking each one
 * actually answers.
 *   pnpm veil:addresses            # Arc testnet
 *   pnpm veil:addresses mainnet
 *
 * Copying five addresses by hand into a page that moves money is the single
 * most likely place to put a wrong one, and a wrong one here is not a broken
 * link — it is USDC sent somewhere nobody controls. So this reads them from
 * Foundry's broadcast log, asks the chain whether each is what it claims to
 * be, and only then edits `src/data/site.ts`.
 *
 * It refuses rather than guesses. Every check below has a failure that would
 * otherwise surface as a transaction reverting after the gas was spent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createPublicClient, http, type Address } from "viem";
import { arc, arcTestnet } from "@arcveildev/sdk";
import { ENTRYPOINT_ABI, POOL_ABI, VEIL_GATEWAY_ABI } from "@arcveil/bridge";

const network = process.argv[2] === "mainnet" ? "mainnet" : "testnet";
const chain = network === "mainnet" ? arc : arcTestnet;

const BROADCAST = join(
  process.cwd(),
  "contracts",
  "broadcast",
  "DeployVeil.s.sol",
  String(chain.id),
  "run-latest.json",
);

type Tx = {
  transactionType: string;
  contractName: string | null;
  contractAddress: string | null;
};

type Receipt = { contractAddress: string | null; blockNumber: string };

const die = (message: string): never => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

let broadcast: { transactions: Tx[]; receipts: Receipt[] };
try {
  broadcast = JSON.parse(readFileSync(BROADCAST, "utf8"));
} catch {
  die(`No broadcast log at ${BROADCAST}. Run DeployVeil.s.sol with --broadcast first.`);
  throw new Error("unreachable");
}

const deployed = (name: string): Address => {
  const found = broadcast.transactions.filter(
    (tx) => tx.transactionType === "CREATE" && tx.contractName === name && tx.contractAddress,
  );
  if (found.length === 0) die(`The broadcast log has no ${name} deployment.`);
  if (found.length > 1) die(`The broadcast log has ${found.length} ${name} deployments; which one is live is ambiguous.`);
  return found[0]!.contractAddress as Address;
};

// The Entrypoint is behind a proxy, and the proxy is the address everything
// else talks to. Naming the implementation here would produce a site that
// reads an uninitialised contract.
const entrypoint = deployed("ERC1967Proxy");
const pool = deployed("PrivacyPoolComplex");
const gateway = deployed("VeilGateway");

const blockOf = (address: Address): bigint => {
  const receipt = broadcast.receipts.find((r) => r.contractAddress?.toLowerCase() === address.toLowerCase());
  if (!receipt) die(`No receipt for ${address}; the broadcast log is incomplete.`);
  return BigInt(receipt!.blockNumber);
};

const client = createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0]) });

console.log(`\n  ${chain.name} (${chain.id})\n`);

// Each read below is the question the site will ask at runtime. Asking it now
// means a wrong address fails here, with a name attached, instead of failing
// in a browser with a stack trace.
const scope = await client.readContract({ address: pool, abi: POOL_ABI, functionName: "SCOPE" });
const poolForScope = await client.readContract({
  address: entrypoint,
  abi: ENTRYPOINT_ABI,
  functionName: "scopeToPool",
  args: [scope],
});
const gatewayEntrypoint = await client.readContract({
  address: gateway,
  abi: VEIL_GATEWAY_ABI,
  functionName: "ENTRYPOINT",
});

if (poolForScope.toLowerCase() !== pool.toLowerCase()) {
  die(`The Entrypoint does not know this pool: scope ${scope} resolves to ${poolForScope}, not ${pool}.`);
}
if (gatewayEntrypoint.toLowerCase() !== entrypoint.toLowerCase()) {
  die(`The gateway points at ${gatewayEntrypoint}, not the Entrypoint at ${entrypoint}.`);
}

const fromBlock = blockOf(pool);

console.log(`  Entrypoint   ${entrypoint}`);
console.log(`  PrivacyPool  ${pool}`);
console.log(`  VeilGateway  ${gateway}`);
console.log(`  scope        ${scope}`);
console.log(`  from block   ${fromBlock}`);

const relayer = process.env.RELAYER ?? null;
if (!relayer) {
  console.log(`\n  RELAYER is unset, so the site will still report the relayer as missing.`);
  console.log(`  Deploy the worker, then re-run with RELAYER=https://…workers.dev`);
}

const sitePath = join(process.cwd(), "src", "data", "site.ts");
const site = readFileSync(sitePath, "utf8");

const block = site.match(/export const VEIL: \{[\s\S]*?\n\} = \{[\s\S]*?\n\};/);
if (!block) die("Could not find the VEIL block in src/data/site.ts.");

const [declaration] = block![0].split(" = {");
const replacement = `${declaration} = {
  entrypoint: "${entrypoint}",
  pool: "${pool}",
  gateway: "${gateway}",
  scope: "${scope}",
  relayer: ${relayer ? `"${relayer}"` : "null"},
};`;

writeFileSync(sitePath, site.replace(block![0], replacement));

const configPath = join(process.cwd(), "src", "lib", "veilConfig.ts");
const config = readFileSync(configPath, "utf8");
writeFileSync(configPath, config.replace(/const FROM_BLOCK = \d+n;/, `const FROM_BLOCK = ${fromBlock}n;`));

console.log(`\n  Written to src/data/site.ts and src/lib/veilConfig.ts.\n`);
