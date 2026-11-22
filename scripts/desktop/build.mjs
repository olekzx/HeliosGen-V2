// Cross-platform desktop build runner.
// Runs the version check and invokes `tauri build` with CI=true.

import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// 1. Check version across all manifests
execFileSync(process.execPath, [join(ROOT, "scripts", "desktop", "check-version.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});

// 2. Run Tauri build with CI=true and macOS retry resilience
const tauriBin = join(
  ROOT,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tauri.cmd" : "tauri",
);

let file = tauriBin;
let args = ["build", ...process.argv.slice(2)];
if (process.platform === "win32") {
  file = "cmd.exe";
  args = ["/d", "/s", "/c", tauriBin, ...args];
}

const maxRetries = process.platform === "darwin" ? 2 : 1;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    execFileSync(file, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        CI: "true",
      },
    });
    break;
  } catch (err) {
    if (attempt < maxRetries) {
      console.warn(`[desktop:build] Build failed on attempt ${attempt}, retrying in 3 seconds...`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000);
      continue;
    }
    throw err;
  }
}
