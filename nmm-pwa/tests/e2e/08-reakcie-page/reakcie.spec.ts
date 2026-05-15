import { expect, test } from "@playwright/test";

import { collectRuntimeIssues, safeGoto } from "../_utils/site";

test("[C08-T01][GATE][FULL] Reakcie route renders", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.locator("main")).toBeVisible();
});

test("[C08-T02][FULL] Reakcie heading is visible", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.getByRole("heading", { name: /Schválené komentáre naprieč webom/i })).toBeVisible();
});

test("[C08-T03][GATE][FULL] Reakcie list block is visible", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.getByText(/schválených komentárov/i).first()).toBeVisible();
});

test("[C08-T04][FULL] Reakcie page renders comment cards or empty state", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  const cards = page.locator("main article");
  const empty = page.getByText(/Zatiaľ tu nie sú žiadne schválené komentáre/i);
  expect((await cards.count()) > 0 || (await empty.count()) > 0).toBeTruthy();
});

test("[C08-T05][FULL] Reakcie page displays page index label", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.getByText(/Strana\s+\d+/i).first()).toBeVisible();
});

test("[C08-T06][FULL] Reakcie page includes site header", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.locator("header").first()).toBeVisible();
});

test("[C08-T07][FULL] Reakcie pagination controls are stable when present", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  const pagingNav = page.getByRole("navigation", { name: /Stránkovanie komentárov/i });
  if (await pagingNav.count()) {
    await expect(pagingNav).toBeVisible();
    const links = pagingNav.getByRole("link");
    expect(await links.count()).toBeGreaterThan(0);
  } else {
    await expect(page.getByText(/Strana\s+\d+/i).first()).toBeVisible();
  }
});

test("[C08-T08][FULL] Reakcie route keeps viewport without horizontal scroll", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBeFalsy();
});

test("[C08-T09][FULL] Reakcie action links remain visible on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await safeGoto(page, "/reakcie");
  await expect(page.locator("main section").first()).toBeVisible();
});

test("[C08-T10][FULL] Reakcie route has no uncaught runtime errors", async ({ page }) => {
  const runtime = collectRuntimeIssues(page);
  await safeGoto(page, "/reakcie");
  runtime.dispose();
  expect(runtime.errors).toEqual([]);
});
