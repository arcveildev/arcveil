/**
 * Prepares and relays one intent for an ArcveilAccount.
 *
 *   pnpm intent prepare anchor 0x<commitment>
 *   pnpm intent prepare revoke
 *   pnpm intent prepare transfer 0x<to> <usdc>
 *   pnpm intent send 0x<sig1> 0x<sig2>
 *
 * It never touches a key. `prepare` writes the EIP-712 payload for
 * `cast wallet sign`, which reads the encrypted keystore and prompts for the
 * password; `send` checks the two signatures locally and prints the `cast send`
 * that relays them. Relaying is permissionless — any funded wallet can do it,
 * because authority lives in the signatures, not in the sender.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createPublicClient, encodeFunctionData, hashTypedData, http, keccak256, parseEther, recoverTypedDataAddress, toHex } from "viem";
import {
  ANCHOR_REGISTRY_ABI,
  ARC_REGISTRIES,
  ARCVEIL_ACCOUNT_ABI,
  arc,
  encodeExecute,
  intentTypedData,
  MANDATE_REGISTRY_ABI,
  type Hex,
  type Intent,
} from "@arcveil/sdk";

const DIR = ".arcveil";
const TYPED = `${DIR}/intent.typed.json`;
const META = `${DIR}/intent.json`;

const registries = ARC_REGISTRIES[arc.id];
if (registries === undefined) throw new Error(`no registries known for chain ${arc.id}`);

const client = createPublicClient({ chain: arc, transport: http() });

const need = (name: string): string => {
  const value = process.env[name];
  if (value === undefined || value === "") throw new Error(`set ${name}`);
  return value;
};

const ACCOUNT_ABI_EXTRA = [
  { type: "function", name: "currentEpoch", stateMutability: "view", inputs: [], outputs: [{ type: "uint64" }] },
  {
    type: "function",
    name: "isMember",
    stateMutability: "view",
    inputs: [{ name: "who", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

async function buildCall(action: string, args: string[]) {
  switch (action) {
    case "anchor": {
      const commitment = args[0] as Hex | undefined;
      if (commitment === undefined) throw new Error("usage: prepare anchor 0x<commitment>");
      return {
        to: registries.anchorRegistry,
        value: 0n,
        data: encodeFunctionData({ abi: ANCHOR_REGISTRY_ABI, functionName: "anchor", args: [commitment] }),
      };
    }
    case "revoke": {
      const epoch = BigInt(args[0] ?? "0");
      if (epoch === 0n) throw new Error("usage: prepare revoke <epoch>");
      return {
        to: registries.mandateRegistry,
        value: 0n,
        data: encodeFunctionData({ abi: MANDATE_REGISTRY_ABI, functionName: "revoke", args: [epoch] }),
      };
    }
    case "transfer": {
      const [to, amount] = args;
      if (to === undefined || amount === undefined) throw new Error("usage: prepare transfer 0x<to> <usdc>");
      // Native USDC on Arc carries 18 decimals, unlike its 6-decimal ERC-20 face.
      return { to: to as Hex, value: parseEther(amount), data: "0x" as Hex };
    }
    default:
      throw new Error(`unknown action: ${action}`);
  }
}

async function prepare(action: string, args: string[]) {
  const account = need("ACCOUNT") as Hex;
  const terms = need("MANDATE_TERMS");
  const commitment = keccak256(toHex(terms));

  const [epoch, nonce] = await Promise.all([
    client.readContract({ address: account, abi: ACCOUNT_ABI_EXTRA, functionName: "currentEpoch" }),
    client.readContract({ address: account, abi: ARCVEIL_ACCOUNT_ABI, functionName: "nonce" }),
  ]);

  // Catch a wrong MANDATE_TERMS here, not by burning gas on a revert.
  const live = await client.readContract({
    address: registries.mandateRegistry,
    abi: MANDATE_REGISTRY_ABI,
    functionName: "mandateOf",
    args: [account, epoch],
  });
  if (live.commitment.toLowerCase() !== commitment.toLowerCase()) {
    throw new Error(
      `MANDATE_TERMS hashes to ${commitment}, but epoch ${epoch} on chain holds ${live.commitment}`,
    );
  }
  if (live.revokedAt !== 0n) throw new Error(`epoch ${epoch} is revoked; nothing will execute under it`);

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const intent: Intent = {
    call: await buildCall(action, args),
    nonce,
    deadline,
    epoch: Number(epoch),
    mandate: commitment,
  };

  const typed = intentTypedData(account, arc.id, intent);
  const forCast = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      ...typed.types,
    },
    primaryType: typed.primaryType,
    domain: { ...typed.domain, chainId: arc.id },
    message: Object.fromEntries(
      Object.entries(typed.message).map(([k, v]) => [k, typeof v === "bigint" ? v.toString() : v]),
    ),
  };

  // Ask the account itself what it will hash. If this ever disagrees, every
  // signature gathered below would be wasted — and the failure would surface as
  // an unexplained "NotAMember" revert after paying gas.
  const onChainDigest = await client.readContract({
    address: account,
    abi: ARCVEIL_ACCOUNT_ABI,
    functionName: "intentDigest",
    args: [intent.call, intent.nonce, intent.deadline, BigInt(intent.epoch), intent.mandate],
  });
  const localDigest = hashTypedData(typed);
  if (onChainDigest.toLowerCase() !== localDigest.toLowerCase()) {
    throw new Error(`the account hashes this intent to ${onChainDigest}, this payload to ${localDigest}`);
  }

  mkdirSync(DIR, { recursive: true });
  writeFileSync(TYPED, `${JSON.stringify(forCast, null, 2)}\n`);
  writeFileSync(
    META,
    `${JSON.stringify({ account, intent: { ...intent, call: { ...intent.call, value: intent.call.value.toString() }, nonce: nonce.toString(), deadline: deadline.toString() } }, null, 2)}\n`,
  );

  console.log(`intent: ${action} ${args.join(" ")}`);
  console.log(`account ${account}  epoch ${epoch}  nonce ${nonce}`);
  console.log(`expires ${new Date(Number(deadline) * 1000).toISOString()}`);
  console.log(`digest  ${localDigest}  (confirmed against the account itself)\n`);
  console.log("Sign with any two of the three keys:\n");
  for (const name of ["arcveil-device", "arcveil-cosigner", "arcveil-recovery"]) {
    console.log(`  cast wallet sign --data --from-file ${TYPED} --account ${name}`);
  }
  console.log(`\nThen: pnpm intent send <sig1> <sig2>`);
}

async function send(sig1: string, sig2: string) {
  const { account, intent } = JSON.parse(readFileSync(META, "utf8")) as {
    account: Hex;
    intent: { call: { to: Hex; value: string; data: Hex }; nonce: string; deadline: string; epoch: number; mandate: Hex };
  };
  const rebuilt: Intent = {
    call: { to: intent.call.to, value: BigInt(intent.call.value), data: intent.call.data },
    nonce: BigInt(intent.nonce),
    deadline: BigInt(intent.deadline),
    epoch: intent.epoch,
    mandate: intent.mandate,
  };

  const typed = intentTypedData(account, arc.id, rebuilt);
  const signers = await Promise.all(
    [sig1, sig2].map((signature) => recoverTypedDataAddress({ ...typed, signature: signature as Hex })),
  );

  // Refuse locally what the account would refuse on chain, before paying gas.
  for (const signer of signers) {
    const member = await client.readContract({
      address: account,
      abi: ACCOUNT_ABI_EXTRA,
      functionName: "isMember",
      args: [signer],
    });
    if (!member) throw new Error(`${signer} is not one of the three keys`);
  }
  if (signers[0]?.toLowerCase() === signers[1]?.toLowerCase()) {
    throw new Error(`both signatures are from ${signers[0]}; two of three means two different keys`);
  }

  const data = encodeExecute(rebuilt, [sig1 as Hex, sig2 as Hex]);
  console.log(`signed by ${signers[0]} and ${signers[1]} — both members, distinct\n`);
  console.log("Relay it with any funded wallet:\n");
  console.log(`  cast send ${account} ${data} --rpc-url https://rpc.mainnet.arc.io --account deployer`);
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === "prepare") await prepare(rest[0] ?? "", rest.slice(1));
else if (mode === "send") await send(rest[0] ?? "", rest[1] ?? "");
else {
  console.log("usage: pnpm intent prepare <anchor|revoke|transfer> [args] | pnpm intent send <sig1> <sig2>");
  process.exit(1);
}
