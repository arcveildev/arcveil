import { z } from "zod";

import type { CctpRoute } from "./routes";

/**
 * Circle's attestation service. A burn is not spendable on Arc until Iris has
 * signed it, so this is the waiting room between the two halves of a bridge.
 *
 * The response is someone else's JSON, so it is parsed rather than trusted:
 * anything that does not match the schema is an error with a message, not an
 * `undefined` that surfaces three calls later as a failed transaction.
 */

const MAINNET = "https://iris-api.circle.com";
const SANDBOX = "https://iris-api-sandbox.circle.com";

const hex = z.string().regex(/^0x[0-9a-fA-F]*$/, "expected hex");

const AttestationSchema = z.object({
  status: z.string(),
  message: hex,
  /** Absent until the status is complete, which is exactly what the caller is waiting for. */
  attestation: hex.optional(),
  eventNonce: z.string().optional(),
  cctpVersion: z.number().optional(),
  delayReason: z.string().nullish(),
});

const ResponseSchema = z.union([
  z.object({ messages: z.array(AttestationSchema) }),
  z.object({ error: z.string() }),
]);

export type Attestation = z.infer<typeof AttestationSchema>;

/** A signed attestation: what `VeilGateway.relay` needs, and nothing less. */
export type SignedAttestation = { readonly message: `0x${string}`; readonly attestation: `0x${string}` };

export class IrisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IrisError";
  }
}

export const irisBase = (route: Pick<CctpRoute, "testnet">): string => (route.testnet ? SANDBOX : MAINNET);

/** Where to ask about every CCTP message a given transaction produced. */
export const attestationUrl = (route: CctpRoute, burnTxHash: string): string =>
  `${irisBase(route)}/v2/messages/${route.domain}?transactionHash=${burnTxHash}`;

/**
 * Turns Iris's body into attestations.
 *
 * "Message not found" is not an error here: it is what Iris says for the first
 * minute after a burn, before it has indexed the transaction. It comes back as
 * an empty list so that a poll loop reads as waiting rather than failing.
 */
export const parseIrisBody = (body: unknown): readonly Attestation[] => {
  const parsed = ResponseSchema.safeParse(body);
  if (!parsed.success) throw new IrisError(`unrecognised response from Iris: ${parsed.error.message}`);

  if ("error" in parsed.data) {
    if (/not found/i.test(parsed.data.error)) return [];
    throw new IrisError(parsed.data.error);
  }

  return parsed.data.messages;
};

export const isSigned = (attestation: Attestation): attestation is Attestation & SignedAttestation =>
  attestation.status === "complete" &&
  typeof attestation.attestation === "string" &&
  attestation.attestation.length > 2;

export type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/**
 * One poll. Returns the signed attestations a burn has so far — usually none,
 * then one. Looping, backing off and giving up are the caller's decisions,
 * because a browser and a worker want to make them differently.
 */
export const fetchAttestations = async (
  route: CctpRoute,
  burnTxHash: string,
  fetchImpl: FetchLike,
): Promise<readonly (Attestation & SignedAttestation)[]> => {
  const response = await fetchImpl(attestationUrl(route, burnTxHash));

  // Iris answers 404 with a body that says why, so the body is read either way.
  if (!response.ok && response.status !== 404) {
    throw new IrisError(`Iris returned ${response.status}`);
  }

  return parseIrisBody(await response.json()).filter(isSigned);
};
