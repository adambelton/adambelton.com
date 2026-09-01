// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CapabilityProfile } from "apps/client/src/website/capability-profile/CapabilityProfile";
import { capabilityProfileContent } from "apps/client/src/website/content/content";

afterEach(cleanup);

describe("CapabilityProfile", () => {
  it("renders Overview as a three-column grid within every persistent section", () => {
    const { container } = render(<CapabilityProfile profile={capabilityProfileContent} />);

    for (const label of ["Engineering practice", "Systems & architecture", "Leadership"]) {
      const section = screen.getByRole("heading", { name: label }).closest("section");
      expect(section?.className).toContain("md:grid-cols-4");
      expect(section?.querySelector(".md\\:grid-cols-3")).toBeTruthy();
    }
    expect(
      container.querySelectorAll(
        '[aria-labelledby^="capability-section-"] [aria-haspopup="dialog"]',
      ),
    ).toHaveLength(20);
    const firstCard = screen.getByRole("button", { name: /Full-stack engineering/ });
    expect(firstCard.className).toContain("cursor-pointer");
    expect(firstCard.className).not.toContain("min-h-");
    expect(firstCard.querySelector(".font-semibold")?.className).toContain("text-base");
    expect(firstCard.textContent).not.toContain("+");
    expect(firstCard.textContent).not.toContain("View details");
  });

  it("keeps an empty fourth matrix column in the Impact profile view", () => {
    const { container } = render(<CapabilityProfile profile={capabilityProfileContent} />);
    fireEvent.click(screen.getByRole("tab", { name: "Impact profile" }));

    const definitions = screen.getByRole("group", { name: "Impact profile column definitions" });
    expect(definitions.children).toHaveLength(4);
    expect(definitions.lastElementChild?.getAttribute("aria-hidden")).toBe("true");

    for (const section of container.querySelectorAll('[aria-labelledby^="capability-section-"]')) {
      const content = section.querySelector(":scope > .md\\:col-span-3");
      expect(content?.children).toHaveLength(3);
      expect(content?.lastElementChild?.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("keeps sections primary and groups each one independently in a classification view", () => {
    render(<CapabilityProfile profile={capabilityProfileContent} />);
    fireEvent.click(screen.getByRole("tab", { name: "Evidence basis" }));

    expect(screen.getByText(/Every capability here has concrete evidence behind it/)).toBeTruthy();
    const definitions = screen.getByRole("group", { name: "Evidence basis column definitions" });
    expect(definitions.children).toHaveLength(4);
    expect(definitions.querySelectorAll("h3 > span")).toHaveLength(0);
    expect(within(definitions).getByText(/paid, real-world product work/)).toBeTruthy();
    for (const label of ["Engineering practice", "Systems & architecture", "Leadership"]) {
      const section = screen.getByRole("heading", { name: label }).closest("section")!;
      expect(within(section).getByRole("heading", { name: "Commercial ownership" })).toBeTruthy();
      expect(within(section).getByRole("heading", { name: "Commercial exposure" })).toBeTruthy();
      expect(within(section).getByRole("heading", { name: "Applied" })).toBeTruthy();
    }
  });

  it("opens the Markdown-backed classification guide with stable classification colours", () => {
    render(<CapabilityProfile profile={capabilityProfileContent} />);
    const guideButton = screen.getByRole("button", { name: "Open classification guide" });
    guideButton.focus();
    fireEvent.click(guideButton);

    const dialog = screen.getByRole("dialog", { name: "Classification guide" });
    expect(within(dialog).getByText(/Every capability here has concrete evidence behind it/)).toBeTruthy();
    expect(within(dialog).getByText(/difference between stable parts of my practice/)).toBeTruthy();
    expect(within(dialog).getByText(/Every capability here matters/)).toBeTruthy();
    expect(within(dialog).getByText(/paid, real-world product work/)).toBeTruthy();
    expect(within(dialog).queryByText(/Where the evidence for a capability comes from/)).toBeNull();
    const valueTags = dialog.querySelectorAll("dt span");
    expect(valueTags).toHaveLength(8);
    expect(valueTags[0]?.className).toContain("classification-evidence-background");
    expect(valueTags[3]?.className).toContain("classification-trajectory-background");
    expect(valueTags[6]?.className).toContain("classification-impact-background");
    expect(screen.getByRole("button", { name: "Close classification guide" })).toBe(document.activeElement);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Classification guide" })).toBeNull();
    expect(guideButton).toBe(document.activeElement);
  });

  it("renders visible interface labels from the compiled Markdown model", () => {
    const profile = {
      ...capabilityProfileContent,
      eyebrow: "Authored profile eyebrow",
      classificationGuide: {
        eyebrow: "Authored guide eyebrow",
        title: "Authored guide title",
      },
      classifications: {
        ...capabilityProfileContent.classifications,
        evidence_basis: {
          ...capabilityProfileContent.classifications.evidence_basis,
          label: "Authored evidence label",
        },
      },
      views: capabilityProfileContent.views.map((view) => view.key === "evidence-basis"
        ? { ...view, label: "Authored evidence label" }
        : view),
    };
    render(<CapabilityProfile profile={profile} />);

    expect(screen.getByText("Authored profile eyebrow")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open classification guide" }));
    expect(screen.getByRole("dialog", { name: "Authored guide title" })).toBeTruthy();
    expect(screen.getByText("Authored guide eyebrow")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close classification guide" }));
    fireEvent.click(screen.getByRole("button", { name: /Full-stack engineering/ }));
    expect(within(screen.getByRole("dialog", { name: "Full-stack engineering" })).getByRole(
      "heading",
      { name: "Authored evidence label: Commercial ownership" },
    )).toBeTruthy();
  });

  it("supports arrow-key view selection and focused capability details", () => {
    render(<CapabilityProfile profile={capabilityProfileContent} />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });
    const evidenceView = screen.getByRole("tab", { name: "Evidence basis" });
    expect(evidenceView.getAttribute("aria-selected")).toBe("true");
    expect(evidenceView.className).toContain("classification-evidence-background");
    expect(screen.getByRole("tab", { name: "Development trajectory" }).className).toContain(
      "classification-trajectory-border",
    );
    expect(screen.getByRole("tab", { name: "Impact profile" }).className).toContain(
      "classification-impact-border",
    );
    expect(evidenceView.querySelector("span")?.className).toContain("font-bold");

    const capability = screen.getByRole("button", { name: /Full-stack engineering/ });
    capability.focus();
    fireEvent.click(capability);
    const dialog = screen.getByRole("dialog", { name: "Full-stack engineering" });
    expect(within(dialog).getByText(/follow a product problem across the technical stack/)).toBeTruthy();
    expect(within(dialog).getByText(/At INDY, I owned substantial product work/)).toBeTruthy();
    expect(within(dialog).getByText(/Working across the stack is already an established part/)).toBeTruthy();
    expect(within(dialog).getByText(/product ownership often crosses technical layers/)).toBeTruthy();
    expect(within(dialog).getByRole("heading", { name: "Impact profile: Core competency" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close capability details" })).toBe(document.activeElement);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(capability).toBe(document.activeElement);
  });
});
