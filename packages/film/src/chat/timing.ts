/**
 * "In the chat" — the iMessage concept film. The storyboard's beat table as
 * code: docs/social/video/imessage-concept/storyboard.md.
 */
export const CHAT_FPS = 30;
export const CHAT_WIDTH = 1080;
export const CHAT_HEIGHT = 1350;

export const at = (s: number) => Math.round(s * CHAT_FPS);

export const CHAT_BEATS = [
  { id: "open", at: 0, for: 2.5 },
  { id: "send", at: 2.5, for: 5.5 },
  { id: "tap", at: 8, for: 2 },
  { id: "verify", at: 10, for: 4.5 },
  { id: "refuse", at: 14.5, for: 5 },
  { id: "close", at: 19.5, for: 2.5 },
  { id: "end", at: 22, for: 3 },
] as const;

export const CHAT_TOTAL = at(CHAT_BEATS.reduce((end, b) => Math.max(end, b.at + b.for), 0));

/** The CONCEPT tag rides every frame until the end card, which carries it itself. */
export const CONCEPT_UNTIL = at(22);

/** The friend. International and gender-neutral, decided 2026-09-25. */
export const FRIEND = "Sam";
