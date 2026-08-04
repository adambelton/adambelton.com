import { describe, expect, it } from "vitest";
import type { LlmRequest } from "packages/ai/src";
import {
  DisabledDraftChangeInterpretationModelAdapter,
  LlmDraftChangeInterpretationModelAdapter,
} from "apps/api/src/products/thoughtform/adapters/ai/draft-change-interpretation-model-adapter";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";

const input = {
  change: {
    fromRevision: 1,
    toRevision: 2,
    scope: "passage" as const,
    start: 0,
    end: 4,
    removedText: "Power",
    addedText: "Accountability",
  },
  currentIdeaMap: { revision: 1, ideas: [] },
  previousMessages: [],
};

describe("draft change interpretation model adapter", () => {
  it("uses one bounded structured request for classification and provisional response", async () => {
    const requests: LlmRequest[] = [];
    const adapter = new LlmDraftChangeInterpretationModelAdapter({
      async createMessage(request) {
        requests.push(request);
        return {
          model: "test-model",
          content: JSON.stringify({
            type: "conceptual_change",
            assistantMessage: "It sounds as though accountability is now the emphasis. Is that right?",
            potentialConflicts: [],
          }),
        };
      },
    });
    await expect(adapter.interpret(input)).resolves.toMatchObject({ type: "conceptual_change" });
    expect(requests[0]).toMatchObject({
      maxTokens: 1_024,
      outputFormat: { name: "thoughtform_saved_edit_interpretation" },
    });
    expect(requests[0]?.system).toContain("provisional");
    expect(requests[0]?.system).toContain("under 80 words");
  });

  it("fails closed for disabled or malformed hosted responses", async () => {
    await expect(new DisabledDraftChangeInterpretationModelAdapter().interpret(input))
      .rejects.toBeInstanceOf(HostedAiDisabledError);
    const malformed = new LlmDraftChangeInterpretationModelAdapter({
      async createMessage() { return { model: "test", content: "{}" }; },
    });
    await expect(malformed.interpret(input)).rejects.toBeInstanceOf(HostedAiUnavailableError);
  });
});
