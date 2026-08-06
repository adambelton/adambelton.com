import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";

describe("PublicPageMetadata", () => {
  it("uses the production apex domain for canonical URLs", () => {
    const markup = renderToStaticMarkup(
      <PublicPageMetadata
        description="A public page."
        path="/about"
        title="About — Adam Belton"
      />,
    );

    expect(markup).toContain("<title>About — Adam Belton</title>");
    expect(markup).toContain(
      '<meta content="A public page." name="description"/>',
    );
    expect(markup).toContain(
      '<link href="https://adambelton.com/about" rel="canonical"/>',
    );
  });
});
