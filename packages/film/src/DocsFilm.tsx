import { AbsoluteFill, Sequence } from "remotion";
import { Chain } from "./beats/Chain";
import { Checks } from "./beats/Checks";
import { Closer } from "./beats/Closer";
import { Honest } from "./beats/Honest";
import { Opener } from "./beats/Opener";
import { Receipt } from "./beats/Receipt";
import { Redact } from "./beats/Redact";
import { Terminal } from "./beats/Terminal";
import { Unknown } from "./beats/Unknown";
import { BEATS, COLOR, seconds } from "./theme";

/** The storyboard's beat table, wired to its components. */
const COMPONENT = {
  opener: Opener,
  receipt: Receipt,
  redact: Redact,
  checks: Checks,
  unknown: Unknown,
  chain: Chain,
  terminal: Terminal,
  honest: Honest,
  closer: Closer,
} as const;

export const DocsFilm = () => (
  <AbsoluteFill style={{ background: COLOR.ground }}>
    {BEATS.map((beat) => {
      const Component = COMPONENT[beat.id];
      return (
        <Sequence
          key={beat.id}
          name={beat.id}
          from={seconds(beat.at)}
          durationInFrames={seconds(beat.for)}
        >
          <Component />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
