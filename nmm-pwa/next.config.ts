import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
// @ts-expect-error next-pwa does not expose compatible Next 16 typings yet
import withPWAInit from "next-pwa";

const projectDir = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = path.resolve(projectDir, "..");
const require = createRequire(import.meta.url);

type RuntimeCachingEntry = {
  urlPattern: RegExp | ((context: { url: URL }) => boolean);
  handler: string;
  method?: string;
  options?: {
    cacheName?: string;
    expiration?: Record<string, unknown>;
    networkTimeoutSeconds?: number;
    rangeRequests?: boolean;
  };
};

const defaultRuntimeCaching = require("next-pwa/cache") as RuntimeCachingEntry[];

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  runtimeCaching: [
    {
      urlPattern: /\/_next\/static\/.*\.(?:js|css)$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "next-static-assets",
        expiration: {
          maxEntries: 24,
          maxAgeSeconds: 60 * 60,
        },
        networkTimeoutSeconds: 8,
      },
    },
    ...defaultRuntimeCaching.map((entry) => {
      if (entry.urlPattern instanceof RegExp && /\.(?:css|less|js)$/i.test(entry.urlPattern.toString())) {
        return {
          ...entry,
          options: {
            ...entry.options,
            expiration: {
              ...(entry.options?.expiration ?? {}),
              maxAgeSeconds: 60 * 60,
            },
          },
        };
      }
      return entry;
    }),
  ],
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
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [96, 128, 256, 384],
    qualities: [60, 62, 65, 75, 88, 90, 92, 95],
    remotePatterns: [
      { protocol: "https", hostname: "novymatrixmedia.sk" },
      { protocol: "https", hostname: "info.novymatrixmedia.sk" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default withPWA(nextConfig);
