import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
// @ts-expect-error next-pwa does not expose compatible Next 16 typings yet
import withPWAInit from "next-pwa";

const projectDir = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = path.resolve(projectDir, "..");

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  turbopack: {},
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/category/:slug",
        destination: "/:slug",
        statusCode: 301,
      },
      {
        source: "/category/:slug/",
        destination: "/:slug",
        statusCode: 301,
      },
    ];
  },
  images: {
    deviceSizes: [360, 414, 640, 750, 828],
    imageSizes: [96, 128, 256, 384],
    qualities: [60, 62, 65, 75],
    remotePatterns: [
      { protocol: "https", hostname: "novymatrixmedia.sk" },
      { protocol: "https", hostname: "info.novymatrixmedia.sk" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default withPWA(nextConfig);
