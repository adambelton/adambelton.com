import { describe, expect, it } from "vitest";
import type { ConversationModelRequest } from "packages/products/src/thoughtform/server";
import { CONVERSATION_MESSAGE_ROLES } from "packages/products/src/thoughtform/shared";
import {
  applyConversationContextVariant,
  CONVERSATION_CONTEXT_VARIANTS,
  createBalancedContextVariantOrder,
  measureConversationPayloadBytes,
} from "packages/products/src/thoughtform/testing/evaluations/conversation-context-size";

const request: ConversationModelRequest = {
  maxOutputTokens: 100,
  system: "system",
  context: "context",
  outputFormat: { name: "result", schema: { type: "object" } },
  messages: Array.from({ length: 6 }, (_, index) => [
    { role: CONVERSATION_MESSAGE_ROLES.user, content: `user ${index + 1}` },
    { role: CONVERSATION_MESSAGE_ROLES.assistant, content: `assistant ${index + 1}` },
  ]).flat().concat([
    { role: CONVERSATION_MESSAGE_ROLES.user, content: "current" },
  ]),
};

describe("conversation context size evaluation", () => {
  it("retains the complete bounded request for the control", () => {
    expect(applyConversationContextVariant(
      request,
      CONVERSATION_CONTEXT_VARIANTS.full,
    )).toBe(request);
  });

  it.each([
    [CONVERSATION_CONTEXT_VARIANTS.fourTurns, 9, "user 3"],
    [CONVERSATION_CONTEXT_VARIANTS.twoTurns, 5, "user 5"],
  ] as const)("retains complete recent turns for %s", (variant, length, first) => {
    const selected = applyConversationContextVariant(request, variant);
    expect(selected.messages).toHaveLength(length);
    expect(selected.messages[0]?.content).toBe(first);
    expect(selected.messages.at(-1)?.content).toBe("current");
  });

  it("measures exact UTF-8 payload segments", () => {
    const payload = measureConversationPayloadBytes(request);
    expect(payload.system).toBe(6);
    expect(payload.context).toBe(7);
    expect(payload.history).toBeGreaterThan(payload.currentMessage);
    expect(payload.outputSchema).toBeGreaterThan(0);
    expect(payload.providerInput).toBeGreaterThan(payload.history);
  });

  it("rotates every variant through every order position", () => {
    const orders = [1, 2, 3].map(createBalancedContextVariantOrder);
    expect(orders.map((order) => order[0])).toEqual(Object.values(
      CONVERSATION_CONTEXT_VARIANTS,
    ));
    expect(orders.every((order) => new Set(order).size === 3)).toBe(true);
  });
});
