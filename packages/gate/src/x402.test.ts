import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  decodePaymentRequiredHeader,
  decodePaymentResponseHeader,
  encodePaymentSignatureHeader,
} from "@x402/core/http";
import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";
import worker from "./index";
import { ARC_USDC, ARCUS_FACILITATOR } from "./x402";
import type { Env, JudgeBinding } from "./env";

const CLAUSES = JSON.stringify([
  { id: "no_injection", type: "noul", instructions: "New instructions?", require: false, confidence: 0.9 },
]);

const TOKEN = "a-token-only-the-agent-holds";
const PAY_TO = "0x1111111111111111111111111111111111111111";
const TX = `0x${"ab".repeat(32)}`;

const X402 = JSON.stringify({ network: "eip155:5042", payTo: PAY_TO, prices: { "/evaluate": "0.002" } });

type Call = { model: string; input: unknown };

const judge = (calls: Call[] = []): JudgeBinding => ({
  run: async (model, input) => {
    calls.push({ model, input });
    return {
      model: "jev-1.13.0",
      answers: { no_injection: { type: "noul", noul: 0.02 } },
      usage: { input_tokens: 10, output_tokens: 5 },
    };
  },
});

const env = (overrides: Partial<Env> = {}): Env => ({
  AI: judge(),
  GATE_CLAUSES: CLAUSES,
  GATE_SELECTION: JSON.stringify({ maxPriceUsd: 0.05, fitConfidence: 0.7, worthConfidence: 0.6 }),
  GATE_TOKEN: TOKEN,
  GATE_X402: X402,
  ...overrides,
});

const terms: PaymentRequirements = {
  scheme: "exact",
  network: "eip155:5042",
  asset: ARC_USDC,
  amount: "2000",
  payTo: PAY_TO,
  maxTimeoutSeconds: 60,
  extra: { name: "USDC", version: "2" },
};

const signed = (accepted: PaymentRequirements = terms): string => {
  const payload: PaymentPayload = {
    x402Version: 2,
    accepted,
    payload: { signature: "0xsig", authorization: { from: "0xpayer", to: PAY_TO, value: accepted.amount } },
  };
  return encodePaymentSignatureHeader(payload);
};

