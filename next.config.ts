import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Bump esta revisão sempre que o conteúdo de src/app/~offline/page.tsx mudar,
  // para o service worker saber que precisa recachear a página offline.
  additionalPrecacheEntries: [{ url: "/~offline", revision: "offline-v1" }],
});

export default withSerwist(nextConfig);
