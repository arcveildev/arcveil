import { describe, expect, it } from "vitest";
import { createAppleScriptSink, SEND_SCRIPT } from "./send";

describe("createAppleScriptSink", () => {
  it("passes the recipient and text as arguments, never inside the script", async () => {
    const calls: Array<readonly string[]> = [];
    const sink = createAppleScriptSink(async (file, args) => {
      calls.push([file, ...args]);
    });

    const hostile = `" & (do shell script "rm -rf ~") & "`;
    await sink.send("+6281234567890", hostile);

    expect(calls).toEqual([["osascript", "-e", SEND_SCRIPT, "+6281234567890", hostile]]);
    expect(SEND_SCRIPT).not.toContain(hostile);
  });

  it("refuses an empty message rather than sending a blank bubble", async () => {
    const sink = createAppleScriptSink(async () => {});
    await expect(sink.send("+6281234567890", "  ")).rejects.toThrow(/empty/);
  });

  it("surfaces a failed send", async () => {
    const sink = createAppleScriptSink(async () => {
      throw new Error("Messages got an error: Can’t get participant");
    });
    await expect(sink.send("+6281234567890", "hi")).rejects.toThrow(/participant/);
  });
});
