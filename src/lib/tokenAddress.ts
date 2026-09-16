/** Contract-address helpers for the token placement on the homepage. */

const HEX_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const SHORT_HEAD = 6;
const SHORT_TAIL = 4;

export const isHexAddress = (value: string): value is `0x${string}` => HEX_ADDRESS_RE.test(value);

/** `0xcd48…31f5` for display where the full address would not fit. */
export const shortenAddress = (value: string): string =>
  isHexAddress(value) ? `${value.slice(0, SHORT_HEAD)}…${value.slice(-SHORT_TAIL)}` : value;
