import { describe, expect, it } from "vitest";
import {
  InvalidSemanticMarkdownError,
  normalizeSemanticMarkdown,
  plainTextToSemanticMarkdown,
  semanticMarkdownText,
} from "packages/products/src/socratic-draft/server/capabilities/drafting/semantic-markdown";

describe("semantic Markdown", () => {
  it("normalizes the supported dialect deterministically", () => {
    const source = `# A heading\n\n__Important__ and _considered_.\n\n* one\n* two\n\n:::image-placeholder{description="A diagram" alt="Two connected ideas"}\n:::\n`;
    const normalized = normalizeSemanticMarkdown(source);

    expect(normalized).toBe(`# A heading\n\n**Important** and *considered*.\n\n- one\n- two\n\n:::image-placeholder{description="A diagram" alt="Two connected ideas"}\n:::\n`);
    expect(normalizeSemanticMarkdown(normalized)).toBe(normalized);
  });

  it("rejects HTML, unknown directives, unsafe links and deep headings", () => {
    expect(() => normalizeSemanticMarkdown("<p>HTML</p>")).toThrow(InvalidSemanticMarkdownError);
    expect(() => normalizeSemanticMarkdown(":::callout\n:::")).toThrow("Unsupported Markdown directive");
    expect(() => normalizeSemanticMarkdown("[unsafe](javascript:alert(1))")).toThrow("safe URL scheme");
    expect(() => normalizeSemanticMarkdown("##### Too deep")).toThrow("levels one through four");
  });

  it("converts existing plain text without interpreting Markdown punctuation", () => {
    expect(plainTextToSemanticMarkdown("# Not a heading\n\n* not emphasis *")).toBe(
      "\\# Not a heading\n\n\\* not emphasis \\*\n",
    );
  });

  it("derives model-friendly text including placeholder meaning", () => {
    expect(semanticMarkdownText(`## Result\n\nThe claim is **important**.\n\n:::image-placeholder{description="A diagram" purpose="Explain the split"}\n:::`)).toBe(
      "Result\n\nThe claim is important.\n\nImage placeholder: A diagram\nPurpose: Explain the split",
    );
  });
});
