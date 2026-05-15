#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const suite = argValue("--suite") ?? "full";
const baseUrl = argValue("--base") ?? process.env.PLAYWRIGHT_BASE_URL ?? "";
const isGate = suite === "gate";
const isFull = suite === "full";

if (!isGate && !isFull) {
  console.error(`Unsupported suite "${suite}". Use --suite gate|full.`);
  process.exit(1);
}

const root = process.cwd();
const playwrightBin = process.platform === "win32"
  ? path.join(root, "node_modules", ".bin", "playwright.cmd")
  : path.join(root, "node_modules", ".bin", "playwright");

const cmdArgs = [
  "test",
  "--config",
  "playwright.config.ts",
  "--grep",
  isGate ? "\\[GATE\\]" : "\\[FULL\\]",
];

const env = {
  ...process.env,
};

if (baseUrl) {
  env.PLAYWRIGHT_BASE_URL = baseUrl;
}

const run = process.platform === "win32"
  ? spawnSync("cmd.exe", ["/c", playwrightBin, ...cmdArgs], { stdio: "inherit", cwd: root, env })
  : spawnSync(playwrightBin, cmdArgs, { stdio: "inherit", cwd: root, env });

if (run.error) {
  console.error(run.error.message);
  process.exit(1);
}

process.exit(run.status ?? 1);
