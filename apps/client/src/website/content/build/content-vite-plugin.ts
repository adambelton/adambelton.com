import { readFileSync, readdirSync } from "node:fs";
import { join, normalize } from "node:path";
import type { Plugin } from "vite";

export const COMPILED_CONTENT_MODULE =
  "apps/client/src/website/content/compiled-content.generated";
const resolvedModuleId = `\0${COMPILED_CONTENT_MODULE}`;

function readMarkdownDirectory(directory: string) {
  return Object.fromEntries(
    readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry) => {
        const path = join(directory, entry.name);
        return [path, readFileSync(path, "utf8")];
      }),
  );
}

export function contentVitePlugin(contentRoot: string): Plugin {
  const pageDirectory = join(contentRoot, "pages");
  const postDirectory = join(contentRoot, "posts");
  const aliasedModuleId = join(
    contentRoot,
    "../website/content/compiled-content.generated",
  );
  return {
    name: "website-content",
    enforce: "pre",
    resolveId(id) {
      return id === COMPILED_CONTENT_MODULE || normalize(id) === normalize(aliasedModuleId)
        ? resolvedModuleId
        : undefined;
    },
    async load(id) {
      if (id !== resolvedModuleId) return undefined;
      const { compileContentCollection } = await import(
        new URL("./compile-content.ts", import.meta.url).href
      );
      const collection = compileContentCollection(
        readMarkdownDirectory(pageDirectory),
        readMarkdownDirectory(postDirectory),
      );
      for (const page of collection.pages) this.addWatchFile(page.source);
      for (const post of collection.posts) this.addWatchFile(post.source);
      return `export const pages = ${JSON.stringify(collection.pages)};\nexport const posts = ${JSON.stringify(collection.posts)};`;
    },
    configureServer(server) {
      server.watcher.add(contentRoot);
      server.watcher.on("all", (_event, path) => {
        if (!path.endsWith(".md") || !path.startsWith(contentRoot)) return;
        const module = server.moduleGraph.getModuleById(resolvedModuleId);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: "full-reload" });
      });
    },
  };
}
