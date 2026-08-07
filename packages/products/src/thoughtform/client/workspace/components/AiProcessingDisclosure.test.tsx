import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AiProcessingDisclosure } from "packages/products/src/thoughtform/client/workspace/components/AiProcessingDisclosure";

describe("AiProcessingDisclosure", () => {
  it("renders the active provider from host-supplied disclosure data", () => {
    const markup = renderToStaticMarkup(<AiProcessingDisclosure
      Link={({ children, href }) => <a href={href}>{children}</a>}
      disclosure={{
        activeProvider: {
          id: "anthropic",
          name: "Anthropic",
          service: "Claude API",
          retentionSummary: "Retention summary.",
          trainingSummary: "Training summary.",
          policyUrl: "https://example.com/anthropic",
        },
        supportedProviders: [
          { id: "anthropic", name: "Anthropic", service: "Claude API", retentionSummary: "", trainingSummary: "", policyUrl: "https://example.com/anthropic" },
          { id: "openai", name: "OpenAI", service: "Responses API", retentionSummary: "", trainingSummary: "", policyUrl: "https://example.com/openai" },
        ],
      }}
    />);

    expect(markup).toContain("currently processed by Anthropic");
    expect(markup).toContain("Data processing details");
    expect(markup).toContain("Anthropic and OpenAI");
  });
});
