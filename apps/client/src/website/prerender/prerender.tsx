import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { App } from "apps/client/src/bootstrap/App";
import { writingPosts } from "apps/client/src/website/content/content";

const clientRoot = process.cwd();
const distRoot = join(clientRoot, "dist");
const template = readFileSync(join(distRoot, "index.html"), "utf8");
const routes = ["/", ...writingPosts.map(({ slug }) => `/writing/${slug}`)];

writeFileSync(
  join(distRoot, "writing-redirects.json"),
  JSON.stringify(
    Object.fromEntries(
      writingPosts.flatMap((post) =>
        post.legacySlugs.map((legacySlug) => [
          `/writing/${legacySlug}`,
          `/writing/${post.slug}`,
        ]),
      ),
    ),
    null,
    2,
  ),
);

for (const route of routes) {
    let markup = renderToString(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    );
    const head: string[] = [];
    for (const pattern of [
      /<title>.*?<\/title>/g,
      /<meta (?:content|name|property)=[^>]+\/>/g,
      /<link href="[^"]+" rel="canonical"\/>/g,
      /<script type="application\/ld\+json">.*?<\/script>/g,
    ]) {
      markup = markup.replace(pattern, (value) => {
        head.push(value);
        return "";
      });
    }
    const document = template
      .replace(/<title>Adam Belton<\/title>/, head.join("\n    "))
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
    const output = route === "/" ? join(distRoot, "index.html") : join(distRoot, route, "index.html");
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, document);
}
