import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("needs at least one allowed sender: an open bot would answer anyone", () => {
    const result = loadConfig({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/ARCVEIL_IM_ALLOW/);
  });

  it("fills sensible defaults around the allowlist", () => {
    const result = loadConfig({ ARCVEIL_IM_ALLOW: "+6281234567890, me@icloud.com" });
    expect(result).toEqual({
      ok: true,
      config: {
        allow: ["+6281234567890", "me@icloud.com"],
        chatDb: join(homedir(), "Library/Messages/chat.db"),
        stateDir: join(homedir(), ".arcveil/imessage"),
        pollMs: 1500,
      },
    });
  });

  it("refuses a poll interval that would hammer the database or feel dead", () => {
    expect(loadConfig({ ARCVEIL_IM_ALLOW: "+62812", ARCVEIL_IM_POLL_MS: "10" }).ok).toBe(false);
    expect(loadConfig({ ARCVEIL_IM_ALLOW: "+62812", ARCVEIL_IM_POLL_MS: "600000" }).ok).toBe(false);
  });
});
