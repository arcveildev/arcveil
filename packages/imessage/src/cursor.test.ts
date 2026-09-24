import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileCursor } from "./cursor";

describe("createFileCursor", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "arcveil-cursor-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("has nothing on a first run", () => {
    expect(createFileCursor(join(dir, "state")).load()).toBeNull();
  });

  it("remembers the last row across instances, creating its directory", () => {
    const at = join(dir, "state");
    createFileCursor(at).save(42);
    expect(createFileCursor(at).load()).toBe(42);
  });

  it("refuses to move backwards", () => {
    const cursor = createFileCursor(dir);
    cursor.save(10);
    expect(() => cursor.save(9)).toThrow(/backwards/);
  });

  it("fails loudly on a corrupt file instead of starting over from zero", () => {
    // Starting from zero would replay every message ever received.
    writeFileSync(join(dir, "cursor.json"), "{ nope");
    expect(() => createFileCursor(dir).load()).toThrow(/cursor/);
  });

  it("writes plain JSON", () => {
    createFileCursor(dir).save(7);
    expect(JSON.parse(readFileSync(join(dir, "cursor.json"), "utf8"))).toEqual({ rowid: 7 });
  });
});
