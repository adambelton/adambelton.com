import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthSession } from "apps/client/src/auth/session";
import { useIsDevelopmentFeatureEnabled } from "apps/client/src/platform/access/useIsDevelopmentFeatureEnabled";

vi.mock("apps/client/src/auth/session", () => ({
  useAuthSession: vi.fn(),
}));

describe("useIsDevelopmentFeatureEnabled", () => {
  beforeEach(() => {
    vi.mocked(useAuthSession).mockReturnValue({ data: null } as ReturnType<
      typeof useAuthSession
    >);
  });

  it("enables development features in development", () => {
    let enabled = false;
    function Probe() {
      enabled = useIsDevelopmentFeatureEnabled();
      return null;
    }

    renderToStaticMarkup(<Probe />);

    expect(enabled).toBe(true);
  });

  it("enables development features for owners", () => {
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
      enabled = useIsDevelopmentFeatureEnabled();
      return null;
    }

    renderToStaticMarkup(<Probe />);

    expect(enabled).toBe(true);
  });
});
