import type { Page } from "@playwright/test";

const RESERVED_PATHS = new Set([
  "/",
  "/video",
  "/domov",
  "/zahranicie",
  "/komentare",
  "/zaujimave",
  "/reakcie",
  "/archiv-fotiek",
  "/ai",
  "/tech",
  "/veda",
  "/politika",
  "/diskusia",
]);

export interface RuntimeIssues {
  errors: string[];
  dispose: () => void;
}

export async function safeGoto(page: Page, path: string) {
  try {
    await page.goto(path, { waitUntil: "domcontentloaded" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("interrupted by another navigation")) {
      throw error;
    }
    await page.goto(path, { waitUntil: "domcontentloaded" });
  }
}

export function collectRuntimeIssues(page: Page): RuntimeIssues {
  const errors: string[] = [];

  const onPageError = (err: Error) => {
    const text = err.message;
    const commentsCorsNoise = text.includes("/api/comments") && text.includes("access control checks");
    if (!commentsCorsNoise) {
      errors.push(text);
    }
  };

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() !== "error") {
      return;
    }
    const text = msg.text();
    const faviconNoise = text.includes("favicon");
    const commentsCorsNoise = text.includes("/api/comments") && text.includes("access control checks");
    if (!faviconNoise && !commentsCorsNoise) {
      errors.push(text);
    }
  };

  page.on("pageerror", onPageError);
  page.on("console", onConsole);

  return {
    errors,
    dispose: () => {
      page.off("pageerror", onPageError);
      page.off("console", onConsole);
    },
  };
}

export async function resolveArticlePath(page: Page): Promise<string> {
  const explicit = process.env.E2E_ARTICLE_PATH;
  if (explicit && explicit.startsWith("/")) {
    return explicit;
  }

  const fromSearch = await articleFromSearch(page);
  if (fromSearch) {
    return fromSearch;
  }

  const fromHomepage = await articleFromHomepage(page);
  if (fromHomepage) {
    return fromHomepage;
  }

  const fromSitemap = await articleFromSitemap(page);
  if (fromSitemap) {
    return fromSitemap;
  }

  return "/z-ruska-vraj-nikdy-nic-dobre-neprislo-blaha-pripomina-oslobodenie-od-fasizmu-a-ostro-kritizuje-oponentov";
}

async function articleFromSearch(page: Page): Promise<string | null> {
  const response = await page.request.get("/api/search?q=matrix&mode=articles");
  if (!response.ok()) {
    return null;
  }

  const payload = await response.json() as {
    results?: Array<{ href?: string }>;
  };
  const href = payload.results?.[0]?.href;
  return typeof href === "string" && href.startsWith("/") ? href : null;
}

async function articleFromHomepage(page: Page): Promise<string | null> {
  const response = await page.request.get("/");
  if (!response.ok()) {
    return null;
  }

  const html = await response.text();
  const matches = Array.from(html.matchAll(/href="\/([^"#?][^"]*)"/g)).map((item) => `/${item[1]}`);
  return matches.find((href) => !isReservedPath(href)) ?? null;
}

async function articleFromSitemap(page: Page): Promise<string | null> {
  const response = await page.request.get("/sitemap.xml");
  if (!response.ok()) {
    return null;
  }

  const sitemap = await response.text();
  const matches = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((item) => item[1]);

  for (const absolute of matches) {
    try {
      const parsed = new URL(absolute);
      const path = parsed.pathname.replace(/\/$/, "") || "/";
      if (!isReservedPath(path)) {
        return path;
      }
    } catch {
      // Ignore malformed URL entries.
    }
  }

  return null;
}

function isReservedPath(path: string): boolean {
  if (RESERVED_PATHS.has(path)) {
    return true;
  }

  for (const reserved of RESERVED_PATHS) {
    if (reserved !== "/" && path.startsWith(`${reserved}/`)) {
      return true;
    }
  }

  return false;
}
