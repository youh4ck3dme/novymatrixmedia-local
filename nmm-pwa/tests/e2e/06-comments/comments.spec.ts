import { expect, test } from "@playwright/test";

import { resolveArticlePath, safeGoto } from "../_utils/site";

test("[C06-T01][GATE][FULL] Comments API responds with 200", async ({ page }) => {
  const response = await page.request.get("/api/comments?page=1&perPage=2");
  expect(response.ok()).toBeTruthy();
});

test("[C06-T02][FULL] Comments API payload has expected shape", async ({ page }) => {
  const response = await page.request.get("/api/comments?page=1&perPage=2");
  const payload = await response.json() as { comments?: unknown[]; total?: number };
  expect(Array.isArray(payload.comments)).toBeTruthy();
  expect(typeof payload.total).toBe("number");
});

test("[C06-T03][FULL] Comments API validation rejects empty submit", async ({ page }) => {
  const response = await page.request.post("/api/comments", {
    data: {},
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  expect(response.status()).toBe(400);
});

test("[C06-T04][FULL] Article comments section title is visible", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByRole("heading", { name: /Reakcie čitateľov/i })).toBeVisible();
});

test("[C06-T05][FULL] Article comments form shows required labels", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await expect(page.getByLabel(/Meno/i)).toBeVisible();
  await expect(page.getByLabel(/E-mail/i)).toBeVisible();
  await expect(page.getByLabel(/Komentár/i)).toBeVisible();
});

test("[C06-T06][FULL] Empty approved comments state or list is rendered", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  const emptyState = page.getByText(/Zatiaľ tu nie sú žiadne schválené komentáre/i);
  const listHeading = page.getByText(/Schválené komentáre/i);
  expect((await emptyState.count()) > 0 || (await listHeading.count()) > 0).toBeTruthy();
});

test("[C06-T07][FULL] Reakcie page heading is visible", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.getByRole("heading", { name: /Schválené komentáre naprieč webom/i })).toBeVisible();
});

test("[C06-T08][FULL] Reakcie page shows total comments metadata", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  await expect(page.getByText(/schválených komentárov/i).first()).toBeVisible();
});

test("[C06-T09][FULL] Reakcie page keeps comments section in view", async ({ page }) => {
  await safeGoto(page, "/reakcie");
  const section = page.locator("main section").nth(1);
  await expect(section).toBeVisible();
  const cards = section.locator("article");
  const empty = section.getByText(/Zatiaľ tu nie sú žiadne schválené komentáre/i);
  expect((await cards.count()) > 0 || (await empty.count()) > 0).toBeTruthy();
});

test("[C06-T10][FULL] Comments submit button is enabled with valid form data", async ({ page }) => {
  const articlePath = await resolveArticlePath(page);
  await safeGoto(page, articlePath);
  await page.getByLabel(/Meno/i).fill("Test User");
  await page.getByLabel(/E-mail/i).fill("test@example.com");
  await page.getByLabel(/Komentár/i).fill("Toto je testovací komentár pre smoke validáciu.");
  await expect(page.getByRole("button", { name: /Odoslať komentár/i })).toBeEnabled();
});
