import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CareCalendarOverviewPage } from "apps/client/src/products/pages/CareCalendarOverviewPage";

describe("Care Calendar overview page", () => {
  it("presents the bounded definition-stage project without assurance claims", () => {
    const markup = renderToStaticMarkup(<CareCalendarOverviewPage />);

    expect(markup).toContain(">Care Calendar</h1>");
    expect(markup).toContain("structured product-engineering learning project");
    expect(markup).toContain("The work is ongoing");
    expect(markup).toContain("Learning areas");
    expect(markup).toContain("Care context and service design");
    expect(markup).toContain("Information governance and authority");
    expect(markup).toContain("Accessibility and inclusive communication");
    expect(markup).toContain("Security, resilience, and interoperability");
    expect(markup).toContain("Clinical safety and shared responsibility");
    expect(markup).toContain("Assurance and regulatory boundaries");
    expect(markup).toContain("sm:grid-cols-3");
    expect(markup).toContain("A concept to learn through");
    expect(markup).toContain("Current working boundaries");
    expect(markup).not.toContain("What the project teaches me");
    expect(markup).toContain("coordination view, not a medical record");
    expect(markup).toContain("not an implemented application");
    expect(markup).toContain("clinically assured, compliant, production-ready");
  });
});
