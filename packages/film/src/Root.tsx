import { Composition } from "remotion";
import { DocsFilm } from "./DocsFilm";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export const Root = () => (
  <Composition
    id="DocsFilm"
    component={DocsFilm}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
