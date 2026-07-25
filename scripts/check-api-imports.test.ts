import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import path from "node:path";

// process.cwd(), not import.meta.url: vitest's default jsdom environment gives
// this file a non-`file:` import.meta.url (a fake browser location), which
// fileURLToPath() rejects. `npm test`/`vitest run` always run from the repo
// root (see package.json), so this is reliable.
const scriptPath = path.resolve(process.cwd(), "scripts/check-api-imports.ts");

describe("api handler modules import cleanly under Node (regression guard)", () => {
  // Deliberately shells out to a real `tsx` (plain Node, no Vite) child process
  // rather than calling checkApiImports() in-process: this test file itself
  // runs under vitest, which always transforms modules through Vite (shims
  // `import.meta.env`) and defaults to a jsdom environment (defines `window`).
  // Either would silently hide the exact bug this guard exists to catch — see
  // scripts/check-api-imports.ts for the full story.
  it("every api/**/*.ts module (excluding *.test.ts) initializes without throwing", () => {
    try {
      const output = execFileSync("npx", ["tsx", scriptPath], { encoding: "utf8", timeout: 60_000 });
      expect(output).toMatch(/✓ all \d+ api modules imported cleanly/);
    } catch (err) {
      const e = err as { stdout?: string; stderr?: string; message: string };
      throw new Error(`api import check failed:\n${e.stdout ?? ""}\n${e.stderr ?? e.message}`);
    }
  }, 60_000);
});
