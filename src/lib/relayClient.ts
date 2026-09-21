import { z } from "zod";

/**
 * Talking to the relayer.
 *
 * Its answers are parsed, not trusted. A relayer is a third party by
 * construction — the point of the design is that it cannot cheat, not that it
 * is honest — so a malformed reply becomes an error with a sentence rather
 * than an `undefined` that surfaces later as a failed transaction.
 *
 * What we send it: a proof and eight public numbers, or an attested CCTP
 * message. What it can see: the recipient, the amount, and the IP the request
 * came from. That is written on the page, not only here.
 */

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/).transform((v) => v as `0x${string}`);
const hash = z.string().regex(/^0x[0-9a-fA-F]{64}$/).transform((v) => v as `0x${string}`);
const decimal = z.string().regex(/^\d+$/);

const QuoteSchema = z.object({
  entrypoint: address,
  gateway: address,
  pool: address,
  scope: decimal,
  feeRecipient: address,
  minFeeBPS: decimal,
});

const StatusSchema = z.object({
  deposits: z.number().int().nonnegative(),
  root: decimal,
  publishedRoot: decimal,
  upToDate: z.boolean(),
  policy: z.string(),
});

const SentSchema = z.object({ hash });
const ErrorSchema = z.object({ error: z.string() });

export type Quote = z.infer<typeof QuoteSchema>;
export type RelayStatus = z.infer<typeof StatusSchema>;

export class RelayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RelayError";
  }
}

const parse = <T>(schema: z.ZodType<T>, body: unknown, what: string): T => {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new RelayError(`The relayer's ${what} was not in the expected shape.`);
  return parsed.data;
};

async function call<T>(url: string, schema: z.ZodType<T>, what: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new RelayError("The relayer could not be reached. Nothing was sent.");
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const failure = ErrorSchema.safeParse(body);
    throw new RelayError(failure.success ? failure.data.error : `The relayer returned ${response.status}.`);
  }

  return parse(schema, body, what);
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

/** The terms a proof must be built against: the fee goes into the proof, so it cannot be renegotiated after. */
export const getQuote = (relayer: string): Promise<Quote> => call(`${relayer}/quote`, QuoteSchema, "quote");

/** How many deposits are in the pool — which is exactly how much privacy it can offer. */
export const getStatus = (relayer: string): Promise<RelayStatus> => call(`${relayer}/status`, StatusSchema, "status");

/** Hands an attested burn to the relayer, because the depositor has no gas on Arc yet. */
export const deliverDeposit = (
  relayer: string,
  message: `0x${string}`,
  attestation: `0x${string}`,
): Promise<{ hash: `0x${string}` }> =>
  call(`${relayer}/deliver`, SentSchema, "reply", json({ message, attestation }));

export type WithdrawBody = {
  readonly recipient: `0x${string}`;
  readonly relayFeeBPS: string;
  readonly proof: {
    readonly pA: readonly string[];
    readonly pB: readonly (readonly string[])[];
    readonly pC: readonly string[];
    readonly pubSignals: readonly string[];
  };
};

export const submitWithdrawal = (relayer: string, body: WithdrawBody): Promise<{ hash: `0x${string}` }> =>
  call(`${relayer}/withdraw`, SentSchema, "reply", json(body));
