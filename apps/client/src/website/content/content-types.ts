declare const sanitizedHtml: unique symbol;

export type SanitizedHtml = string & { readonly [sanitizedHtml]: true };

export type CompiledContentPage = {
  bodyHtml: SanitizedHtml;
  description: string;
  source: string;
  title: string;
};

export type CompiledWritingPost = CompiledContentPage & {
  coverImage: string;
  coverImageSmall: string;
  createdAt: string;
  externalTags: string[];
  internalTags: string[];
  legacySlugs: string[];
  shortTitle: string;
  slug: string;
  tags: string[];
};
