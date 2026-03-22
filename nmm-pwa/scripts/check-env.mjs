#!/usr/bin/env node

/**
 * check-env.mjs — Verifikácia environment variables pred deployom na Vercel
 *
 * Spustenie:
 *   node nmm-pwa/scripts/check-env.mjs                  # lokálna kontrola .env súborov
 *   node nmm-pwa/scripts/check-env.mjs --live            # live kontrola na Vercel deployi
 *   node nmm-pwa/scripts/check-env.mjs --live --url URL  # custom deployment URL
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isLive = args.includes("--live");
const urlIdx = args.indexOf("--url");
const customUrl = urlIdx !== -1 ? args[urlIdx + 1] : null;

// ── Colors ────────────────────────────────────────────────────────────────────
const R = "\x1b[31m";
const G = "\x1b[32m";
const Y = "\x1b[33m";
const C = "\x1b[36m";
const D = "\x1b[2m";
const B = "\x1b[1m";
const X = "\x1b[0m";

const ok = (msg) => console.log(`  ${G}✓${X} ${msg}`);
const warn = (msg) => console.log(`  ${Y}⚠${X} ${msg}`);
const fail = (msg) => console.log(`  ${R}✗${X} ${msg}`);
const info = (msg) => console.log(`  ${C}ℹ${X} ${msg}`);

// ── Required env var definitions ──────────────────────────────────────────────
const REQUIRED = [
  {
    name: "NEXT_PUBLIC_WP_URL",
    critical: false,
    validate: (v) => {
      if (!v) return "Not set — falls back to localhost:8080 (OK for dev)";
      try { new URL(v); } catch { return "Invalid URL"; }
      if (v.endsWith("/")) return "Remove trailing slash";
      if (!v.startsWith("https://")) return "Should use https:// in production";
      return null;
    },
  },
  {
    name: "NEXT_PUBLIC_API_URL",
    critical: false,
    validate: (v) => {
      if (!v) return "Not set — computed from NEXT_PUBLIC_WP_URL (OK)";
      if (!v.includes("/wp-json/wp/v2")) return "Missing /wp-json/wp/v2 path";
      return null;
    },
  },
  {
    name: "NEXT_PUBLIC_GRAPHQL_URL",
    critical: false,
    validate: (v) => {
      if (!v) return "Not set — computed from NEXT_PUBLIC_WP_URL (OK)";
      if (!v.includes("/graphql")) return "Missing /graphql path";
      return null;
    },
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    critical: false,
    validate: (v) => {
      if (!v) return "Not set — defaults to https://novymatrixmedia.sk";
      if (!v.startsWith("https://")) return "Should use https://";
      return null;
    },
  },
  {
    name: "REVALIDATE_SECRET",
    critical: true,
    validate: (v) => {
      if (!v) return "MISSING — ISR revalidation will not work!";
      if (v === "change_me_local_dev_secret") return "Still using placeholder — generate a real secret!";
      if (v.length < 32) return "Too short — use: openssl rand -hex 32";
      return null;
    },
  },
];

// ── Parse .env file ───────────────────────────────────────────────────────────
function parseEnvFile(path) {
  if (!existsSync(path)) return null;
  const vars = {};
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

// ── Local check ───────────────────────────────────────────────────────────────
function checkLocal() {
  console.log(`\n${B}${C}╔══════════════════════════════════════════════════╗${X}`);
  console.log(`${B}${C}║   NMM Environment Variables — Lokálna kontrola   ║${X}`);
  console.log(`${B}${C}╚══════════════════════════════════════════════════╝${X}\n`);

  // Check available .env files
  const envFiles = [".env.local", ".env.example", ".env.vercel", ".env"];
  console.log(`${B}Nájdené .env súbory:${X}`);
  for (const f of envFiles) {
    const path = resolve(ROOT, f);
    if (existsSync(path)) ok(`${f}`);
    else info(`${f} ${D}(nenájdený)${X}`);
  }

  // Load env files in priority order (matching Next.js behavior)
  const envLocal = parseEnvFile(resolve(ROOT, ".env.local"));
  const envDefault = parseEnvFile(resolve(ROOT, ".env"));
  const envVercel = parseEnvFile(resolve(ROOT, ".env.vercel"));
  const envExample = parseEnvFile(resolve(ROOT, ".env.example"));

  // Merged vars (local overrides default)
  const merged = { ...envDefault, ...envLocal };

  console.log(`\n${B}Kontrola premenných (.env.local + .env):${X}`);
  let errors = 0;
  let warnings = 0;

  for (const { name, critical, validate } of REQUIRED) {
    const val = merged[name];
    const issue = validate(val);
    if (!val && critical) {
      fail(`${B}${name}${X} — ${R}${issue}${X}`);
      errors++;
    } else if (issue) {
      warn(`${name} — ${Y}${issue}${X}`);
      warnings++;
    } else {
      ok(`${name} = ${D}${mask(val)}${X}`);
    }
  }

  // Cross-check .env.vercel
  if (envVercel) {
    console.log(`\n${B}Kontrola .env.vercel (produkčné hodnoty):${X}`);
    for (const { name, validate } of REQUIRED) {
      const val = envVercel[name];
      const issue = validate(val);
      if (!val) {
        // REVALIDATE_SECRET is expected to be only on Vercel dashboard, not in .env.vercel file
        if (name === "REVALIDATE_SECRET") {
          info(`${name} — ${D}OK, nastavený cez Vercel Dashboard (nie v súbore)${X}`);
        } else {
          warn(`${name} — nie je v .env.vercel`);
          warnings++;
        }
      } else if (issue) {
        warn(`${name} — ${Y}${issue}${X}`);
        warnings++;
      } else {
        ok(`${name} = ${D}${mask(val)}${X}`);
      }
    }
  }

  // Cross-check: .env.example should have all NEXT_PUBLIC_ vars
  if (envExample) {
    console.log(`\n${B}Kontrola .env.example (šablóna):${X}`);
    for (const { name } of REQUIRED) {
      if (name.startsWith("NEXT_PUBLIC_")) {
        if (envExample[name]) {
          ok(`${name} je v šablóne`);
        } else {
          warn(`${name} chýba v .env.example`);
          warnings++;
        }
      }
    }
  }

  // Summary
  console.log(`\n${B}─────────────────────────────────────────${X}`);
  if (errors > 0) {
    console.log(`${R}${B}FAIL${X} — ${errors} kritických chýb, ${warnings} upozornení\n`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`${Y}${B}OK s upozorneniami${X} — ${warnings} upozornení\n`);
  } else {
    console.log(`${G}${B}ALL GREEN${X} — všetky premenné sú správne nastavené ✓\n`);
  }
}

// ── Live check (calls /api/env-check on deployed Vercel) ──────────────────────
async function checkLive() {
  const baseUrl = customUrl || "https://nmm-pwa.vercel.app";

  console.log(`\n${B}${C}╔══════════════════════════════════════════════════╗${X}`);
  console.log(`${B}${C}║   NMM Environment Variables — Live Vercel Check  ║${X}`);
  console.log(`${B}${C}╚══════════════════════════════════════════════════╝${X}\n`);

  // Get REVALIDATE_SECRET from .env.vercel or .env.local
  const envVercel = parseEnvFile(resolve(ROOT, ".env.vercel"));
  const envLocal = parseEnvFile(resolve(ROOT, ".env.local"));
  const secret = envVercel?.REVALIDATE_SECRET || envLocal?.REVALIDATE_SECRET;

  if (!secret || secret === "change_me_local_dev_secret") {
    fail("Nemôžem zavolať /api/env-check — REVALIDATE_SECRET nie je dostupný lokálne");
    info("Nastav REVALIDATE_SECRET v .env.local alebo .env.vercel");
    process.exit(1);
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/env-check?secret=${encodeURIComponent(secret)}`;
  info(`Volám ${D}${baseUrl}/api/env-check${X} ...\n`);

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 401) {
      fail("Autentifikácia zlyhala — REVALIDATE_SECRET sa nezhoduje s Vercelom");
      process.exit(1);
    }

    const data = await res.json();

    // Env vars
    console.log(`${B}Environment Variables:${X}`);
    for (const v of data.envVars) {
      if (v.status === "ok") {
        ok(`${v.name}${v.value ? ` = ${D}${v.value}${X}` : ""}`);
      } else if (v.status === "warning") {
        warn(`${v.name} — ${Y}${v.note}${X}`);
      } else {
        fail(`${B}${v.name}${X} — ${R}${v.note}${X}`);
      }
    }

    // Connectivity
    console.log(`\n${B}Konektivita (WordPress → Vercel):${X}`);
    for (const c of data.connectivity) {
      if (c.status === "ok") {
        ok(`${c.url} ${D}(HTTP ${c.httpStatus})${X}`);
      } else {
        fail(`${c.url} — ${R}${c.note}${X}`);
      }
    }

    // Summary
    console.log(`\n${B}─────────────────────────────────────────${X}`);
    const s = data.summary;
    if (data.overall === "ALL_GREEN") {
      console.log(`${G}${B}ALL GREEN${X} — ${s.ok}/${s.total} premenných OK, konektivita OK ✓\n`);
    } else if (data.overall === "FAIL") {
      console.log(`${R}${B}FAIL${X} — ${s.missing} chýbajúcich, ${s.warnings} upozornení, ${s.connectivityErrors} chýb konektivity\n`);
      process.exit(1);
    } else if (data.overall === "DEGRADED") {
      console.log(`${R}${B}DEGRADED${X} — konektivita s WordPress nefunguje (${s.connectivityErrors} chýb)\n`);
      process.exit(1);
    } else {
      console.log(`${Y}${B}OK s upozorneniami${X} — ${s.warnings} upozornení\n`);
    }
  } catch (err) {
    fail(`Nepodarilo sa pripojiť na ${baseUrl}: ${err.message}`);
    info("Skontroluj či deployment existuje a URL je správna");
    process.exit(1);
  }
}

function mask(val) {
  if (!val) return "(prázdne)";
  if (val.length <= 8) return "****";
  return val.slice(0, 4) + "…" + val.slice(-4);
}

// ── Main ──────────────────────────────────────────────────────────────────────
if (isLive) {
  checkLive();
} else {
  checkLocal();
}
