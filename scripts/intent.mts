/**
 * Prepares and relays one action for an ArcveilAccount.
 *
 *   pnpm intent prepare anchor 0x<commitment>
 *   pnpm intent prepare revoke <epoch>
 *   pnpm intent prepare transfer 0x<to> <usdc>
 *   pnpm intent prepare adopt <epoch>            (with MANDATE_TERMS_NEXT set)
 *   pnpm intent send 0x<sig1> 0x<sig2>
 *
 * It never touches a key. `prepare` writes the EIP-712 payload for
 * `cast wallet sign`, which reads the encrypted keystore and prompts for the
 * password; `send` checks the signatures locally and prints the `cast send`
 * that relays them. Relaying is permissionless — any funded wallet can do it,
 * because authority lives in the signatures, not in the sender.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  createPublicClient,
  encodeFunctionData,
  hashTypedData,
  http,
  keccak256,
  parseEther,
  recoverTypedDataAddress,
  toHex,
} from "viem";
import {
  adoptTypedData,
  ANCHOR_REGISTRY_ABI,
  arc,
  ARC_REGISTRIES,
  ARCVEIL_ACCOUNT_ABI,
  encodeAdopt,
  encodeExecute,
  intentTypedData,
  MANDATE_REGISTRY_ABI,
  type Adoption,
  type Hex,
  type Intent,
} from "@arcveildev/sdk";

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

type TypedPayload = {
  types: Record<string, readonly { name: string; type: string }[]>;
  primaryType: string;
  domain: Record<string, unknown>;
  message: Record<string, unknown>;
};

function writePayload(typed: TypedPayload, meta: unknown) {
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
      Object.entries(typed.message).map(([key, value]) => [
        key,
        typeof value === "bigint" ? value.toString() : value,
      ]),
    ),
  };

  mkdirSync(DIR, { recursive: true });
  writeFileSync(TYPED, `${JSON.stringify(forCast, null, 2)}\n`);
  writeFileSync(META, `${JSON.stringify(meta, null, 2)}\n`);
}

function printSigningInstructions() {
  console.log("Sign with any two of the three keys:\n");
  for (const name of ["arcveil-device", "arcveil-cosigner", "arcveil-recovery"]) {
    console.log(`  cast wallet sign --data --from-file ${TYPED} --account ${name}`);
  }
  console.log(`\nThen: pnpm intent send <sig1> <sig2>`);
}

/** Refuse locally what the chain would refuse expensively. */
async function assertTwoMembers(account: Hex, signers: readonly Hex[]) {
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
}

function buildCall(action: string, args: string[]): { to: Hex; value: bigint; data: Hex } {
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
      return { to: to as Hex, value: parseEther(amount), data: "0x" };
    }
    default:
      throw new Error(`unknown action: ${action}`);
  }
}

async function prepareExecute(action: string, args: string[]) {
  const account = need("ACCOUNT") as Hex;
  const terms = need("MANDATE_TERMS");
  const commitment = keccak256(toHex(terms));

  const [epoch, nonce] = await Promise.all([
    client.readContract({ address: account, abi: ACCOUNT_ABI_EXTRA, functionName: "currentEpoch" }),
    client.readContract({ address: account, abi: ARCVEIL_ACCOUNT_ABI, functionName: "nonce" }),
  ]);

  // Catch wrong terms here, not by burning gas on a revert.
  const onChain = await client.readContract({
    address: registries.mandateRegistry,
    abi: MANDATE_REGISTRY_ABI,
    functionName: "mandateOf",
    args: [account, epoch],
  });
  if (onChain.commitment.toLowerCase() !== commitment.toLowerCase()) {
    throw new Error(`MANDATE_TERMS hashes to ${commitment}, but epoch ${epoch} holds ${onChain.commitment}`);
  }
  if (onChain.revokedAt !== 0n) {
    throw new Error(`epoch ${epoch} is revoked; nothing executes under it — adopt a new epoch first`);
  }

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const intent: Intent = { call: buildCall(action, args), nonce, deadline, epoch: Number(epoch), mandate: commitment };

  // Ask the account itself what it will hash. A disagreement here would waste
  // every signature gathered below, and surface only as an unexplained revert.
  const onChainDigest = await client.readContract({
    address: account,
    abi: ARCVEIL_ACCOUNT_ABI,
    functionName: "intentDigest",
    args: [intent.call, intent.nonce, intent.deadline, BigInt(intent.epoch), intent.mandate],
  });
  const typed = intentTypedData(account, arc.id, intent);
  const localDigest = hashTypedData(typed);
  if (onChainDigest.toLowerCase() !== localDigest.toLowerCase()) {
    throw new Error(`the account hashes this intent to ${onChainDigest}, this payload to ${localDigest}`);
  }

  writePayload(typed as unknown as TypedPayload, {
    kind: "execute",
    account,
    intent: {
      call: { ...intent.call, value: intent.call.value.toString() },
      nonce: nonce.toString(),
      deadline: deadline.toString(),
      epoch: intent.epoch,
      mandate: intent.mandate,
    },
  });

  console.log(`intent: ${action} ${args.join(" ")}`);
  console.log(`account ${account}  epoch ${epoch}  nonce ${nonce}`);
  console.log(`expires ${new Date(Number(deadline) * 1000).toISOString()}`);
  console.log(`digest  ${localDigest}  (confirmed against the account itself)\n`);
  printSigningInstructions();
}

