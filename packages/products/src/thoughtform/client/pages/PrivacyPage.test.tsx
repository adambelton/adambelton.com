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
    expect(markup).toContain("text-5xl");
    expect(markup).not.toContain("text-6xl");
    expect(markup).toContain("mt-6");
    expect(markup).toContain('class="eyebrow mb-5"');
    expect(markup).toContain("border-t border-[var(--line)] pt-5 text-base leading-7");
    expect(markup).toContain("24 hours");
    expect(markup).toContain("currently configured supported AI provider");
    expect(markup).toContain("Current AI processing information is loading");
    expect(markup).toContain("clear it immediately");
    expect(markup).toContain('href="/privacy"');
  });
});
