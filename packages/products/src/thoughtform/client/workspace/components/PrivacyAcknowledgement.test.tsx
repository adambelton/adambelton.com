import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrivacyAcknowledgement } from "packages/products/src/thoughtform/client/workspace/components/PrivacyAcknowledgement";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client";

const components: ProductAppComponents = {
  navigate: () => undefined,
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("ThoughtForm privacy acknowledgement", () => {
  it("does not render editor controls before acknowledgement", () => {
    const markup = renderToStaticMarkup(
      <PrivacyAcknowledgement
        components={components}
        onAcknowledge={() => undefined}
      />,
    );

    expect(markup).toContain("Before you begin");
    expect(markup).toContain('data-testid="privacy-acknowledgement"');
    expect(markup).toContain("h-full overflow-y-auto");
    expect(markup).toContain("mx-auto grid min-h-full w-full max-w-4xl content-center");
    expect(markup).toContain("Temporary storage");
    expect(markup).toContain("no more than 24 hours");
    expect(markup).toContain("Use appropriate information");
    expect(markup).not.toContain("Saved owner conversations");
    expect(markup).toContain('type="checkbox"');
    expect(markup).not.toContain("What are you thinking?");
    expect(markup).toContain("Leave the editor");
    expect(markup).toContain(
      'href="/products/thoughtform/privacy"',
    );
    expect(markup).toContain("Current AI processing information is loading");
  });
});
