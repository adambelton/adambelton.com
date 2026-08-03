import { describe, expect, it } from "vitest";
import type { LlmRequest } from "packages/ai/src";
import {
  DisabledDraftModelAdapter,
  LlmDraftModelAdapter,
} from "apps/api/src/products/socratic-draft/adapters/ai/draft-model-adapter";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/socratic-draft/server/capabilities/conversation";
import { REVISION_PROPOSAL_SCOPES } from "packages/products/src/socratic-draft/shared";

describe("draft model adapters", () => {
  it("maps composition requests and parses structured provider output", async () => {
    const requests: LlmRequest[] = [];
    const adapter = new LlmDraftModelAdapter({
      async createMessage(request) {
        requests.push(request);
        return { content: JSON.stringify({ body: "Composed draft." }), model: "test-model" };
      },
    });

    await expect(adapter.compose({
      selectedIdeas: [],
      relevantConversationLanguage: ["Useful phrase"],
      instruction: "Compose an early draft.",
    })).resolves.toEqual({ body: "Composed draft." });
    expect(requests[0]).toMatchObject({
      maxTokens: 8_192,
      outputFormat: { name: "socratic_draft_composition" },
    });
    expect(requests[0]?.system).toContain("user's own voice and perspective");
    expect(requests[0]?.system).toContain("Never expose labels or sections");
    expect(requests[0]?.system).toContain("never reproduce them as a questionnaire");
  });

  it("maps proposal requests and rejects malformed provider output", async () => {
    const adapter = new LlmDraftModelAdapter({
      async createMessage() {
        return { content: JSON.stringify({ proposedContent: 42 }), model: "test-model" };
      },
    });

    await expect(adapter.propose({
      draftBody: "Original draft.",
      scope: REVISION_PROPOSAL_SCOPES.wholeDraft,
      originalContent: "Original draft.",
      userInstruction: "Tighten it.",
    })).rejects.toBeInstanceOf(HostedAiUnavailableError);
  });

  it("fails closed without invoking a provider when disabled", async () => {
    const adapter = new DisabledDraftModelAdapter();
    await expect(adapter.compose({
      selectedIdeas: [],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    })).rejects.toBeInstanceOf(HostedAiDisabledError);
  });

  it("normalizes provider failures to the product unavailable error", async () => {
    const adapter = new LlmDraftModelAdapter({
      async createMessage() {
        throw new Error("provider detail");
      },
    });

    await expect(adapter.compose({
      selectedIdeas: [],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    })).rejects.toBeInstanceOf(HostedAiUnavailableError);
  });
});
