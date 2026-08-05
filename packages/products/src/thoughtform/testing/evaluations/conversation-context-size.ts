import type { ConversationModelRequest } from "packages/products/src/thoughtform/server";
import {
  CONVERSATION_MESSAGE_ROLES,
  type ConversationMessage,
} from "packages/products/src/thoughtform/shared";

export const CONVERSATION_CONTEXT_VARIANTS = {
  full: "full_bounded_history",
  fourTurns: "four_recent_turns",
  twoTurns: "two_recent_turns",
} as const;

export type ConversationContextVariant =
  typeof CONVERSATION_CONTEXT_VARIANTS[keyof typeof CONVERSATION_CONTEXT_VARIANTS];

export interface ConversationPayloadBytes {
  system: number;
  context: number;
  history: number;
  currentMessage: number;
  outputSchema: number;
  providerInput: number;
}

const MAX_COMPLETED_TURNS: Record<ConversationContextVariant, number | null> = {
  [CONVERSATION_CONTEXT_VARIANTS.full]: null,
  [CONVERSATION_CONTEXT_VARIANTS.fourTurns]: 4,
  [CONVERSATION_CONTEXT_VARIANTS.twoTurns]: 2,
};

export function applyConversationContextVariant(
  request: ConversationModelRequest,
  variant: ConversationContextVariant,
): ConversationModelRequest {
  const maximumTurns = MAX_COMPLETED_TURNS[variant];
  if (maximumTurns === null || request.messages.length <= 1) return request;
  const currentMessage = request.messages.at(-1)!;
  const history = request.messages.slice(0, -1);
  const retained = history.slice(-maximumTurns * 2);
  while (
    retained.length > 0 &&
    retained[0]?.role === CONVERSATION_MESSAGE_ROLES.assistant
  ) retained.shift();
  return { ...request, messages: [...retained, currentMessage] };
}

export function measureConversationPayloadBytes(
  request: ConversationModelRequest,
): ConversationPayloadBytes {
  const currentMessage = request.messages.at(-1);
  const history = request.messages.slice(0, -1);
  return {
    system: bytes(request.system),
    context: bytes(request.context ?? ""),
    history: bytes(JSON.stringify(history)),
    currentMessage: bytes(JSON.stringify(currentMessage ?? null)),
    outputSchema: bytes(JSON.stringify(request.outputFormat)),
    providerInput: bytes(JSON.stringify({
      system: request.context
        ? `${request.system}\n\n${request.context}`
        : request.system,
      messages: request.messages,
    })),
  };
}

export function createBalancedContextVariantOrder(repetition: number) {
  const variants = Object.values(CONVERSATION_CONTEXT_VARIANTS);
  const offset = (repetition - 1) % variants.length;
  return [...variants.slice(offset), ...variants.slice(0, offset)];
}

function bytes(value: string) {
  return new TextEncoder().encode(value).byteLength;
}
