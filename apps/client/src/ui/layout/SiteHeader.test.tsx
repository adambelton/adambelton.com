import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "apps/client/src/ui/layout/SiteHeader";
import { useAuthSession } from "apps/client/src/auth";

vi.mock("apps/client/src/auth", () => ({
  useAuthSession: vi.fn(),
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.mocked(useAuthSession).mockReturnValue({ data: null } as ReturnType<
      typeof useAuthSession
    >);
  });

  it("does not advertise the private login route to anonymous visitors", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <SiteHeader />
      </MemoryRouter>,
    );

    expect(markup).not.toContain("Log in");
    expect(markup).not.toContain('href="/login"');
  });

  it("keeps logout available for an authenticated owner", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: { user: { email: "owner@example.com", id: "owner", name: "Adam" } },
    } as ReturnType<typeof useAuthSession>);

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <SiteHeader />
      </MemoryRouter>,
    );

    expect(markup).toContain('href="/logout"');
    expect(markup).toContain("Log out");
  });
});
