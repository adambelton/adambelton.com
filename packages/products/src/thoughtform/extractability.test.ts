import { readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PRODUCT_ROOT = dirname(fileURLToPath(import.meta.url));
const FORBIDDEN_PRODUCTION_IMPORTS = [
  "apps/",
  "packages/ai/",
  "packages/auth/",
  "packages/db/",
] as const;

describe("ThoughtForm extractability", () => {
  it("keeps production code independent from host infrastructure", () => {
    const violations = productionSourceFiles(PRODUCT_ROOT).flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return FORBIDDEN_PRODUCTION_IMPORTS
        .filter((prefix) => source.includes(`from \"${prefix}`))
        .map((prefix) => `${file.slice(PRODUCT_ROOT.length + 1)} imports ${prefix}`);
    });

    expect(violations).toEqual([]);
  });
});

function productionSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (path === join(PRODUCT_ROOT, "testing", "evaluations")) return [];
      return productionSourceFiles(path);
    }
    if (![".ts", ".tsx"].includes(extname(entry.name))) return [];
    return entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")
      ? []
      : [path];
  });
}
