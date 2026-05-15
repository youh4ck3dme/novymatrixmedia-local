import { expect, test } from "@playwright/test";

import { safeGoto } from "../_utils/site";

async function openSearch(page: import("@playwright/test").Page) {
  await safeGoto(page, "/");
  const trigger = page.locator("button[aria-label='Otvoriť inteligentné vyhľadávanie']").first();
  await expect(trigger).toBeVisible();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await trigger.click({ force: true });
    const headingCount = await page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i }).count();
    if (headingCount > 0) {
      return;
    }
    await page.waitForTimeout(200);
  }
  await expect(page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i })).toBeVisible();
}

test("[C04-T01][FULL] Search overlay opens from header action", async ({ page }) => {
  await openSearch(page);
  await expect(page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i })).toBeVisible();
});

test("[C04-T02][FULL] Search overlay closes on Escape", async ({ page }) => {
  await openSearch(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i })).toHaveCount(0);
});

test("[C04-T03][FULL] Search overlay closes on close button", async ({ page }) => {
  await openSearch(page);
  await page.getByRole("button", { name: "Zavrieť" }).click();
  await expect(page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i })).toHaveCount(0);
});

test("[C04-T04][FULL] Search input is focused after open", async ({ page }) => {
  await openSearch(page);
  const input = page.getByPlaceholder(/Hľadaj články, témy alebo fotky/i);
  await expect(input).toBeFocused();
});

test("[C04-T05][FULL] Search mode buttons are visible", async ({ page }) => {
  await openSearch(page);
  await expect(page.getByRole("button", { name: "Všetko" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Články" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Fotky" })).toBeVisible();
});

test("[C04-T06][FULL] Short query shows minimum length hint", async ({ page }) => {
  await openSearch(page);
  await page.getByPlaceholder(/Hľadaj články, témy alebo fotky/i).fill("a");
  await expect(page.getByText(/Zadaj aspoň 2 znaky/i)).toBeVisible();
});

test("[C04-T07][FULL] Query with 2+ chars updates status text", async ({ page }) => {
  await openSearch(page);
  await page.getByPlaceholder(/Hľadaj články, témy alebo fotky/i).fill("matrix");
  await expect(page.getByText(/Vyhľadávam|Nájdené výsledky|Nenašli sa výsledky/i)).toBeVisible();
});

test("[C04-T08][FULL] Enter key navigates to first result when available", async ({ page }) => {
  await openSearch(page);
  await page.getByPlaceholder(/Hľadaj články, témy alebo fotky/i).fill("matrix");
  await page.waitForTimeout(700);
  const panel = page.locator("section").filter({ has: page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i }) });
  const links = panel.locator("article a[href^='/']");
  if ((await links.count()) > 0) {
    const firstHref = await links.first().getAttribute("href");
    await page.keyboard.press("Enter");
    if (firstHref) {
      await expect(page).toHaveURL(new RegExp(firstHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  } else {
    await expect(page.getByText(/Nenašli sa výsledky/i)).toBeVisible();
  }
});

test("[C04-T09][FULL] Backdrop click closes search overlay", async ({ page }) => {
  await openSearch(page);
  await page.getByRole("button", { name: "Zatvoriť vyhľadávanie" }).first().click();
  await expect(page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i })).toHaveCount(0);
});

test("[C04-T10][FULL] Search results render as cards when returned", async ({ page }) => {
  await openSearch(page);
  await page.getByPlaceholder(/Hľadaj články, témy alebo fotky/i).fill("novy");
  await page.waitForTimeout(700);
  const panel = page.locator("section").filter({ has: page.getByRole("heading", { name: /Inteligentné vyhľadávanie/i }) });
  const cards = panel.locator("article");
  const emptyState = page.getByText(/Nenašli sa výsledky/i);
  expect((await cards.count()) > 0 || (await emptyState.count()) > 0).toBeTruthy();
});
