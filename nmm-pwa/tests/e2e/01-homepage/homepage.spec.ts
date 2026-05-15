import { expect, test } from "@playwright/test";

import { safeGoto } from "../_utils/site";

test("[C01-T01][GATE][FULL] Homepage renders main content", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("main")).toBeVisible();
});

test("[C01-T02][GATE][FULL] Homepage renders branding text", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByText(/NOVY MATRIX MEDIA/i).first()).toBeVisible();
});

test("[C01-T03][GATE][FULL] Homepage has no horizontal overflow", async ({ page }) => {
  await safeGoto(page, "/");
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBeFalsy();
});

test("[C01-T04][FULL] Featured block is present", async ({ page }) => {
  await safeGoto(page, "/");
  const hasFeatured = await page.getByText(/Žiadny featured článok/i).count();
  if (hasFeatured > 0) {
    await expect(page.getByText(/Žiadny featured článok/i).first()).toBeVisible();
  } else {
    await expect(page.locator("main article").first()).toBeVisible();
  }
});

test("[C01-T05][FULL] Section heading Najnovšie články is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("heading", { name: /Najnovšie články/i })).toBeVisible();
});

test("[C01-T06][FULL] Section heading Sekcie is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("heading", { name: /^Sekcie$/i })).toBeVisible();
});

test("[C01-T07][FULL] Section heading Video is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("heading", { name: /^Video$/i })).toBeVisible();
});

test("[C01-T08][FULL] Section heading Reakcie is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("heading", { name: /^Reakcie$/i })).toBeVisible();
});

test("[C01-T09][FULL] Quick access strip is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByText(/Rýchly prístup/i).first()).toBeVisible();
});

test("[C01-T10][FULL] Footer remains visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("footer")).toBeVisible();
});
