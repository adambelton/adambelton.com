import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { LoginPage } from "apps/client/src/auth/pages/LoginPage";

describe("LoginPage", () => {
  it("describes the direct route as private owner access", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(markup).toContain("<title>Owner sign in — Adam Belton</title>");
    expect(markup).toContain('<meta content="noindex" name="robots"/>');
    expect(markup).toContain("Owner sign in.");
    expect(markup).toContain("private product access");
    expect(markup).not.toContain("product demos");
  });
});
