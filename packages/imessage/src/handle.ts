/**
 * iMessage identifies people by an E.164 phone number or an email address.
 * Formatting is dropped; nothing is guessed — a local number is not assumed
 * to be the same person as some international one.
 */
export function normalizeHandle(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  return trimmed.replace(/[^\d+]/g, "");
}

export type Allowlist = (sender: string | null) => boolean;

export function createAllowlist(handles: readonly string[]): Allowlist {
  const allowed = new Set(handles.map(normalizeHandle));
  return (sender) => sender !== null && allowed.has(normalizeHandle(sender));
}
