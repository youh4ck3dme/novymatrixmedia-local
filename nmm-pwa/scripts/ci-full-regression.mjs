#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const baseUrl =
  process.env.DEPLOY_BASE_URL
  ?? process.env.PLAYWRIGHT_BASE_URL
  ?? process.env.SMOKE_BASE_URL
  ?? "https://novymatrixmedia.sk";

function runScript(script, extraArgs = [], extraEnv = {}) {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : "npm";
  const commandArgs = isWindows
    ? ["/c", "npm", "run", script, ...extraArgs]
    : ["run", script, ...extraArgs];
  const child = spawnSync(command, commandArgs, {
    stdio: "inherit",
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (child.error) {
    console.error(child.error.message);
    process.exit(1);
  }

  if ((child.status ?? 1) !== 0) {
    process.exit(child.status ?? 1);
  }
}

runScript("lint");
runScript("build");
runScript("test:smoke", ["--", "--base", baseUrl]);
runScript("test:e2e:full", [], { PLAYWRIGHT_BASE_URL: baseUrl });
