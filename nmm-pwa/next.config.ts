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
};

export default withPWA(nextConfig);
