import { describe, expect, it } from "vitest";
import { prerenderRoutes } from "apps/client/src/website/prerender/prerender-routes";

describe("prerenderRoutes", () => {
  it("includes the About page", () => {
    expect(prerenderRoutes).toContain("/about");
  });
});
