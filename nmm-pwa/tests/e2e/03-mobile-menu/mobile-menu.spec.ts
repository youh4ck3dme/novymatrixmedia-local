import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { safeGoto } from "../_utils/site";

async function openMobileMenu(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await safeGoto(page, "/");
  const toggle = page.locator("button[aria-controls='mobile-navigation']").first();
  await expect(toggle).toBeVisible();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await toggle.click({ force: true });
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded === "true") {
      return;
    }
    await page.waitForTimeout(200);
  }

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
}

test("[C03-T01][FULL] Mobile menu opens and shows navigation", async ({ page }) => {
  await openMobileMenu(page);
  await expect(page.getByRole("navigation", { name: "Mobilná navigácia" })).toBeVisible();
});

test("[C03-T02][FULL] Mobile menu closes from close button", async ({ page }) => {
  await openMobileMenu(page);
  await page.getByRole("button", { name: "Zatvoriť menu" }).first().click();
  await expect(page.getByRole("navigation", { name: "Mobilná navigácia" })).toHaveCount(0);
});

test("[C03-T03][FULL] Mobile menu backdrop is visible while menu open", async ({ page }) => {
  await openMobileMenu(page);
  await expect(page.getByRole("button", { name: "Zatvoriť menu" }).first()).toBeVisible();
});

test("[C03-T04][FULL] Mobile menu contains multiple links", async ({ page }) => {
  await openMobileMenu(page);
  const links = page.getByRole("navigation", { name: "Mobilná navigácia" }).getByRole("link");
  expect(await links.count()).toBeGreaterThan(6);
});

test("[C03-T05][FULL] Mobile menu displays social links", async ({ page }) => {
  await openMobileMenu(page);
  const social = page.getByRole("navigation", { name: "Mobilná navigácia" }).getByText(/Telegram|TikTok|YouTube|Email/i).first();
  await expect(social).toBeVisible();
});

test("[C03-T06][FULL] Selecting nav link closes mobile menu", async ({ page }) => {
  await openMobileMenu(page);
  const nav = page.getByRole("navigation", { name: "Mobilná navigácia" });
  await nav.getByRole("link").first().click();
  await expect(page.getByRole("navigation", { name: "Mobilná navigácia" })).toHaveCount(0);
});

test("[C03-T07][FULL] Escape key closes mobile menu", async ({ page }) => {
  await openMobileMenu(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobilná navigácia" })).toHaveCount(0);
});

test("[C03-T08][FULL] Mobile menu panel uses fixed positioning", async ({ page }) => {
  await openMobileMenu(page);
  const nav = page.getByRole("navigation", { name: "Mobilná navigácia" });
  await expect(nav).toBeVisible();
  const position = await nav.evaluate((el) => getComputedStyle(el).position);
  expect(position).toBe("fixed");
});

test("[C03-T09][FULL] Mobile menu opening keeps layout without horizontal overflow", async ({ page }) => {
  await openMobileMenu(page);
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBeFalsy();
});

test("[C03-T10][FULL] Opening search from menu state hides menu panel", async ({ page }) => {
  await openMobileMenu(page);
  await page.getByRole("button", { name: /Vyhľadávanie|Otvoriť inteligentné vyhľadávanie/i }).click();
  await expect(page.getByRole("navigation", { name: "Mobilná navigácia" })).toHaveCount(0);
});
