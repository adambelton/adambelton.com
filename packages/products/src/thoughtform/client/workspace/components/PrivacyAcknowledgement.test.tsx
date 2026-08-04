import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrivacyAcknowledgement } from "packages/products/src/thoughtform/client/workspace/components/PrivacyAcknowledgement";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client";
import { ACCESS_LEVELS } from "packages/shared/src";

const components: ProductAppComponents = {
  navigate: () => undefined,
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("ThoughtForm privacy acknowledgement", () => {
  it("does not render editor controls before acknowledgement", () => {
    const markup = renderToStaticMarkup(
      <PrivacyAcknowledgement
        accessLevel={ACCESS_LEVELS.demo}
        components={components}
        onAcknowledge={() => undefined}
      />,
    );

    expect(markup).toContain("Your thinking and this demo");
    expect(markup).toContain('type="checkbox"');
    expect(markup).not.toContain("What are you thinking?");
    expect(markup).toContain("Leave the editor");
    expect(markup).toContain(
      'href="/products/thoughtform/privacy"',
    );
  });
});
