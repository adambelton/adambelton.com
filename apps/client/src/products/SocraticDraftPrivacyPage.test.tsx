import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SocraticDraftPrivacyPage } from "packages/products/src/socratic-draft/client/app/privacy/SocraticDraftPrivacyPage";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client";

const components: ProductAppComponents = {
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("Socratic Draft privacy page", () => {
  it("explains the product-specific conversation lifecycle", () => {
    const markup = renderToStaticMarkup(
      <SocraticDraftPrivacyPage components={components} />,
    );

    expect(markup).toContain("How this product handles your writing");
    expect(markup).toContain("24 hours");
    expect(markup).toContain("OpenAI Responses API");
    expect(markup).toContain("clear it immediately");
    expect(markup).toContain('href="/privacy"');
  });
});
