/**
 * Copy for /bridge.
 *
 * The rule from docs/AGENT_BRIEF.md applies harder here than anywhere else on
 * the site: this page describes something that moves money and claims to hide
 * a link. Every sentence below is either true of what is deployed, or labelled
 * as not deployed. Nothing is written in the present tense on the strength of
 * a plan.
 */

export const BRIDGE_COPY = {
  label: "Private bridge",
  title: "Bridge.",
  tagline: "Arrive on Arc without bringing your history with you.",
  body:
    "Circle's USDC Bridge moves USDC onto Arc in one transaction and publishes every part of it: who sent it, how much, and where it landed. Fund an agent that way and its whole treasury is legible before it acts. This bridges into a shielded pool instead — the deposit is still public, the withdrawal is still public, and which deposit paid which withdrawal is not.",
  caveat:
    "The privacy here is a crowd, not a cloak. It is worth exactly as much as the number of deposits sitting in the pool alongside yours, and nothing at all when that number is one.",
} as const;

export type BridgeStep = {
  readonly n: string;
  readonly title: string;
  readonly body: string;
  /** What an observer can see once this step has happened. */
  readonly visible: string;
};

export const BRIDGE_STEPS: readonly BridgeStep[] = [
  {
    n: "01",
    title: "Burn",
    body: "One transaction on Ethereum, Base, Arbitrum, OP or Polygon. It names the gateway on Arc as both the payee and the only address allowed to deliver the message, and carries your deposit's commitment in the hook.",
    visible: "Your address, the amount, the time, and that it is going to this pool.",
  },
  {
    n: "02",
    title: "Mint and deposit",
    body: "Circle attests the burn; anyone can deliver it. The gateway mints the USDC and puts it in the pool in the same transaction — it never holds funds between transactions and has no owner, no pause and no sweep.",
    visible: "A deposit of that amount joining the pool.",
  },
  {
    n: "03",
    title: "Wait",
    body: "Your privacy is the deposits that arrive after yours. Withdrawing a minute later, for the same amount you deposited, tells anyone watching exactly which deposit was yours.",
    visible: "Nothing new. This step is the one that does the work.",
  },
  {
    n: "04",
    title: "Withdraw",
    body: "A zero-knowledge proof, built on your device, says you know the secrets behind some commitment in the pool — without saying which. A relayer submits it and is paid out of the withdrawal, so the address receiving the money never needs gas.",
    visible: "A withdrawal to a fresh address. Not which deposit funded it.",
  },
] as const;

export type LedgerRow = { readonly fact: string; readonly who: string; readonly kind: "public" | "private" | "seen" };

/**
 * The honest ledger. Written as a table because a paragraph lets a reader skim
 * past the parts that are not flattering.
 */
export const BRIDGE_LEDGER: readonly LedgerRow[] = [
  { fact: "The burn: your address, the amount, the time", who: "Anyone, on the source chain", kind: "public" },
  { fact: "The deposit joining the pool", who: "Anyone, on Arc", kind: "public" },
  { fact: "The pool's total balance", who: "Anyone, on Arc", kind: "public" },
  { fact: "Every withdrawal: recipient, amount, time", who: "Anyone, on Arc", kind: "public" },
  { fact: "Which deposit funded which withdrawal", who: "Nobody", kind: "private" },
  { fact: "Your note's secrets", who: "Only your device", kind: "private" },
  { fact: "The recipient, the amount, and your IP, while a withdrawal is in flight", who: "The relayer", kind: "seen" },
  { fact: "That an address is blocked, on every USDC movement", who: "Arc's own compliance precompile", kind: "seen" },
] as const;

export type ThreatRow = { readonly threat: string; readonly answer: string; readonly settled: boolean };

export const BRIDGE_THREATS: readonly ThreatRow[] = [
  {
    threat: "The relayer redirects the money, or pays itself more",
    answer:
      "It cannot. The recipient, the fee and the pool are hashed into the proof's context, and the pool recomputes that hash before paying anyone. A relayer can refuse; anyone else can then submit the same proof.",
    settled: true,
  },
  {
    threat: "The relayer learns which deposit you are spending",
    answer: "It cannot. It receives a proof and eight public signals. None of them names a deposit.",
    settled: true,
  },
  {
    threat: "A malformed deposit loses your funds",
    answer:
      "The gateway never reverts after the mint. A bad hook, a dead pool, an amount below the minimum — each becomes a plain transfer to the refund address the burn named.",
    settled: true,
  },
  {
    threat: "The set of spendable deposits is chosen by us",
    answer:
      "It is. A postman we run publishes the association-set root, and today it admits every label without filtering. If it stopped, a deposit could still be pulled back publicly through the gateway's ragequit, which needs nobody's permission — but its privacy would be gone.",
    settled: false,
  },
  {
    threat: "The pool's logic is replaced underneath you",
    answer:
      "The Entrypoint is upgradeable and the 2-of-3 Arcveil account holds that power. Two of three keys can change how withdrawals work. That is a real risk, it is on chain, and there is no timelock in front of it yet.",
    settled: false,
  },
  {
    threat: "Timing and amounts give you away",
    answer:
      "They will, if you let them. Depositing 1,234.56 USDC and withdrawing 1,234.56 USDC an hour later identifies you to anyone with a block explorer, whatever the cryptography does.",
    settled: false,
  },
  {
    threat: "Arc itself refuses the transfer",
    answer:
      "It can. Arc's USDC asks a chain-level precompile whether an address is blocked on every mint and transfer, including out of this pool. Nothing here can override that, and no test covers it — a fork cannot run a precompile.",
    settled: false,
  },
  {
    threat: "The code is wrong",
    answer:
      "The pool contracts and circuits are Privacy Pools, unmodified, audited by Oxorio and Auditware. The gateway, the relayer and the postman are ours and are not audited by anyone.",
    settled: false,
  },
] as const;

export const BRIDGE_NOT_DEPLOYED = {
  title: "Nothing is deployed yet.",
  body: "The contracts build, the tests pass against Circle's live CCTP contracts on a fork of Arc mainnet, and a proof generated by this code verifies against the verifier that would judge it. None of that is a deployment. Until the addresses below are filled in, this page can show you the shape of the thing and refuse to pretend it can move money.",
} as const;

/** What the page needs before any of it can work, so a reader can see what is missing. */
export const BRIDGE_REQUIREMENTS = [
  { key: "Entrypoint", why: "Holds the pool registry and the association-set roots" },
  { key: "PrivacyPool", why: "Holds the USDC and the commitment tree" },
  { key: "VeilGateway", why: "Turns a CCTP burn into a deposit" },
  { key: "Relayer", why: "Submits withdrawals, so a fresh address needs no gas" },
] as const;

export const NOTE_COPY = {
  title: "Your note is one signature.",
  body: "Every deposit's secrets are derived from a single signature, so a lost device is not lost money — sign again on any device and the notes come back. The cost is stated rather than hidden: that signature is the money. Anyone who obtains it can spend every deposit derived from it.",
  warning: "It is never sent anywhere and never stored by this page. Sign it only on arcveil.dev.",
} as const;

export const PROVING_COPY = {
  title: "Proving happens here, not on a server.",
  body: "The withdrawal proof is built in your browser from a 17 MB proving key, downloaded once and kept. It takes a couple of seconds. The secrets it consumes never leave the tab; what goes to the relayer is the proof and eight public numbers.",
} as const;
