import type { NextConfig } from "next";

/**
 * Today the site is a static export served by GitHub Pages.
 * When a server is introduced, run the build with `NEXT_OUTPUT=standalone`
 * (or drop the `output` key) to unlock SSR, Route Handlers, Server Actions, etc.
 * No application code needs to change.
 */
const output = process.env.NEXT_OUTPUT === "standalone" ? "standalone" : "export";

/**
 * GitHub Pages serves project sites from `/<repo-name>`. The deploy workflow
 * injects the right value; locally it stays empty so `npm run dev` works at `/`.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output,
  basePath,
  trailingSlash: true,
  images: {
    // The default image optimizer needs a server.
    unoptimized: output === "export",
  },
};

export default nextConfig;
