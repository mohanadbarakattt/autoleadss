// check-api-imports — regression guard for the class of bug that shipped in
// api/leads/follow-up.ts: a server handler transitively importing browser-only
// code. That handler imported src/saas/ai/followUp.ts, which imported
// src/saas/store.ts, which imported src/saas/config.ts, which reads
// `import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` at module scope —
// undefined outside Vite — so every request to the handler 500'd at import
// time, in every environment, even fully configured.
//
// `npx tsc -p api/tsconfig.json` (see `npm run typecheck:api`) cannot catch a
// bug like this: `import.meta.env` has a valid, known TYPE even though it's
// undefined at RUNTIME outside Vite. And a vitest test can't reproduce it either
// — vitest always loads modules through Vite's transform (which shims
// `import.meta.env` to a real object) and its default environment is jsdom
// (which defines `window`), neither of which is true of Vercel's actual Node
// runtime. So this walks every non-test module under api/ and imports it in a
// plain Node process via tsx — no Vite, no jsdom — which is exactly what
// reproduces the crash. Run directly: `npm run check:api-imports`.
// Wired into the test suite via scripts/check-api-imports.test.ts.

import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const API_ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "api");

export type ImportCheckResult = { file: string; ok: boolean; error?: string };

export function collectApiModules(dir: string = API_ROOT): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectApiModules(full));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

/** Imports every given module in this (Node, non-Vite) process and reports which
 * ones threw at module-initialization time. */
export async function checkApiImports(files: string[] = collectApiModules()): Promise<ImportCheckResult[]> {
  const results: ImportCheckResult[] = [];
  for (const file of files) {
    const label = path.relative(API_ROOT, file);
    try {
      await import(pathToFileURL(file).href);
      results.push({ file: label, ok: true });
    } catch (err) {
      results.push({ file: label, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}

// --- CLI ---
const isCli =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] != null &&
  /check-api-imports(\.ts|\.js)?$/.test(process.argv[1]);

if (isCli) {
  const results = await checkApiImports();
  const failures = results.filter((r) => !r.ok);
  for (const r of results) {
    process.stdout.write(`  ${r.ok ? "✓" : "✗"} ${r.file}${r.error ? ` — ${r.error}` : ""}\n`);
  }
  process.stdout.write(
    failures.length
      ? `\n✗ ${failures.length}/${results.length} api module(s) crashed at import time (see errors above)\n`
      : `\n✓ all ${results.length} api modules imported cleanly\n`,
  );
  process.exit(failures.length ? 1 : 0);
}
