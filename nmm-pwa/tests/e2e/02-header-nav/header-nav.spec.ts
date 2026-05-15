import { expect, test } from "@playwright/test";

import { safeGoto } from "../_utils/site";

test("[C02-T01][GATE][FULL] Header renders on homepage", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("header").first()).toBeVisible();
});

test("[C02-T02][GATE][FULL] Search button is visible in header", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("button", { name: /Vyhľadávanie|Otvoriť inteligentné vyhľadávanie/i })).toBeVisible();
});

test("[C02-T03][GATE][FULL] Header logo links to homepage", async ({ page }) => {
  await safeGoto(page, "/");
  const logoLink = page.locator("header").first().getByRole("link", { name: /NOVY MATRIX MEDIA - domov/i }).first();
  await expect(logoLink).toBeVisible();
  await expect(logoLink).toHaveAttribute("href", "/");
});

test("[C02-T04][FULL] Navigation controls are present for current viewport", async ({ page }) => {
  await safeGoto(page, "/");
  const desktopNavCount = await page.locator("header nav").count();
  const menuButtonCount = await page.getByRole("button", { name: /Otvoriť menu|Zatvoriť menu/i }).count();
  expect(desktopNavCount > 0 || menuButtonCount > 0).toBeTruthy();
});

test("[C02-T05][FULL] Header label Vyberáme is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByText(/Vyberáme/i).first()).toBeVisible();
});

test("[C02-T06][FULL] Header social actions are discoverable", async ({ page }) => {
  await safeGoto(page, "/");
  const socialText = page.getByText(/Telegram|TikTok|YouTube|Email/i).first();
  await expect(socialText).toBeVisible();
});

test("[C02-T07][FULL] Header has internal navigation links", async ({ page }) => {
  await safeGoto(page, "/");
  const links = page.locator("header a[href^='/']");
  expect(await links.count()).toBeGreaterThan(2);
});

test("[C02-T08][FULL] Header links remain inside viewport width", async ({ page }) => {
  await safeGoto(page, "/");
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const width = viewport?.width ?? 390;
  const links = page.locator("header a");
  const sampleCount = Math.min(await links.count(), 8);

  for (let i = 0; i < sampleCount; i += 1) {
    const box = await links.nth(i).boundingBox();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(width + 2);
    }
  }
});

test("[C02-T09][FULL] Header tap targets keep minimum height", async ({ page }) => {
  await safeGoto(page, "/");
  const targets = page.locator("header a, header button");
  const sampleCount = Math.min(await targets.count(), 12);
  expect(sampleCount).toBeGreaterThan(2);

  for (let i = 0; i < sampleCount; i += 1) {
    const box = await targets.nth(i).boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  }
});

test("[C02-T10][FULL] Header logo image is rendered", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("header img[alt='NOVY MATRIX MEDIA logo']").first()).toBeVisible();
});
