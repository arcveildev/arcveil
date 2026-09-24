import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openChatDb } from "./chat-db";

// The slice of Messages' schema this package reads.
const SCHEMA = `
  CREATE TABLE handle (ROWID INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL, service TEXT);
  CREATE TABLE message (
    ROWID INTEGER PRIMARY KEY AUTOINCREMENT, guid TEXT UNIQUE NOT NULL, text TEXT,
    attributedBody BLOB, handle_id INTEGER DEFAULT 0, date INTEGER, is_from_me INTEGER DEFAULT 0,
    service TEXT, associated_message_type INTEGER DEFAULT 0
  );`;

const blob = (text: string): Buffer => {
  const bytes = Buffer.from(text, "utf8");
  return Buffer.concat([Buffer.from("NSString"), Buffer.from([0x01, 0x94, 0x84, 0x01, 0x2b, bytes.length]), bytes]);
};

describe("openChatDb", () => {
  let dir: string;
  let path: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "arcveil-im-"));
    path = join(dir, "chat.db");
    const db = new DatabaseSync(path);
    db.exec(SCHEMA);
    db.prepare("INSERT INTO handle (id, service) VALUES (?, ?)").run("+6281234567890", "iMessage");
    const insert = db.prepare(
      "INSERT INTO message (guid, text, attributedBody, handle_id, date, is_from_me, service, associated_message_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    insert.run("g1", "saldo", null, 1, 811_900_800_000_000_000n, 0, "iMessage", 0);
    insert.run("g2", null, blob("kirim 20 ke budi"), 1, 811_900_801_000_000_000n, 0, "iMessage", 0);
    insert.run("g3", "echo: saldo", null, 1, 811_900_802_000_000_000n, 1, "iMessage", 0);
    insert.run("g4", null, null, 1, 811_900_803_000_000_000n, 0, "iMessage", 2000); // a tapback
    db.close();
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("knows the newest row, so a first run can start after history instead of replaying it", () => {
    const chat = openChatDb(path);
    expect(chat.latestRowid()).toBe(4);
    chat.close();
  });

  it("returns messages after a cursor, oldest first, with text from either column", () => {
    const chat = openChatDb(path);
    const rows = chat.since(0, 10);
    chat.close();

    expect(rows.map((m) => m.rowid)).toEqual([1, 2, 3]);
    expect(rows[0]).toMatchObject({ guid: "g1", sender: "+6281234567890", text: "saldo", fromMe: false });
    expect(rows[0]?.sentAt.toISOString()).toBe("2026-09-24T00:00:00.000Z");
    expect(rows[1]?.text).toBe("kirim 20 ke budi");
    expect(rows[2]?.fromMe).toBe(true);
  });

  it("leaves reactions out: a tapback is not a command", () => {
    const chat = openChatDb(path);
    expect(chat.since(3, 10)).toEqual([]);
    chat.close();
  });

  it("honours the limit", () => {
    const chat = openChatDb(path);
    expect(chat.since(0, 1).map((m) => m.rowid)).toEqual([1]);
    chat.close();
  });

  it("never writes: the database is opened read-only", () => {
    const chat = openChatDb(path);
    expect(() => chat.since(0, 1)).not.toThrow();
    chat.close();
    const db = new DatabaseSync(path, { readOnly: true });
    expect(() => db.exec("DELETE FROM message")).toThrow();
    db.close();
  });
});
