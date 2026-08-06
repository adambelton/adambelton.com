import { readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPOSITORY_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const ALLOWED_DEPENDENCIES = {
  "apps/api": new Set([
    "apps/api",
    "packages/ai",
    "packages/auth",
    "packages/db",
    "packages/products",
    "packages/observability",
    "packages/shared",
  ]),
  "apps/client": new Set([
    "apps/client",
    "packages/auth",
    "packages/products",
    "packages/observability",
    "packages/shared",
  ]),
  "packages/ai": new Set(["packages/ai"]),
  "packages/auth": new Set([
    "packages/auth",
    "packages/db",
    "packages/shared",
  ]),
  "packages/db": new Set(["packages/db", "packages/products"]),
  "packages/products": new Set([
    "packages/products",
    "packages/observability",
    "packages/shared",
  ]),
  "packages/observability": new Set(["packages/observability"]),
  "packages/shared": new Set(["packages/shared"]),
} as const;

describe("repository architecture", () => {
  it("keeps production dependencies inside the documented ownership graph", () => {
    const violations = productionSourceFiles().flatMap((file) => {
      const owner = sourceOwner(file);
      const allowed = ALLOWED_DEPENDENCIES[owner];
      const source = readFileSync(file, "utf8");
      return repositoryImportPaths(source)
        .filter((importPath) => /^(apps|packages)\//.test(importPath))
        .filter((importPath) => !allowed.has(importOwner(importPath)))
        .map(
          (importPath) =>
            `${relative(REPOSITORY_ROOT, file)} imports ${importPath}`,
        );
    });

    expect(violations).toEqual([]);
  });

  it("keeps production code independent from test support", () => {
    const violations = productionSourceFiles().flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return repositoryImportPaths(source)
        .filter((importPath) => importPath.includes("/testing/"))
        .map(
          (importPath) =>
            `${relative(REPOSITORY_ROOT, file)} imports ${importPath}`,
        );
    });

    expect(violations).toEqual([]);
  });

  it("recognises every supported import and re-export form", () => {
    expect(repositoryImportPaths(`
      import { value } from "packages/shared/src";
      export { value } from "packages/shared/src/products";
      import "apps/client/src/styles.css";
      const module = import("apps/client/src/products/ProductRoutePage");
      type Contract = import("packages/products/src/thoughtform/shared").Conversation;
    `)).toEqual([
      "packages/shared/src",
      "packages/shared/src/products",
      "apps/client/src/products/ProductRoutePage",
      "packages/products/src/thoughtform/shared",
      "apps/client/src/styles.css",
    ]);
  });
});

function repositoryImportPaths(source: string) {
  return [
    /\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bimport\s+["']([^"']+)["']/g,
  ].flatMap((pattern) => [...source.matchAll(pattern)].map((match) => match[1]!));
}

function productionSourceFiles() {
  return Object.keys(ALLOWED_DEPENDENCIES).flatMap((owner) =>
    sourceFiles(join(REPOSITORY_ROOT, owner)),
  );
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "generated" ||
        entry.name === "node_modules" ||
        entry.name === "testing"
      ) {
        return [];
      }
      return sourceFiles(path);
    }
    if (![".ts", ".tsx"].includes(extname(entry.name))) return [];
    return entry.name.includes(".test.") || entry.name.includes(".spec.")
      ? []
      : [path];
  });
}

function sourceOwner(file: string) {
  const [kind, name] = relative(REPOSITORY_ROOT, file).split("/");
  const owner = `${kind}/${name}` as keyof typeof ALLOWED_DEPENDENCIES;
  if (!(owner in ALLOWED_DEPENDENCIES)) {
    throw new Error(`No architecture rule exists for ${owner}.`);
  }
  return owner;
}

function importOwner(importPath: string) {
  return importPath.split("/").slice(0, 2).join("/");
}
