declare const sanitizedHtml: unique symbol;

export type SanitizedHtml = string & { readonly [sanitizedHtml]: true };

export type CompiledContentPage = {
  bodyHtml: SanitizedHtml;
  description: string;
  source: string;
  title: string;
};

export type CompiledWritingPost = CompiledContentPage & {
  createdAt: string;
  slug: string;
};
