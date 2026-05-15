import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3007";
const isLocalTarget = /^(http:\/\/127\.0\.0\.1|http:\/\/localhost)/i.test(baseURL);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: "test-results/e2e/artifacts",
  reporter: [
    ["line"],
    ["json", { outputFile: "test-results/e2e/results.json" }],
    ["html", { outputFolder: "test-results/e2e/html", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
  webServer: isLocalTarget
    ? {
      command: "npm run dev -- --port 3007",
      url: "http://127.0.0.1:3007",
      timeout: 180_000,
      reuseExistingServer: true,
    }
    : undefined,
});
