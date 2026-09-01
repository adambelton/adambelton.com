import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compileCapabilityProfile } from "apps/client/src/website/content/build/compile-capability-profile";
import {
  parseContentDocument,
  renderSanitizedMarkdown,
} from "apps/client/src/website/content/build/compile-content";

const source = "apps/client/src/content/widgets/capability-profile-content.md";
const sourceText = readFileSync(new URL("../../../content/widgets/capability-profile-content.md", import.meta.url), "utf8");
const dependencies = { parseContentDocument, renderSanitizedMarkdown };

describe("capability profile content", () => {
  it("compiles the authored views, classifications, sections, and capabilities", () => {
    const profile = compileCapabilityProfile(sourceText, source, dependencies);

    expect(profile.eyebrow).toBe("Professional profile");
    expect(profile.title).toBe("Engineering capability profile");
    expect(profile.classificationGuide).toEqual({
      eyebrow: "Capability profile",
      title: "Classification guide",
    });
    expect(profile.views.map(({ key }) => key)).toEqual([
      "overview",
      "evidence-basis",
      "development-trajectory",
      "leverage-profile",
    ]);
    expect(profile.views[1]?.introductionHtml).toContain(
      "Every capability here has concrete evidence behind it.",
    );
    expect(profile.views[0]?.introductionHtml.match(/<p>/g)).toHaveLength(2);
    expect(profile.views[0]?.introductionHtml).toContain("The aim is not to grade myself.");
    expect(profile.classifications.evidence_basis.values.map(({ key }) => key)).toEqual([
      "commercial_ownership",
      "commercial_exposure",
      "applied",
    ]);
    expect(profile.classifications.evidence_basis.values[0]?.explanationHtml).toContain(
      "paid, real-world product work",
    );
    expect(profile.classifications.evidence_basis.introductionHtml).toContain(
      "Every capability here has concrete evidence behind it.",
    );
    expect(profile.sections.map(({ key }) => key)).toEqual([
      "engineering-practice",
      "systems-and-architecture",
      "leadership",
    ]);
    expect(profile.sections.map(({ capabilities }) => capabilities.length)).toEqual([10, 7, 3]);
    expect(profile.sections[0]?.capabilities[0]).toMatchObject({
      name: "Full-stack engineering",
      evidenceBasis: "commercial_ownership",
      developmentTrajectory: "maintaining",
      leverageProfile: "core_competency",
    });
    expect(profile.sections[0]?.capabilities[0]?.descriptionHtml).toContain(
      "follow a product problem across the technical stack",
    );
    expect(profile.sections[0]?.capabilities[0]?.leverageProfileHtml).toContain(
      "product ownership often crosses technical layers",
    );
  });

  it("takes visible classification labels from Markdown headings", () => {
    const renamed = sourceText
      .replace("# Overview", "# Profile overview")
      .replace("# Evidence basis", "# Experience basis")
      .replaceAll("### Evidence basis:", "### Experience basis:");
    const profile = compileCapabilityProfile(renamed, source, dependencies);

    expect(profile.views[0]?.label).toBe("Profile overview");
    expect(profile.views[1]?.label).toBe("Experience basis");
    expect(profile.classifications.evidence_basis.label).toBe("Experience basis");
  });

  it("requires an authored Leverage profile paragraph for every capability", () => {
    const withoutLeverageProfile = sourceText.replace(
      /\n### Leverage profile: \[Core competency\]\n\nCore competency because product ownership[\s\S]*?handoff friction\.\n/,
      "\n",
    );

    expect(() => compileCapabilityProfile(
      withoutLeverageProfile,
      source,
      dependencies,
    )).toThrow('capability "Full-stack engineering" is missing Leverage profile:');
  });

  it("rejects unknown classification keys and duplicated human-readable metadata", () => {
    expect(() => compileCapabilityProfile(
      sourceText.replace("evidence_basis: commercial_ownership", "evidence_basis: invented"),
      source,
      dependencies,
    )).toThrow('references unknown evidence_basis key "invented"');

    expect(() => compileCapabilityProfile(
      sourceText.replace(
        "evidence_basis: commercial_ownership",
        "evidence_basis: commercial_ownership\nevidence_basis_label: Commercial ownership",
      ),
      source,
      dependencies,
    )).toThrow('unsupported metadata field "evidence_basis_label"');
  });
});
