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

    expect(markup).toContain("How this site handles your data");
    expect(markup).toContain("Review the applicable product privacy page");
    expect(markup).toContain(
      'href="/products/thoughtform/privacy"',
    );
    expect(markup).toContain("Resend");
    expect(markup).toContain("Neon");
    expect(markup).toContain("hello@adambelton.com");
  });
});
