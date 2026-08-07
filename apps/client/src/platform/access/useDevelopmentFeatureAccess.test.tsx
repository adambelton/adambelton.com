import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthSession } from "apps/client/src/auth/session";
import { useDevelopmentFeatureAccess } from "apps/client/src/platform/access/useDevelopmentFeatureAccess";

vi.mock("apps/client/src/auth/session", () => ({
  useAuthSession: vi.fn(),
}));

describe("useDevelopmentFeatureAccess", () => {
  beforeEach(() => {
    vi.mocked(useAuthSession).mockReturnValue({ data: null } as ReturnType<
      typeof useAuthSession
    >);
  });

  it("allows development features in development", () => {
    let enabled = false;
    function Probe() {
      enabled = useDevelopmentFeatureAccess();
      return null;
    }

    renderToStaticMarkup(<Probe />);

    expect(enabled).toBe(true);
  });

  it("allows owners independently of the development environment", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: {
        user: {
          email: "owner@example.com",
          id: "owner",
          isOwner: true,
          name: "Adam",
        },
      },
    } as ReturnType<typeof useAuthSession>);
    let enabled = false;
    function Probe() {
      enabled = useDevelopmentFeatureAccess();
      return null;
    }

    renderToStaticMarkup(<Probe />);

    expect(enabled).toBe(true);
  });
});
