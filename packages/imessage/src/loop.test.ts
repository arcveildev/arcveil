import { describe, expect, it } from "vitest";
import { tick, type Deps } from "./loop";
import type { InboundMessage } from "./chat-db";

const OWNER = "+6281234567890";

const msg = (rowid: number, over: Partial<InboundMessage> = {}): InboundMessage => ({
  rowid,
  guid: `g${rowid}`,
  sender: OWNER,
  text: `m${rowid}`,
  sentAt: new Date(0),
  fromMe: false,
  ...over,
});

function harness(messages: readonly InboundMessage[], failSendFor: ReadonlySet<number> = new Set()) {
  const sent: Array<[string, string]> = [];
  const saved: number[] = [];
  const events: string[] = [];
  const deps: Deps = {
    source: { since: (after, limit) => messages.filter((m) => m.rowid > after).slice(0, limit) },
    sink: {
      send: async (to, text) => {
        const rowid = Number(text.replace(/\D/g, ""));
        events.push(`send:${rowid}`);
        if (failSendFor.has(rowid)) throw new Error("offline");
        sent.push([to, text]);
      },
    },
    cursor: {
      save: (rowid) => {
        events.push(`save:${rowid}`);
        saved.push(rowid);
      },
    },
    isAllowed: (sender) => sender === OWNER,
    reply: (text) => `echo: ${text}`,
    log: () => {},
    batch: 50,
  };
  return { deps, sent, saved, events };
}

describe("tick", () => {
  it("replies to the owner and returns the new cursor", async () => {
    const h = harness([msg(1), msg(2)]);
    expect(await tick(h.deps, 0)).toBe(2);
    expect(h.sent).toEqual([
      [OWNER, "echo: m1"],
      [OWNER, "echo: m2"],
    ]);
  });

  it("ignores strangers, its own messages, and messages with no text — but moves past them", async () => {
    const h = harness([msg(1, { sender: "+6281200000000" }), msg(2, { fromMe: true }), msg(3, { text: null }), msg(4, { sender: null })]);
    expect(await tick(h.deps, 0)).toBe(4);
    expect(h.sent).toEqual([]);
  });

  it("saves the cursor before replying, so a crash can drop a reply but never send one twice", async () => {
    const h = harness([msg(1)]);
    await tick(h.deps, 0);
    expect(h.events).toEqual(["save:1", "send:1"]);
  });

  it("keeps going after a failed send, without retrying it", async () => {
    const h = harness([msg(1), msg(2)], new Set([1]));
    expect(await tick(h.deps, 0)).toBe(2);
    expect(h.sent).toEqual([[OWNER, "echo: m2"]]);
    expect(h.events.filter((e) => e === "send:1")).toHaveLength(1);
  });

  it("does nothing when there is nothing new", async () => {
    const h = harness([msg(1)]);
    expect(await tick(h.deps, 1)).toBe(1);
    expect(h.saved).toEqual([]);
  });

  it("skips a message the reply function has nothing to say to", async () => {
    const h = harness([msg(1)]);
    const quiet: Deps = { ...h.deps, reply: () => null };
    expect(await tick(quiet, 0)).toBe(1);
    expect(h.sent).toEqual([]);
  });
});
