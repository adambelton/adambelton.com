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
  const widgetDirectory = join(contentRoot, "widgets");
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
      const {
        compileContentCollection,
        parseContentDocument,
        renderSanitizedMarkdown,
      } = await import(
        new URL("./compile-content.ts", import.meta.url).href
      );
      const { compileCapabilityProfile } = await import(
        new URL("./compile-capability-profile.ts", import.meta.url).href
      );
      const collection = compileContentCollection(
        readMarkdownDirectory(pageDirectory),
        readMarkdownDirectory(postDirectory),
      );
      const widgetDocuments = readMarkdownDirectory(widgetDirectory);
      const capabilityProfiles = Object.entries(widgetDocuments).map(([source, text]) =>
        compileCapabilityProfile(text, source, {
          parseContentDocument,
          renderSanitizedMarkdown,
        }),
      );
      for (const page of collection.pages) this.addWatchFile(page.source);
      for (const post of collection.posts) this.addWatchFile(post.source);
      for (const profile of capabilityProfiles) this.addWatchFile(profile.source);
      return `export const pages = ${JSON.stringify(collection.pages)};\nexport const posts = ${JSON.stringify(collection.posts)};\nexport const capabilityProfiles = ${JSON.stringify(capabilityProfiles)};`;
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
