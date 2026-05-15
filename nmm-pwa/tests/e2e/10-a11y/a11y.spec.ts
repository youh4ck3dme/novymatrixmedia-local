import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { resolveArticlePath, safeGoto } from "../_utils/site";

async function expectNoBlockingAxeViolations(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page })
    .exclude("[data-nextjs-scroll-focus-boundary]")
    .analyze();

  const blocking = result.violations.filter(
    (issue) => issue.impact === "critical" || issue.impact === "serious",
  );
  expect(blocking).toHaveLength(0);
}

test("[C10-T01][FULL] Homepage has no critical/serious axe violations", async ({ page }) => {
  await safeGoto(page, "/");
  await expectNoBlockingAxeViolations(page);
});

test("[C10-T02][FULL] Article page has no critical/serious axe violations", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expectNoBlockingAxeViolations(page);
});

test("[C10-T03][FULL] Reakcie page has no critical/serious axe violations", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expectNoBlockingAxeViolations(page);
});

test("[C10-T04][FULL] Archive page has no critical/serious axe violations", async ({ page }) => {
  await safeGoto(page, "/archiv-fotiek");
  await expectNoBlockingAxeViolations(page);
});

test("[C10-T05][FULL] Video page has no critical/serious axe violations", async ({ page }) => {
  await safeGoto(page, "/video");
  await expectNoBlockingAxeViolations(page);
});

test("[C10-T06][FULL] Search overlay has no critical/serious axe violations", async ({ page }) => {
  await safeGoto(page, "/");
  await page.getByRole("button", { name: /Vyhľadávanie|Otvoriť inteligentné vyhľadávanie/i }).click();
  await expectNoBlockingAxeViolations(page);
});

test("[C10-T07][FULL] Icon-only controls expose accessible labels", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.getByRole("button", { name: /Vyhľadávanie|Otvoriť inteligentné vyhľadávanie/i })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await safeGoto(page, "/");
  await expect(page.getByRole("button", { name: /Otvoriť menu|Zatvoriť menu/i })).toBeVisible();
});

test("[C10-T08][FULL] Comments form fields keep label associations", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByLabel(/Meno/i)).toBeVisible();
  await expect(page.getByLabel(/E-mail/i)).toBeVisible();
  await expect(page.getByLabel(/Komentár/i)).toBeVisible();
});

test("[C10-T09][FULL] Homepage keeps exactly one H1", async ({ page }) => {
  await safeGoto(page, "/");
  expect(await page.locator("h1").count()).toBe(1);
});

test("[C10-T10][FULL] Primary landmarks are present", async ({ page }) => {
  await safeGoto(page, "/");
  await expect(page.locator("header").first()).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});
