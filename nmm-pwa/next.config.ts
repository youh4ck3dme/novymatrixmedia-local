import type { NextConfig } from "next";
// @ts-expect-error next-pwa does not expose compatible Next 16 typings yet
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
