// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { Breadcrumbs } from "apps/client/src/components/Breadcrumbs";

afterEach(cleanup);

describe("Breadcrumbs", () => {
  it("links ancestors and marks only the current page", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={[
          { label: "Products", href: "/products" },
          { label: "Socratic Draft", href: "/products/socratic-draft" },
          { label: "Editor" },
        ]} />
      </MemoryRouter>,
    );

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(breadcrumb.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Products" }).getAttribute("href")).toBe("/products");
    expect(screen.getByText("Editor").getAttribute("aria-current")).toBe("page");
    expect(breadcrumb.textContent).toBe("Products*Socratic Draft*Editor");
  });
});
