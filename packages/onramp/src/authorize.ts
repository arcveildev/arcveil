import { getAddress, isAddress, recoverMessageAddress, type Hex } from "viem";
import { z } from "zod";
import { FRESHNESS_MS, fundingMessage } from "./message";

/** Does `who` hold one of the account's three keys? The contract's own answer. */
export type Membership = (account: string, who: string) => Promise<boolean>;

export type AuthorizeDeps = Readonly<{ isMember: Membership; now: () => number; chainId: number }>;

export type Authorization =
  | { ok: true; account: string; signer: string }
  | { ok: false; status: 400 | 401 | 403 | 503; error: string };

const bodySchema = z.object({
  account: z.string().refine((value) => isAddress(value, { strict: false }), "account is not an address"),
  issuedAt: z.iso.datetime(),
  signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/, "signature is not 65 bytes of hex"),
});

/**
 * Decide whether this request may open an onramp into `account`.
 *
 * Fails closed: a malformed body, a stale or future timestamp, a signer the
 * account does not recognise, and a chain that cannot be asked all refuse.
 * The one thing a pass grants is a session whose destination is the account
 * itself, so the worst a leaked signature does is let someone top up an
 * account that is not theirs.
 */
export async function authorizeFunding(input: unknown, deps: AuthorizeDeps): Promise<Authorization> {
  const parsed = bodySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ") };
  }
  const { issuedAt, signature } = parsed.data;
  const account = getAddress(parsed.data.account);

  const drift = Math.abs(deps.now() - Date.parse(issuedAt));
  if (!(drift <= FRESHNESS_MS)) {
    return { ok: false, status: 401, error: "The signature's timestamp is more than five minutes from now. Sign again." };
  }

  let signer: string;
  try {
    signer = await recoverMessageAddress({ message: fundingMessage({ account, chainId: deps.chainId, issuedAt }), signature: signature as Hex });
  } catch {
    return { ok: false, status: 400, error: "The signature does not recover to an address." };
  }

  let member: boolean;
  try {
    member = await deps.isMember(account, signer);
  } catch {
    return { ok: false, status: 503, error: "Arc could not be asked whether this signer belongs to the account. Try again." };
  }
  if (!member) {
    // Addresses only: which key signed, and for which account. Enough to tell a
    // wrong keystore from a message that drifted, and nothing that is secret.
    console.warn("refused: signer is not a member", { account, signer });
    return { ok: false, status: 403, error: "That signature is not from one of this account's keys." };
  }
  return { ok: true, account, signer };
}
