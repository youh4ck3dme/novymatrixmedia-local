import { expect, test } from "@playwright/test";

import { resolveArticlePath, safeGoto } from "../_utils/site";

test("[C05-T01][GATE][FULL] Article route renders article container", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.locator("main article").first()).toBeVisible();
});

test("[C05-T02][GATE][FULL] Article route renders H1", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.locator("main h1").first()).toBeVisible();
});

test("[C05-T03][GATE][FULL] Article route renders comments heading", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByRole("heading", { name: /Reakcie čitateľov/i })).toBeVisible();
});

test("[C05-T04][FULL] Breadcrumb navigation is visible on article", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
});

test("[C05-T05][FULL] Article shows contact/tip section", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByText(/Kontakt \/ Tip redakcii/i)).toBeVisible();
});

test("[C05-T06][FULL] Article share panel contains Telegram and Email", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByRole("link", { name: "Telegram" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Email" }).first()).toBeVisible();
});

test("[C05-T07][FULL] Article related section is visible", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByText(/Súvisiace/i).first()).toBeVisible();
});

test("[C05-T08][FULL] Article body has readable paragraph content", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  const paragraph = page.locator(".article-body p").first();
  await expect(paragraph).toBeVisible();
  const fontSize = await paragraph.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(14);
});

test("[C05-T09][FULL] Article comments form has required fields", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByLabel(/Meno/i)).toBeVisible();
  await expect(page.getByLabel(/E-mail/i)).toBeVisible();
  await expect(page.getByLabel(/Komentár/i)).toBeVisible();
});

test("[C05-T10][FULL] Article heading does not overlap first paragraph", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  const h1 = page.locator("main h1").first();
  const paragraph = page.locator("main p").first();
  await expect(h1).toBeVisible();
  await expect(paragraph).toBeVisible();
  const [h1Box, pBox] = await Promise.all([h1.boundingBox(), paragraph.boundingBox()]);
  expect(h1Box).not.toBeNull();
  expect(pBox).not.toBeNull();
  if (h1Box && pBox) {
    expect(h1Box.y + h1Box.height).toBeLessThanOrEqual(pBox.y + 2);
  }
});
