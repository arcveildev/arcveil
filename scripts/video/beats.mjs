/**
 * Every line below was produced by the real session against Arc mainnet:
 * commands that ran, output they printed, hashes the chain returned. Nothing
 * here is written for effect — if a number changes on chain, this file is wrong
 * and the film is wrong with it.
 */
export const ACCOUNT = "0xb1c0983a7b84f38fbaf5f3af92f0fecaa62ce25d";
export const MANDATE = "0xa69da9d97de54d5a75de897fa48e30fafbf3904072b1dd8f4e7acab651d8977b";
export const MANDATE_REGISTRY = "0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5";
export const ANCHOR_REGISTRY = "0xb2af157f269b31e315099e9da693096833ab8289";
export const ANCHOR_TX = "0xd110e7255737eed92bf59b3df6e656688bc9acf6ed2f33f72ae306f157937bb3";
export const REVOKE_TX = "0x78f194852e5f02fce8ba3524daf7eff27bc47daa4c9c32c398d5fec75a461372";

export const BEATS = [
  {
    id: "01-title",
    kind: "title",
    lines: ["Arc mainnet opened yesterday.", "This is Arcveil, running on it."],
    hold: 2.5,
  },
  {
    id: "02-deployed",
    kind: "facts",
    eyebrow: "Deployed on Arc mainnet · chain 5042",
    rows: [
      ["MandateRegistry", MANDATE_REGISTRY],
      ["AnchorRegistry", ANCHOR_REGISTRY],
      ["Account, 2-of-3", ACCOUNT],
    ],
    note: "Bytecode checked against the local build — identical for the registries, and for the account once its immutables are masked.",
    hold: 3,
  },
  {
    id: "03-prepare",
    kind: "terminal",
    title: "An action is prepared. The account is asked what it will hash.",
    lines: [
      { t: "cmd", v: "pnpm intent prepare anchor 0xcfb1186141e6…f2fc" },
      { t: "out", v: "account 0xb1c0983a…ce25d  epoch 1  nonce 0" },
      { t: "out", v: "expires 2026-09-16T18:51:37.000Z" },
      { t: "ok", v: "digest 0x84a2dfb8…2bba  (confirmed against the account itself)" },
    ],
    hold: 3,
  },
  {
    id: "04-sign",
    kind: "terminal",
    title: "Two of three keys sign. Neither is the wallet that pays.",
    lines: [
      { t: "cmd", v: "cast wallet sign --data --from-file .arcveil/intent.typed.json --account arcveil-device" },
      { t: "dim", v: "Enter keystore password:" },
      { t: "out", v: "0xce9b29be…fe7a1c" },
      { t: "cmd", v: "cast wallet sign … --account arcveil-cosigner" },
      { t: "dim", v: "Enter keystore password:" },
      { t: "out", v: "0xddfe4719…58651b" },
      { t: "ok", v: "signed by 0xE3CcD5C4…600d and 0x71f1B18B…ed63 — both members, distinct" },
    ],
    hold: 2.6,
  },
  {
    id: "06-revoke",
    kind: "terminal",
    title: "The account revokes its own mandate.",
    lines: [
      { t: "cmd", v: "pnpm intent prepare revoke 1" },
      { t: "out", v: "mandateOf(account, 1) → revokedAt 0 · isLive true" },
      { t: "dim", v: "… two signatures, relayed …" },
      { t: "out", v: `tx ${REVOKE_TX.slice(0, 10)}…${REVOKE_TX.slice(-4)}  block 21197420` },
      { t: "bad", v: "mandateOf(account, 1) → revokedAt 1789582067 · isLive false" },
    ],
    hold: 3,
  },
  {
    id: "07-refusal",
    kind: "refusal",
    title: "The same action, again.",
    command: "executeFromEntryPoint(anchor …, epoch 1, 0xa69da9d9…977b)",
    revert: "0xb254c866" +
      "0000000000000000000000000000000000000000000000000000000000000001" +
      "a69da9d97de54d5a75de897fa48e30fafbf3904072b1dd8f4e7acab651d8977b",
    decoded: "MandateNotLive(epoch 1, 0xa69da9d9…977b)",
    line: "The contract refused. Not a policy engine. Not us.",
    hold: 5,
  },
  {
    id: "09-end",
    kind: "end",
    line: "The first privacy layer for agents, built on Arc.",
    url: "arcveil.dev",
    honest: "unaudited · no enclave yet · nothing is at stake",
    hold: 3.6,
  },
];
