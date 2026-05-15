import { expect, test } from "@playwright/test";

import { resolveArticlePath, safeGoto } from "../_utils/site";

test("[C11-T01][GATE][FULL] Homepage has non-empty document title", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page).toHaveTitle(/NOVY MATRIX MEDIA|Novy Matrix Media|PWA/i);
});

test("[C11-T02][GATE][FULL] Homepage contains meta description", async ({ page }) => {
  await safeGoto(page, "/");
  const description = page.locator("meta[name='description']");
  await expect(description).toHaveAttribute("content", /.+/);
});

test("[C11-T03][GATE][FULL] Homepage exposes OpenGraph title and description", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", /.+/);
  await expect(page.locator("meta[property='og:description']")).toHaveAttribute("content", /.+/);
});

test("[C11-T04][FULL] Homepage exposes Twitter card metadata", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", /summary|large/i);
  await expect(page.locator("meta[name='twitter:title']")).toHaveAttribute("content", /.+/);
});

test("[C11-T05][FULL] Reakcie page has canonical link", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /\/reakcie/);
});

test("[C11-T06][FULL] robots.txt returns sitemap reference", async ({ page }) => {
  const response = await page.request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toMatch(/Sitemap:/i);
});

test("[C11-T07][FULL] sitemap.xml returns valid URL entries", async ({ page }) => {
  const response = await page.request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toMatch(/<urlset|<sitemapindex/i);
});

test("[C11-T08][FULL] Article page keeps semantic heading hierarchy root", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  const h1Count = await page.locator("main h1").count();
  expect(h1Count).toBe(1);
});

test("[C11-T09][FULL] Article breadcrumb has explicit aria-label", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
});

test("[C11-T10][FULL] Rendered content images include non-empty alt text", async ({ page }) => {
  await safeGoto(page, "/");
  const images = page.locator("img");
  const count = Math.min(await images.count(), 12);
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i += 1) {
    const alt = await images.nth(i).getAttribute("alt");
    expect((alt ?? "").trim().length).toBeGreaterThan(0);
  }
});
