#!/usr/bin/env node

/**
 * Lightweight runtime smoke tests for production/staging frontend.
 *
 * Usage:
 *   node scripts/smoke-test.mjs
 *   node scripts/smoke-test.mjs --base https://novymatrixmedia.sk
 */

const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const rawBase = baseIndex >= 0 ? args[baseIndex + 1] : process.env.NEXT_PUBLIC_SITE_URL;
const baseUrl = (rawBase || "https://novymatrixmedia.sk").replace(/\/$/, "");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function logOk(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logWarn(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logFail(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchText(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "follow",
    headers: {
      "User-Agent": "nmm-smoke-test/1.0",
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
    },
  });

  assert(
    response.status === expectedStatus,
    `${path} returned ${response.status}, expected ${expectedStatus}`,
  );

  return response.text();
}

async function fetchJson(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "follow",
    headers: {
      "User-Agent": "nmm-smoke-test/1.0",
      Accept: "application/json",
    },
  });

  assert(
    response.status === expectedStatus,
    `${path} returned ${response.status}, expected ${expectedStatus}`,
  );

  return response.json();
}

function pickFirstArticleHref(html) {
  const matches = Array.from(html.matchAll(/href="\/([^"#?][^"]*)"/g)).map((item) => `/${item[1]}`);
  const ignoredPrefixes = ["/video", "/domov", "/zahranicie", "/komentare", "/zaujimave", "/reakcie", "/archiv-fotiek", "/ai", "/tech", "/veda", "/politika", "/diskusia", "/robots.txt", "/sitemap.xml"];
  return matches.find((href) => !ignoredPrefixes.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))) || null;
}

async function pickFirstArticleFromSitemap() {
  const sitemapXml = await fetchText("/sitemap.xml");
  const matches = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((item) => item[1]);
  const reserved = new Set([
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

  for (const absoluteUrl of matches) {
    try {
      const parsed = new URL(absoluteUrl);
      const path = parsed.pathname.replace(/\/$/, "") || "/";
      if (!reserved.has(path)) {
        return path;
      }
    } catch {
      // Ignore malformed loc values.
    }
  }

  return null;
}

async function pickFirstArticleFromSearch() {
  const data = await fetchJson("/api/search?q=matrix&mode=articles");
  if (!Array.isArray(data.results) || data.results.length === 0) {
    return null;
  }

  const firstHref = data.results[0]?.href;
  return typeof firstHref === "string" && firstHref.startsWith("/") ? firstHref : null;
}

async function run() {
  console.log(`\n${colors.bold}${colors.cyan}NMM smoke test${colors.reset}`);
  console.log(`${colors.cyan}Base URL:${colors.reset} ${baseUrl}\n`);

  const failures = [];

  const checks = [
    {
      name: "Homepage renders",
      run: async () => {
        const html = await fetchText("/");
        assert(/NOVY MATRIX MEDIA/i.test(html), "Homepage missing expected branding text.");
        return { html };
      },
    },
    {
      name: "Video route renders",
      run: async () => {
        const html = await fetchText("/video");
        assert(/video/i.test(html), "Video route missing expected text.");
      },
    },
    {
      name: "Reakcie route renders",
      run: async () => {
        const html = await fetchText("/reakcie");
        assert(/reakcie/i.test(html), "Reakcie route missing expected text.");
      },
    },
    {
      name: "Comments API returns valid payload",
      run: async () => {
        const json = await fetchJson("/api/comments?page=1&perPage=2");
        assert(Array.isArray(json.comments), "comments is not an array.");
        assert(typeof json.total === "number", "total is missing.");
      },
    },
    {
      name: "Search API returns valid payload",
      run: async () => {
        const json = await fetchJson("/api/search?q=matrix&mode=all");
        assert(Array.isArray(json.results), "results is not an array.");
      },
    },
    {
      name: "Article detail renders comments section",
      run: async (context) => {
        let articleHref = await pickFirstArticleFromSearch();
        if (!articleHref) {
          articleHref = pickFirstArticleHref(context.homepageHtml);
        }
        if (!articleHref) {
          articleHref = await pickFirstArticleFromSitemap();
        }

        if (!articleHref) {
          throw new Error("No article link found on homepage.");
        }

        const html = await fetchText(articleHref);
        assert(/Reakcie čitateľov/i.test(html), "Article page missing comments section.");
      },
    },
    {
      name: "Archive route renders",
      run: async () => {
        const html = await fetchText("/archiv-fotiek");
        assert(/Archív fotiek/i.test(html), "Archive route missing expected heading.");
      },
    },
    {
      name: "Comments submit validation still enforced",
      run: async () => {
        const response = await fetch(`${baseUrl}/api/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "nmm-smoke-test/1.0",
          },
          body: JSON.stringify({}),
        });

        assert(response.status === 400, `Expected validation 400, got ${response.status}.`);
      },
    },
  ];

  const context = {
    homepageHtml: "",
  };

  for (const check of checks) {
    try {
      const result = await check.run(context);
      if (result?.html && check.name === "Homepage renders") {
        context.homepageHtml = result.html;
      }
      logOk(check.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      failures.push(`${check.name}: ${message}`);
      logFail(`${check.name} -> ${message}`);
    }
  }

  console.log("");
  if (failures.length > 0) {
    console.log(`${colors.red}${colors.bold}Smoke test failed (${failures.length})${colors.reset}`);
    failures.forEach((item) => logWarn(item));
    process.exit(1);
  }

  console.log(`${colors.green}${colors.bold}Smoke test passed${colors.reset}`);
}

void run();
