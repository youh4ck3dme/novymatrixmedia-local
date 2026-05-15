import { expect, test } from "@playwright/test";

import { collectRuntimeIssues, safeGoto } from "../_utils/site";

test("[C07-T01][FULL] Video route renders main", async ({ page }) => {
  await safeGoto(page, "/video");
  await expect(page.locator("main")).toBeVisible();
});

test("[C07-T02][FULL] Video route shows page heading", async ({ page }) => {
  await safeGoto(page, "/video");
  await expect(page.locator("main h1").first()).toBeVisible();
});

test("[C07-T03][FULL] Homepage video section is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("heading", { name: /^Video$/i })).toBeVisible();
});

test("[C07-T04][FULL] YouTube newsroom panel is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByText(/YouTube newsroom/i)).toBeVisible();
});

test("[C07-T05][FULL] Subscribe CTA to YouTube is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("link", { name: /Odoberať YouTube/i })).toBeVisible();
});

test("[C07-T06][FULL] Open video section CTA is visible", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("link", { name: /Otvoriť video sekciu/i })).toBeVisible();
});

test("[C07-T07][FULL] Video teasers or fallback text are rendered", async ({ page }) => {
  await safeGoto(page, "/");
  const cards = page.locator("main section").filter({ hasText: /Video/i }).locator("article");
  const fallback = page.getByText(/Video sekcia zatiaľ nemá články/i);
  expect((await cards.count()) > 0 || (await fallback.count()) > 0).toBeTruthy();
});

test("[C07-T08][FULL] Video route provides article cards or empty state", async ({ page }) => {
  await safeGoto(page, "/video");
  const cards = page.locator("main article");
  const empty = page.getByText(/Výber článkov|Zatiaľ/i);
  expect((await cards.count()) > 0 || (await empty.count()) > 0).toBeTruthy();
});

test("[C07-T09][FULL] Video panel links stay clickable", async ({ page }) => {
  await safeGoto(page, "/");
  const link = page.getByRole("link", { name: /Otvoriť video sekciu/i });
  await link.click();
  await expect(page).toHaveURL(/\/video/);
});

test("[C07-T10][FULL] Video related routes have no uncaught runtime errors", async ({ page }) => {
  const runtime = collectRuntimeIssues(page);
  await safeGoto(page, "/");
  await safeGoto(page, "/video");
  runtime.dispose();
  expect(runtime.errors).toEqual([]);
});
