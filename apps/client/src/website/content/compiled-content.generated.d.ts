declare module "apps/client/src/website/content/compiled-content.generated" {
  import type {
    CompiledContentPage,
    CompiledCapabilityProfile,
    CompiledWritingPost,
  } from "apps/client/src/website/content/content-types";

  export const pages: CompiledContentPage[];
  export const posts: CompiledWritingPost[];
  export const capabilityProfiles: CompiledCapabilityProfile[];
}
