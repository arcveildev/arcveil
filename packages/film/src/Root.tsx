import { Composition } from "remotion";
import { ChatFilm } from "./chat/ChatFilm";
import { CHAT_FPS, CHAT_HEIGHT, CHAT_TOTAL, CHAT_WIDTH } from "./chat/timing";
import { DocsFilm } from "./DocsFilm";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export const Root = () => (
  <>
  <Composition
    id="DocsFilm"
    component={DocsFilm}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
  <Composition
    id="ChatFilm"
    component={ChatFilm}
    durationInFrames={CHAT_TOTAL}
    fps={CHAT_FPS}
    width={CHAT_WIDTH}
    height={CHAT_HEIGHT}
  />
  </>
);
