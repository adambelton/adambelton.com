import {
  capabilityProfiles,
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
function capabilityProfileNamed(filename: string) {
  const profile = capabilityProfiles.find(({ source }) => source.endsWith(`/${filename}`));
  if (!profile) throw new Error(`Missing content document: ${filename}.`);
  return profile;
}

export const capabilityProfileContent = capabilityProfileNamed("capability-profile-content.md");

export function getWritingPost(slug: string) {
  return writingPosts.find(
    (post) => post.slug === slug || post.legacySlugs?.includes(slug),
  );
}
