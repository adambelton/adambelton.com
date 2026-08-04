import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Container } from "apps/client/src/ui/layout/Container";

describe("Container", () => {
  it("owns the host-wide 1440px maximum width", () => {
    const markup = renderToStaticMarkup(<Container>Content</Container>);
    expect(markup).toContain("max-w-[1440px]");
  });
});
