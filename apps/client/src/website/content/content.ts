import {
  pages,
  posts,
} from "apps/client/src/website/content/compiled-content.generated";

function pageNamed(filename: string) {
  const page = pages.find(({ source }) => source.endsWith(`/${filename}`));
  if (!page) throw new Error(`Missing content document: ${filename}.`);
  return page;
}

export const aboutPageContent = pageNamed("about.md");
export const writingPosts = posts;

export function getWritingPost(slug: string) {
  return writingPosts.find((post) => post.slug === slug);
}
