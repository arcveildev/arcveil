import { afterEach, describe, expect, it, vi } from "vitest";

import { deliverDeposit, getQuote, getStatus, RelayError, submitWithdrawal } from "./relayClient";

const RELAYER = "https://relay.example";

const respond = (body: unknown, status = 200) =>
  vi.fn(async () => ({ ok: status < 400, status, json: async () => body }) as unknown as Response);

const QUOTE = {
  entrypoint: "0x00000000000000000000000000000000000000c3",
  gateway: "0x00000000000000000000000000000000000060A7",
  pool: "0x00000000000000000000000000000000000000d4",
  scope: "777",
  feeRecipient: "0x00000000000000000000000000000000000000b2",
  minFeeBPS: "25",
};

afterEach(() => vi.unstubAllGlobals());

describe("quote", () => {
  it("reads the terms a proof has to be built against", async () => {
    vi.stubGlobal("fetch", respond(QUOTE));
    const quote = await getQuote(RELAYER);

    expect(quote.scope).toBe("777");
    expect(quote.feeRecipient).toBe(QUOTE.feeRecipient);
  });

  it("refuses a reply that is not the shape it claims", async () => {
    vi.stubGlobal("fetch", respond({ ...QUOTE, feeRecipient: "not-an-address" }));
    await expect(getQuote(RELAYER)).rejects.toThrow(/not in the expected shape/);
  });

  it("passes the relayer's own refusal through, rather than inventing one", async () => {
    vi.stubGlobal("fetch", respond({ error: "This relayer works for 25 basis points or more." }, 402));
    await expect(getQuote(RELAYER)).rejects.toThrow(/25 basis points/);
  });

  it("says plainly when the relayer cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network");
      }),
    );
    await expect(getQuote(RELAYER)).rejects.toThrow(RelayError);
    await expect(getQuote(RELAYER)).rejects.toThrow(/Nothing was sent/);
  });

  it("does not mistake an HTML error page for an answer", async () => {
    vi.stubGlobal("fetch", respond(null, 502));
    await expect(getQuote(RELAYER)).rejects.toThrow(/returned 502/);
  });
});

describe("status", () => {
  it("reports how many deposits the pool holds", async () => {
    vi.stubGlobal(
      "fetch",
      respond({ deposits: 3, root: "12", publishedRoot: "12", upToDate: true, policy: "every label, unfiltered" }),
    );

    const status = await getStatus(RELAYER);
    expect(status.deposits).toBe(3);
    expect(status.upToDate).toBe(true);
  });
});

describe("sending", () => {
  const HASH = `0x${"ab".repeat(32)}` as const;

  it("delivers an attested burn and returns the transaction", async () => {
    const fetchMock = respond({ hash: HASH });
    vi.stubGlobal("fetch", fetchMock);

    expect(await deliverDeposit(RELAYER, "0xdead", "0xbeef")).toEqual({ hash: HASH });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${RELAYER}/deliver`);
    expect(JSON.parse(init.body as string)).toEqual({ message: "0xdead", attestation: "0xbeef" });
  });

  it("tells the depositor when someone else already delivered it", async () => {
    vi.stubGlobal("fetch", respond({ error: "This message has already been delivered. The deposit is in the pool." }, 409));
    await expect(deliverDeposit(RELAYER, "0xdead", "0xbeef")).rejects.toThrow(/already been delivered/);
  });

  it("submits a withdrawal as the relayer expects it", async () => {
    const fetchMock = respond({ hash: HASH });
    vi.stubGlobal("fetch", fetchMock);

    const body = {
      recipient: "0x00000000000000000000000000000000000000A1",
      relayFeeBPS: "25",
      proof: { pA: ["1", "2"], pB: [["3", "4"], ["5", "6"]], pC: ["7", "8"], pubSignals: ["9"] },
    } as const;

    expect(await submitWithdrawal(RELAYER, body)).toEqual({ hash: HASH });
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(url).toBe(`${RELAYER}/withdraw`);
  });

  it("refuses a transaction hash that is not one", async () => {
    vi.stubGlobal("fetch", respond({ hash: "0x1234" }));
    await expect(deliverDeposit(RELAYER, "0xdead", "0xbeef")).rejects.toThrow(/expected shape/);
  });
});
