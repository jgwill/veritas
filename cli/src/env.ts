/**
 * Lightweight .env file loader — no external dependencies.
 *
 * Resolution order:
 *   1. Already-set process.env values (always win)
 *   2. VERITAS_ENV_FILE (MCP config: `{ env: { VERITAS_ENV_FILE: "/path/to/.env" } }`)
 *   3. ./.env  (project-local)
 *   4. $HOME/.env (user-global)
 *
 * Only sets variables that are NOT already present in process.env.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { homedir } from "node:os";

/** Default API base URL when nothing is configured */
export const DEFAULT_API_URL = "http://localhost:3123";

/**
 * Parse a .env file into a key-value map.
 * Handles: KEY=VALUE, KEY="VALUE", KEY='VALUE', comments (#), blank lines.
 */
function parseEnvFile(filePath: string): Record<string, string> {
  const vars: Record<string, string> = {};
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return vars;
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Strip inline comments (only outside quotes)
    const commentIdx = value.indexOf(" #");
    if (commentIdx !== -1) {
      value = value.slice(0, commentIdx).trim();
    }

    vars[key] = value;
  }

  return vars;
}

/**
 * Load env files in priority order, only setting vars not already in process.env.
 * Call this once at startup before reading any VERITAS_* env vars.
 */
export function loadVeritasEnv(): void {
  const filesToTry: string[] = [];

  // 1. Explicit env file (for MCP { env: { VERITAS_ENV_FILE: "..." } })
  if (process.env.VERITAS_ENV_FILE) {
    filesToTry.push(resolve(process.env.VERITAS_ENV_FILE));
  }

  // 2. Project-local .env
  filesToTry.push(resolve(process.cwd(), ".env"));

  // 3. User-global $HOME/.env
  try {
    filesToTry.push(join(homedir(), ".env"));
  } catch {
    // homedir() can throw on some systems
  }

  for (const filePath of filesToTry) {
    if (!existsSync(filePath)) continue;

    const vars = parseEnvFile(filePath);
    for (const [key, value] of Object.entries(vars)) {
      // Only VERITAS_* vars, and only if not already set
      if (key.startsWith("VERITAS_") && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

/**
 * Get the resolved API URL (after loadVeritasEnv has been called).
 */
export function getVeritasApiUrl(): string {
  return (process.env.VERITAS_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
}

/**
 * Get the API key, throwing a helpful error if missing.
 */
export function getVeritasApiKey(): string {
  const key = process.env.VERITAS_API_KEY;
  if (!key) {
    throw new Error(
      "VERITAS_API_KEY is not set.\n" +
        "Set it in one of:\n" +
        "  • ./.env\n" +
        "  • $HOME/.env\n" +
        "  • VERITAS_ENV_FILE pointing to an env file\n" +
        "  • export VERITAS_API_KEY=your-token"
    );
  }
  return key;
}
