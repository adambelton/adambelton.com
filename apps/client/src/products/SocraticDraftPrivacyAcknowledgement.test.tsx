import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrivacyAcknowledgement } from "packages/products/src/socratic-draft/client/app/editor/PrivacyAcknowledgement";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client";
import { ACCESS_LEVELS } from "packages/shared/src";

const components: ProductAppComponents = {
  Link: ({ children, href }) => <a href={href}>{children}</a>,
};

describe("Socratic Draft privacy acknowledgement", () => {
  it("does not render editor controls before acknowledgement", () => {
    const markup = renderToStaticMarkup(
      <PrivacyAcknowledgement
        accessLevel={ACCESS_LEVELS.demo}
        components={components}
        onAcknowledge={() => undefined}
      />,
    );

    expect(markup).toContain("Before you begin");
    expect(markup).toContain('type="checkbox"');
    expect(markup).not.toContain("Your next thought");
    expect(markup).toContain("Leave the editor");
    expect(markup).toContain(
      'href="/products/socratic-draft/privacy"',
    );
  });
});
