// Preloaded before the Next.js server (node -r) in the packaged desktop app.
//
// If the Tauri shell that spawned us dies without killing us (a crash, a
// force-quit, SIGKILL), macOS reparents this process to launchd (pid 1). Watch
// for that and exit, so we don't leave an orphaned server holding the port.
const parentAtStart = process.ppid;

function isParentDead() {
  if (process.platform === "win32") {
    try {
      // On Windows, process.kill(pid, 0) checks if the target PID is still running.
      // If the parent process has terminated, this throws an error (e.g. ESRCH).
      process.kill(parentAtStart, 0);
      return false;
    } catch {
      return true;
    }
  }
  return process.ppid !== parentAtStart || process.ppid === 1;
}

setInterval(() => {
  if (isParentDead()) {
    console.error("[sidecar-guard] parent process gone — shutting down");
    process.exit(0);
  }
}, 2000).unref();
