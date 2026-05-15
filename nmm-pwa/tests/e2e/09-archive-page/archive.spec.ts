import { expect, test } from "@playwright/test";

import { collectRuntimeIssues, safeGoto } from "../_utils/site";

test("[C09-T01][GATE][FULL] Archive route renders", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  await expect(page.locator("main")).toBeVisible();
});

test("[C09-T02][GATE][FULL] Archive heading is visible", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  await expect(page.getByRole("heading", { name: /Archív fotiek A-Z/i })).toBeVisible();
});

test("[C09-T03][FULL] Archive content block is visible", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  await expect(page.getByText(/Všetky články s fotografiou/i)).toBeVisible();
});

test("[C09-T04][FULL] Archive shows grouped sections or explicit empty state", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  const groups = page.locator("main h2");
  const empty = page.getByText(/Zatiaľ nie sú dostupné žiadne články s fotografiou/i);
  expect((await groups.count()) > 0 || (await empty.count()) > 0).toBeTruthy();
});

test("[C09-T05][FULL] Archive cards render link targets when data is present", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  const links = page.locator("main article a[href^='/']");
  if ((await links.count()) > 0) {
    await expect(links.first()).toBeVisible();
  } else {
    await expect(page.getByText(/Zatiaľ/i).first()).toBeVisible();
  }
});

test("[C09-T06][FULL] Archive page includes site header", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  await expect(page.locator("header").first()).toBeVisible();
});

test("[C09-T07][FULL] Archive page has no horizontal overflow", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBeFalsy();
});

test("[C09-T08][FULL] Archive page remains readable on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await safeGoto(page, "/archiv-fotiek");
  await expect(page.getByRole("heading", { name: /Archív fotiek A-Z/i })).toBeVisible();
});

test("[C09-T09][FULL] Archive page article images are sized when present", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  const image = page.locator("main article img").first();
  if ((await image.count()) > 0) {
    const box = await image.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(20);
      expect(box.height).toBeGreaterThan(20);
    }
  } else {
    await expect(page.getByText(/Zatiaľ/i).first()).toBeVisible();
  }
});

test("[C09-T10][FULL] Archive route has no uncaught runtime errors", async ({ page }) => {
  const runtime = collectRuntimeIssues(page);
  await safeGoto(page, "/archiv-fotiek");
  runtime.dispose();
  expect(runtime.errors).toEqual([]);
});
