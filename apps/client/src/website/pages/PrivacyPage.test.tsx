import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { PrivacyPage } from "apps/client/src/website/pages/PrivacyPage";

describe("privacy page", () => {
  it("explains the platform lifecycle and links product privacy information", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(markup).toContain("<title>Privacy — Adam Belton</title>");
    expect(markup).toContain('href="/about#contact"');
    expect(markup).not.toContain("mailto:");

    expect(markup).toContain("How this site handles your data");
    expect(markup).toContain("text-5xl");
    expect(markup).not.toContain("text-6xl");
    expect(markup).toContain("mt-6");
    expect(markup).toContain('class="eyebrow mb-5"');
    expect(markup).toContain("border-t border-[var(--line)] pt-5 text-base leading-7");
    expect(markup).toContain("Review the applicable product privacy page");
    expect(markup).toContain(
      'href="/products/thoughtform/privacy"',
    );
    expect(markup).toContain("Resend");
    expect(markup).toContain("Neon");
    expect(markup).toContain("About page");
  });
});
