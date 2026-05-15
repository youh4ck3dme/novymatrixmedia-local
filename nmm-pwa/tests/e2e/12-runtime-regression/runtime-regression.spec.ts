import { expect, test } from "@playwright/test";

import { collectRuntimeIssues, resolveArticlePath, safeGoto } from "../_utils/site";

test("[C12-T01][FULL] Key routes render without uncaught runtime errors", async ({ page }) => {
  const runtime = collectRuntimeIssues(page);
  await safeGoto(page, "/");
  await safeGoto(page, "/video");
  await safeGoto(page, "/reakcie");
  await safeGoto(page, "/archiv-fotiek");
  runtime.dispose();
  expect(runtime.errors).toEqual([]);
});

test("[C12-T02][GATE][FULL] Key APIs return success statuses", async ({ page }) => {
  const search = await page.request.get("/api/search?q=matrix&mode=all");
  const comments = await page.request.get("/api/comments?page=1&perPage=2");
  expect(search.ok()).toBeTruthy();
  expect(comments.ok()).toBeTruthy();
});

test("[C12-T03][FULL] Key route navigation flow keeps main visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("main")).toBeVisible();
  await safeGoto(page, "/reakcie");
  await expect(page.locator("main")).toBeVisible();
  await safeGoto(page, "/video");
  await expect(page.locator("main")).toBeVisible();
});

test("[C12-T04][FULL] Article route renders without uncaught runtime errors", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  const runtime = collectRuntimeIssues(page);
  await safeGoto(page, articlePath);
  runtime.dispose();
  expect(runtime.errors).toEqual([]);
});

test("[C12-T05][FULL] Search API returns array payload", async ({ page }) => {
  const response = await page.request.get("/api/search?q=novy&mode=articles");
  const payload = await response.json() as { results?: unknown[] };
  expect(Array.isArray(payload.results)).toBeTruthy();
});

test("[C12-T06][FULL] Comments API pagination contract is preserved", async ({ page }) => {
  const response = await page.request.get("/api/comments?page=1&perPage=3");
  const payload = await response.json() as { page?: number; perPage?: number; totalPages?: number };
  expect(typeof payload.page).toBe("number");
  expect(typeof payload.perPage).toBe("number");
  expect(typeof payload.totalPages).toBe("number");
});

test("[C12-T07][FULL] Env check endpoint requires authorization", async ({ page }) => {
  const response = await page.request.get("/api/env-check");
  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test("[C12-T08][FULL] Unknown route resolves to not-found or fallback page", async ({ page }) => {
  const response = await page.request.get("/route-which-should-not-exist-for-nmm-e2e");
  expect([404, 200]).toContain(response.status());
});

test("[C12-T09][FULL] Favicon is available", async ({ page }) => {
  const response = await page.request.get("/favicon.ico");
  expect(response.ok()).toBeTruthy();
});

test("[C12-T10][FULL] Header interactions do not create runtime errors", async ({ page }) => {
  const runtime = collectRuntimeIssues(page);
  await safeGoto(page, "/");
  await page.getByRole("button", { name: /Vyhľadávanie|Otvoriť inteligentné vyhľadávanie/i }).click();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await safeGoto(page, "/");
  await page.getByRole("button", { name: /Otvoriť menu|Zatvoriť menu/i }).click();
  await page.keyboard.press("Escape");
  runtime.dispose();
  expect(runtime.errors).toEqual([]);
});