/** Rotating the mandate is governance, not a call, so it signs its own payload. */
async function prepareAdopt(args: string[]) {
  const account = need("ACCOUNT") as Hex;
  const epoch = Number(args[0] ?? "0");
  if (epoch === 0) throw new Error("usage: prepare adopt <epoch>   (with MANDATE_TERMS_NEXT set)");
  const commitment = keccak256(toHex(need("MANDATE_TERMS_NEXT")));

  const [current, nonce] = await Promise.all([
    client.readContract({ address: account, abi: ACCOUNT_ABI_EXTRA, functionName: "currentEpoch" }),
    client.readContract({ address: account, abi: ARCVEIL_ACCOUNT_ABI, functionName: "nonce" }),
  ]);
  if (BigInt(epoch) <= current) {
    throw new Error(`epoch must advance: the account is at ${current}, and epochs never go back`);
  }

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const adoption: Adoption = { epoch, commitment, nonce, deadline };

  const onChainDigest = await client.readContract({
    address: account,
    abi: ARCVEIL_ACCOUNT_ABI,
    functionName: "adoptDigest",
    args: [BigInt(epoch), commitment, nonce, deadline],
  });
  const typed = adoptTypedData(account, arc.id, adoption);
  const localDigest = hashTypedData(typed);
  if (onChainDigest.toLowerCase() !== localDigest.toLowerCase()) {
    throw new Error(`the account hashes this adoption to ${onChainDigest}, this payload to ${localDigest}`);
  }

  writePayload(typed as unknown as TypedPayload, {
    kind: "adopt",
    account,
    adoption: { epoch, commitment, nonce: nonce.toString(), deadline: deadline.toString() },
  });

  console.log(`adopt epoch ${epoch}  (the account is at ${current})`);
  console.log(`commitment ${commitment}`);
  console.log(`expires ${new Date(Number(deadline) * 1000).toISOString()}`);
  console.log(`digest  ${localDigest}  (confirmed against the account itself)\n`);
  printSigningInstructions();
}

async function send(sig1: string, sig2: string) {
  const meta = JSON.parse(readFileSync(META, "utf8")) as Record<string, never> & { kind: string };
  const account = meta.account as unknown as Hex;

  if (meta.kind === "adopt") {
    const a = meta.adoption as unknown as { epoch: number; commitment: Hex; nonce: string; deadline: string };
    const adoption: Adoption = {
      epoch: a.epoch,
      commitment: a.commitment,
      nonce: BigInt(a.nonce),
      deadline: BigInt(a.deadline),
    };
    const typed = adoptTypedData(account, arc.id, adoption);
    const signers = await Promise.all(
      [sig1, sig2].map((signature) => recoverTypedDataAddress({ ...typed, signature: signature as Hex })),
    );
    await assertTwoMembers(account, signers);

    console.log(`signed by ${signers[0]} and ${signers[1]} — both members, distinct\n`);
    console.log("Relay it with any funded wallet:\n");
    console.log(
      `  cast send ${account} ${encodeAdopt(adoption, [sig1 as Hex, sig2 as Hex])} --rpc-url ${arc.rpcUrls.default.http[0]} --account deployer`,
    );
    return;
  }

  const i = meta.intent as unknown as {
    call: { to: Hex; value: string; data: Hex };
    nonce: string;
    deadline: string;
    epoch: number;
    mandate: Hex;
  };
  const intent: Intent = {
    call: { to: i.call.to, value: BigInt(i.call.value), data: i.call.data },
    nonce: BigInt(i.nonce),
    deadline: BigInt(i.deadline),
    epoch: i.epoch,
    mandate: i.mandate,
  };

  const typed = intentTypedData(account, arc.id, intent);
  const signers = await Promise.all(
    [sig1, sig2].map((signature) => recoverTypedDataAddress({ ...typed, signature: signature as Hex })),
  );
  await assertTwoMembers(account, signers);

  console.log(`signed by ${signers[0]} and ${signers[1]} — both members, distinct\n`);
  console.log("Relay it with any funded wallet:\n");
  console.log(
    `  cast send ${account} ${encodeExecute(intent, [sig1 as Hex, sig2 as Hex])} --rpc-url ${arc.rpcUrls.default.http[0]} --account deployer`,
  );
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === "prepare" && rest[0] === "adopt") await prepareAdopt(rest.slice(1));
else if (mode === "prepare") await prepareExecute(rest[0] ?? "", rest.slice(1));
else if (mode === "send") await send(rest[0] ?? "", rest[1] ?? "");
else {
  console.log("usage: pnpm intent prepare <anchor|revoke|transfer|adopt> [args] | pnpm intent send <sig1> <sig2>");
  process.exit(1);
}
