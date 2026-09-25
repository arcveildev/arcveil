import { z } from "zod";
import { getAddress, isAddress } from "viem";
import { HTTPFacilitatorClient } from "@x402/core/server";
import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader,
} from "@x402/core/http";
import type { PaymentPayload, PaymentRequired, PaymentRequirements } from "@x402/core/types";
import { parseSecret, type Loaded } from "./config";
import { fail, json } from "./http";
import type { Env } from "./env";

/**
 * Pay per verdict, over x402, settled by Arcus on Arc.
 *
 * This is the door for callers who hold no token: an agent that has never met
 * this gate sends a request, reads the price off the 402, signs an EIP-3009
 * authorization for exactly that much USDC, and sends it again. The token
 * door stays exactly as it was.
 *
 * Settlement happens after the verdict is computed and before it leaves. A
 * verdict nobody paid for is never sent, and a request the gate could not
 * answer (a bad body, a judge that did not reply) is never charged: the
 * signed authorization is simply not submitted and expires on its own.
 */

export const ARCUS_FACILITATOR = "https://facilitator.arcusnetwork.co";

/** Native USDC on Arc. The same address on mainnet and testnet. */
export const ARC_USDC = "0x3600000000000000000000000000000000000000";

/** The token's EIP-712 domain, as `name()` and `version()` return it on Arc mainnet. */
const USDC_DOMAIN = { name: "USDC", version: "2" } as const;
const USDC_DECIMALS = 6;

/** How long a signed authorization may wait. One judge call fits well inside it. */
const PAYMENT_WINDOW_SECONDS = 60;
const FACILITATOR_TIMEOUT_MS = 15_000;

export const PAID_ROUTES = ["/evaluate", "/select"] as const;
export type PaidRoute = (typeof PAID_ROUTES)[number];

const DESCRIPTIONS: Readonly<Record<PaidRoute, string>> = {
  "/evaluate": "Put one proposed action to a mandate's semantic clauses. Answers allow or deny.",
  "/select": "Choose which paid tool to buy for a task, under a price cap. Answers one id or none.",
};

// A price is dollars with at most USDC's six decimals, and never zero: a free
// route is one that is not listed.
const priceSchema = z
  .string()
  .regex(/^\d+(\.\d{1,6})?$/, "a decimal USD amount with at most 6 places")
  .refine((price) => Number(price) > 0, "greater than zero");

const pricingSchema = z
  .object({
    network: z.enum(["eip155:5042", "eip155:5042002"]),
    payTo: z.string().refine(isAddress, "an EVM address").transform((address) => getAddress(address)),
    prices: z.object({ "/evaluate": priceSchema.optional(), "/select": priceSchema.optional() }).strict(),
    facilitator: z.url().optional(),
  })
  .strict();

export type Pricing = z.infer<typeof pricingSchema>;

/** A request that takes the paying door, and the route it is paying for. */
export type Paid = { pricing: Pricing; route: PaidRoute };

const isPaidRoute = (pathname: string): pathname is PaidRoute => (PAID_ROUTES as readonly string[]).includes(pathname);

/**
 * Whether this request takes the paying door. Null means it does not: x402 is
 * off, the route is free, or the caller brought a token. A malformed config is
 * not null — it takes paid routes out of service rather than opening them.
 */
export function pricingFor(env: Env, request: Request, pathname: string): Loaded<Paid> | null {
  if (env.GATE_X402 === undefined || env.GATE_X402.trim() === "") return null;
  if (request.method !== "POST" || !isPaidRoute(pathname)) return null;
  if (request.headers.get("authorization") !== null) return null;
  const pricing = parseSecret("GATE_X402", env.GATE_X402, pricingSchema);
  if (!pricing.ok) return pricing;
  if (pricing.value.prices[pathname] === undefined) return null;
  return { ok: true, value: { pricing: pricing.value, route: pathname } };
}

const toAtomic = (price: string): string => {
  const [whole = "0", fraction = ""] = price.split(".");
  return (BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(fraction.padEnd(USDC_DECIMALS, "0"))).toString();
};

export function requirementsFor(pricing: Pricing, route: PaidRoute): PaymentRequirements {
  return {
    scheme: "exact",
    network: pricing.network,
    asset: ARC_USDC,
    amount: toAtomic(pricing.prices[route] ?? "0"),
    payTo: pricing.payTo,
    maxTimeoutSeconds: PAYMENT_WINDOW_SECONDS,
    extra: { ...USDC_DOMAIN },
  };
}

type Extra = Readonly<Record<string, string>>;

/** The 402: the price in the header, where x402 clients read it, and in the body for anyone else. */
function unpaid(required: PaymentRequired, headers: Extra, error?: string): Response {
  const body: PaymentRequired = error === undefined ? required : { ...required, error };
  return json(body, 402, { ...headers, "payment-required": encodePaymentRequiredHeader(body) });
}

const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/** The payer signed for this gate's terms, not terms of their own. */
const accepts = (payload: PaymentPayload, wanted: PaymentRequirements): boolean =>
  payload.x402Version === 2 &&
  payload.accepted.scheme === wanted.scheme &&
  payload.accepted.network === wanted.network &&
  same(payload.accepted.asset, wanted.asset) &&
  payload.accepted.amount === wanted.amount &&
  same(payload.accepted.payTo, wanted.payTo);

const decode = (header: string): PaymentPayload | null => {
  try {
    return decodePaymentSignatureHeader(header);
  } catch {
    return null;
  }
};

/**
 * Verifies the payment, runs `serve`, and settles only if `serve` answered 2xx.
 * The verdict leaves with a PAYMENT-RESPONSE carrying the settlement tx hash.
 */
export async function charge(
  request: Request,
  { pricing, route }: Paid,
  headers: Extra,
  serve: () => Promise<Response>,
): Promise<Response> {
  const wanted = requirementsFor(pricing, route);
  const required: PaymentRequired = {
    x402Version: 2,
    resource: { url: request.url, description: DESCRIPTIONS[route], mimeType: "application/json" },
    accepts: [wanted],
  };

  const header = request.headers.get("payment-signature");
  if (header === null) return unpaid(required, headers);
  const payload = decode(header);
  if (payload === null) return unpaid(required, headers, "PAYMENT-SIGNATURE is not a payment this gate can read.");
  if (!accepts(payload, wanted)) return unpaid(required, headers, "The payment does not match this route's terms.");

  const facilitator = new HTTPFacilitatorClient({
    url: pricing.facilitator ?? ARCUS_FACILITATOR,
    timeoutMs: FACILITATOR_TIMEOUT_MS,
  });

  try {
    const verified = await facilitator.verify(payload, wanted);
    if (!verified.isValid) return unpaid(required, headers, verified.invalidReason ?? "The payment did not verify.");
  } catch (error) {
    console.error("x402 verify failed", error);
    return fail(502, "The payment could not be verified right now. Nothing was charged.", headers);
  }

  const answered = await serve();
  // Nothing the caller can use was produced, so nothing is submitted.
  if (!answered.ok) return answered;

  try {
    const settled = await facilitator.settle(payload, wanted);
    if (!settled.success) return unpaid(required, headers, settled.errorReason ?? "The payment did not settle.");
    const paid = new Headers(answered.headers);
    paid.set("payment-response", encodePaymentResponseHeader(settled));
    return new Response(answered.body, { status: answered.status, headers: paid });
  } catch (error) {
    // A settle that timed out may still land on chain; the verdict is withheld either way.
    console.error("x402 settle failed", error);
    return fail(502, "Settlement did not complete, so the verdict was withheld.", headers);
  }
}
