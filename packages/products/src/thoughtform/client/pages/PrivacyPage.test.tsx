import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrivacyPage } from "packages/products/src/thoughtform/client/pages/PrivacyPage";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client";

const components: ProductAppComponents = {
  navigate: () => undefined,
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("ThoughtForm privacy page", () => {
  it("explains the product-specific conversation lifecycle", () => {
    const markup = renderToStaticMarkup(
      <PrivacyPage components={components} />,
    );

    expect(markup).toContain("How this product handles your thinking");
    expect(markup).toContain("24 hours");
    expect(markup).toContain("OpenAI Responses API");
    expect(markup).toContain("clear it immediately");
    expect(markup).toContain('href="/privacy"');
  });
});