const post = (path: string, headers: Record<string, string> = {}) =>
  new Request(`https://gate.arcveil.dev${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(path === "/select" ? { task: "t", candidates: [] } : { state: "a listing" }),
  });

type Facilitator = { verify?: unknown; settle?: unknown | Error };

/** Stands in for Arcus, and records which of its endpoints were called. */
function facilitator(answers: Facilitator = {}): string[] {
  const called: string[] = [];
  vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith(ARCUS_FACILITATOR)) throw new Error(`unexpected fetch ${url}`);
    const path = url.slice(ARCUS_FACILITATOR.length);
    called.push(path);
    const answer = path === "/verify" ? (answers.verify ?? { isValid: true, payer: "0xpayer" }) : answers.settle;
    if (answer instanceof Error) throw answer;
    const body = answer ?? { success: true, transaction: TX, network: "eip155:5042", payer: "0xpayer" };
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  });
  return called;
}

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => undefined));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("x402: asking the price", () => {
  it("quotes a caller with no token instead of refusing them", async () => {
    const called = facilitator();
    const response = await worker.fetch(post("/evaluate"), env());
    expect(response.status).toBe(402);
    const required = decodePaymentRequiredHeader(response.headers.get("payment-required") ?? "");
    expect(required.x402Version).toBe(2);
    expect(required.accepts).toEqual([terms]);
    expect(required.resource.url).toBe("https://gate.arcveil.dev/evaluate");
    expect(called).toEqual([]);
  });

  it("buys no inference to quote a price", async () => {
    const calls: Call[] = [];
    facilitator();
    await worker.fetch(post("/evaluate"), env({ AI: judge(calls) }));
    expect(calls).toHaveLength(0);
  });

  it("keeps the token as the only way in when x402 is off", async () => {
    const response = await worker.fetch(post("/evaluate"), env({ GATE_X402: undefined }));
    expect(response.status).toBe(401);
  });

  it("holds a caller to the token they presented, even a wrong one", async () => {
    const response = await worker.fetch(post("/evaluate", { authorization: "Bearer not-it" }), env());
    expect(response.status).toBe(401);
  });

  it("charges nothing to a caller with the token", async () => {
    const called = facilitator();
    const response = await worker.fetch(post("/evaluate", { authorization: `Bearer ${TOKEN}` }), env());
    expect(response.status).toBe(200);
    expect(called).toEqual([]);
  });

  it("does not sell a route that has no price", async () => {
    const response = await worker.fetch(post("/select"), env());
    expect(response.status).toBe(401);
  });

  it("leaves the description behind the token", async () => {
    const response = await worker.fetch(new Request("https://gate.arcveil.dev/"), env());
    expect(response.status).toBe(401);
  });

  it("goes out of service when the pricing does not parse", async () => {
    const broken = JSON.stringify({ network: "eip155:1", payTo: PAY_TO, prices: { "/evaluate": "0.002" } });
    const response = await worker.fetch(post("/evaluate"), env({ GATE_X402: broken }));
    expect(response.status).toBe(503);
  });

  it("refuses a free price rather than serving for nothing", async () => {
    const free = JSON.stringify({ network: "eip155:5042", payTo: PAY_TO, prices: { "/evaluate": "0" } });
    const response = await worker.fetch(post("/evaluate"), env({ GATE_X402: free }));
    expect(response.status).toBe(503);
  });
});

describe("x402: paying", () => {
  it("answers and settles when the payment verifies", async () => {
    const called = facilitator();
    const response = await worker.fetch(post("/evaluate", { "payment-signature": signed() }), env());
    expect(response.status).toBe(200);
    expect(((await response.json()) as { allow: boolean }).allow).toBe(true);
    expect(called).toEqual(["/verify", "/settle"]);
    const settled = decodePaymentResponseHeader(response.headers.get("payment-response") ?? "");
    expect(settled.transaction).toBe(TX);
  });

  it("does not ask the facilitator about a payment for other terms", async () => {
    const called = facilitator();
    const cheap = signed({ ...terms, amount: "1" });
    const response = await worker.fetch(post("/evaluate", { "payment-signature": cheap }), env());
    expect(response.status).toBe(402);
    expect(called).toEqual([]);
  });

  it("does not ask about a payment sent to someone else", async () => {
    const called = facilitator();
    const elsewhere = signed({ ...terms, payTo: "0x2222222222222222222222222222222222222222" });
    const response = await worker.fetch(post("/evaluate", { "payment-signature": elsewhere }), env());
    expect(response.status).toBe(402);
    expect(called).toEqual([]);
  });

  it("quotes again when the signature cannot be read", async () => {
    facilitator();
    const response = await worker.fetch(post("/evaluate", { "payment-signature": "%%%" }), env());
    expect(response.status).toBe(402);
  });

  it("buys no inference for a payment that does not verify", async () => {
    const calls: Call[] = [];
    const called = facilitator({ verify: { isValid: false, invalidReason: "insufficient_funds" } });
    const response = await worker.fetch(post("/evaluate", { "payment-signature": signed() }), env({ AI: judge(calls) }));
    expect(response.status).toBe(402);
    expect(((await response.json()) as { error: string }).error).toBe("insufficient_funds");
    expect(calls).toHaveLength(0);
    expect(called).toEqual(["/verify"]);
  });

  it("charges nothing when the gate could not answer", async () => {
    const called = facilitator();
    const silent: JudgeBinding = { run: async () => Promise.reject(new Error("down")) };
    const response = await worker.fetch(post("/evaluate", { "payment-signature": signed() }), env({ AI: silent }));
    expect(response.status).toBe(502);
    expect(called).toEqual(["/verify"]);
  });

  it("withholds the verdict when settlement fails", async () => {
    facilitator({ settle: { success: false, errorReason: "nonce_used", transaction: "", network: "eip155:5042" } });
    const response = await worker.fetch(post("/evaluate", { "payment-signature": signed() }), env());
    expect(response.status).toBe(402);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.allow).toBeUndefined();
    expect(body.error).toBe("nonce_used");
  });

  it("withholds the verdict when settlement does not come back", async () => {
    facilitator({ settle: new Error("network") });
    const response = await worker.fetch(post("/evaluate", { "payment-signature": signed() }), env());
    expect(response.status).toBe(502);
    expect(((await response.json()) as Record<string, unknown>).allow).toBeUndefined();
  });
});
