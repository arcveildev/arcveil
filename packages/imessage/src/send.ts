import { execFile } from "node:child_process";
import { promisify } from "node:util";

export interface MessageSink {
  send(to: string, text: string): Promise<void>;
}

export type Runner = (file: string, args: readonly string[]) => Promise<unknown>;

/**
 * The recipient and text arrive as `argv`, so nothing a user types is ever
 * spliced into AppleScript source.
 */
export const SEND_SCRIPT = `on run argv
  set theTarget to item 1 of argv
  set theText to item 2 of argv
  tell application "Messages"
    set theService to 1st account whose service type = iMessage
    send theText to participant theTarget of theService
  end tell
end run`;

const SEND_TIMEOUT_MS = 15_000;

const execFileAsync = promisify(execFile);
const defaultRunner: Runner = (file, args) => execFileAsync(file, [...args], { timeout: SEND_TIMEOUT_MS });

export function createAppleScriptSink(run: Runner = defaultRunner): MessageSink {
  return {
    async send(to, text) {
      if (text.trim() === "") throw new Error("refusing to send an empty message");
      await run("osascript", ["-e", SEND_SCRIPT, to, text]);
    },
  };
}
