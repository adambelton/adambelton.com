import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "apps/client/src/auth/pages/LoginPage";

const authSession = vi.hoisted(() => ({
  data: null as null | { user: { id: string; email: string; name: string } },
  isPending: false,
}));

vi.mock("apps/client/src/auth/authClient", () => ({
  authClient: {
    useSession: () => authSession,
  },
}));

describe("LoginPage", () => {
  afterEach(() => {
    authSession.data = null;
    authSession.isPending = false;
  });

  it("presents neutral shared sign-in language", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(markup).toContain("<title>Sign in — Adam Belton</title>");
    expect(markup).toContain('<meta content="noindex" name="robots"/>');
    expect(markup).toContain(">Sign in</h1>");
    expect(markup).not.toContain("Owner sign in");
    expect(markup).toContain("secure magic link");
    expect(markup).not.toContain("private product access");
  });

  it("does not render the sign-in form for an authenticated visitor", () => {
    authSession.data = {
      user: { id: "owner", email: "owner@example.com", name: "Owner" },
    };

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(markup).not.toContain("Send sign-in link");
    expect(markup).not.toContain("Owner sign in");
  });
});
