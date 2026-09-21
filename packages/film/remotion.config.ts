import { existsSync } from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

/**
 * The film reads the site's own data so a frame cannot disagree with the page
 * it is advertising — see docs/social/video/docs/storyboard.md. Remotion
 * compiles this file to CJS, so `import.meta` is empty here and the path is
 * resolved from the working directory instead, with a guard rather than a
 * silent miss: an unresolved alias would fail much later as a blank frame.
 */
const SITE_SRC = path.resolve(process.cwd(), "../../src");

if (!existsSync(path.join(SITE_SRC, "data", "docs"))) {
  throw new Error(
    `Run the film commands from packages/film: expected the site's src at ${SITE_SRC}`,
  );
}

Config.setVideoImageFormat("jpeg");
Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...current.resolve?.alias,
      "@site": SITE_SRC,
      "@": SITE_SRC,
    },
  },
}));
