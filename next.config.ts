import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Every route is static and the verifier talks to Arc straight from the
   * browser, so there is no server to run. Export the site and host it as
   * files; when something genuinely needs a server, this is the line to revisit.
   */
  output: "export",
  images: { unoptimized: true },
  /* config options here */
};

export default nextConfig;
