import { describe, expect, it } from "vitest";

import { attestationUrl, fetchAttestations, IrisError, parseIrisBody, type FetchLike } from "./iris";
import { routeFor } from "./routes";

const BASE = routeFor(8453)!;
const BASE_SEPOLIA = routeFor(84_532)!;
const TX = "0xabc";

const respond = (body: unknown, status = 200): FetchLike => async () => ({
  ok: status < 400,
  status,
  json: async () => body,
});

describe("iris", () => {
  it("asks the source domain about the burn, on the right network", () => {
    expect(attestationUrl(BASE, TX)).toBe(`https://iris-api.circle.com/v2/messages/6?transactionHash=${TX}`);
    expect(attestationUrl(BASE_SEPOLIA, TX)).toContain("iris-api-sandbox.circle.com");
  });

  it("treats 'not found' as not yet indexed, not as a failure", () => {
    expect(parseIrisBody({ error: "Message not found for provided parameters" })).toEqual([]);
  });

  it("raises anything else Iris calls an error", () => {
    expect(() => parseIrisBody({ error: "rate limited" })).toThrow(IrisError);
  });

  it("refuses a body that is not Iris's", () => {
    expect(() => parseIrisBody({ messages: "nope" })).toThrow(/unrecognised response/);
    expect(() => parseIrisBody({ messages: [{ status: "complete", message: "not hex" }] })).toThrow(IrisError);
  });

  it("holds back a message that is still waiting for confirmations", async () => {
    const pending = respond({ messages: [{ status: "pending_confirmations", message: "0x01" }] });
    await expect(fetchAttestations(BASE, TX, pending)).resolves.toEqual([]);
  });

  it("returns a message once it is signed", async () => {
    const complete = respond({
      messages: [{ status: "complete", message: "0xdead", attestation: "0xbeef", cctpVersion: 2 }],
    });

    const [signed] = await fetchAttestations(BASE, TX, complete);
    expect(signed?.message).toBe("0xdead");
    expect(signed?.attestation).toBe("0xbeef");
  });

  it("reads the body of a 404, because that is where Iris explains itself", async () => {
    const missing = respond({ error: "Message not found for provided parameters" }, 404);
    await expect(fetchAttestations(BASE, TX, missing)).resolves.toEqual([]);
  });

  it("gives up on a server error rather than reporting no attestation", async () => {
    await expect(fetchAttestations(BASE, TX, respond({}, 503))).rejects.toThrow(/503/);
  });
});
