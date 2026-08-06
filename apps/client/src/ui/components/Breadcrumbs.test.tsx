// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { Breadcrumbs } from "apps/client/src/ui/components/Breadcrumbs";

afterEach(cleanup);

describe("Breadcrumbs", () => {
  it("links ancestors and marks only the current page", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={[
          { label: "Products", href: "/products" },
          { label: "ThoughtForm", href: "/products/thoughtform" },
          { label: "Editor" },
        ]} />
      </MemoryRouter>,
    );

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(breadcrumb.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Products" }).getAttribute("href")).toBe("/products");
    const currentPage = screen.getByText("Editor");
    expect(currentPage.getAttribute("aria-current")).toBe("page");
    expect(currentPage.className).toContain("break-words");
    expect(currentPage.closest("li")?.className).toContain("min-w-0");
    expect(breadcrumb.textContent).toBe("Products*ThoughtForm*Editor");
  });
});
