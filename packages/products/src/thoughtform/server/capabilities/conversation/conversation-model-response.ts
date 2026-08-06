import type {
  AssistantMove,
  AssistantReadiness,
  UserIntention,
} from "packages/products/src/thoughtform/shared";
import {
  ASSISTANT_MOVES,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/thoughtform/shared";

const DEFAULT_ASSISTANT_MESSAGE = "What would you like to think through?";

export const DISCOVERY_ASSISTANT_MOVES = [
  ASSISTANT_MOVES.askForExample,
  ASSISTANT_MOVES.branchCheck,
  ASSISTANT_MOVES.challenge,
  ASSISTANT_MOVES.clarify,
  ASSISTANT_MOVES.distinguish,
  ASSISTANT_MOVES.fullReflection,
  ASSISTANT_MOVES.offerDraft,
  ASSISTANT_MOVES.partialReflection,
  ASSISTANT_MOVES.probe,
  ASSISTANT_MOVES.suggestResearch,
  ASSISTANT_MOVES.surfacePerspective,
] as const;

const DISCOVERY_MOVES = new Set<AssistantMove>(DISCOVERY_ASSISTANT_MOVES);

export function parseConversationModelResponse(content: string): {
  response: string;
  move: AssistantMove;
  assistantReadiness: AssistantReadiness[];
  userIntention: UserIntention | null;
} {
  const trimmed = content.trim();
  try {
    const parsed = JSON.parse(stripJsonFence(trimmed)) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "response" in parsed &&
      typeof parsed.response === "string"
    ) {
      return {
        response: parsed.response.trim() || DEFAULT_ASSISTANT_MESSAGE,
        move: parseAssistantMove("move" in parsed ? parsed.move : null),
        assistantReadiness: parseAssistantReadiness(
          "assistantReadiness" in parsed ? parsed.assistantReadiness : null,
        ),
        userIntention: parseUserIntention(
          "userIntention" in parsed ? parsed.userIntention : null,
        ),
      };
    }
  } catch {
    if (looksLikeStructuredOutput(trimmed)) {
      return {
        response: DEFAULT_ASSISTANT_MESSAGE,
        ...createDefaultDiscoveryMetadata(),
      };
    }
  }
  return {
    response: trimmed || DEFAULT_ASSISTANT_MESSAGE,
    ...createDefaultDiscoveryMetadata(),
  };
}

function createDefaultDiscoveryMetadata() {
  return {
    move: ASSISTANT_MOVES.probe,
    assistantReadiness: [] as AssistantReadiness[],
    userIntention: null as UserIntention | null,
  };
}

function parseAssistantMove(value: unknown): AssistantMove {
  return typeof value === "string" && DISCOVERY_MOVES.has(value as AssistantMove)
    ? value as AssistantMove
    : ASSISTANT_MOVES.probe;
}

function parseAssistantReadiness(value: unknown): AssistantReadiness[] {
  if (!Array.isArray(value)) return [];
  const actions = new Set<string>();
  const readiness: AssistantReadiness[] = [];
  for (const item of value.slice(0, 2)) {
    if (typeof item !== "object" || item === null) continue;
    const action = "action" in item ? item.action : null;
    const assessment = "assessment" in item ? item.assessment : null;
    if (
      (action !== READINESS_ACTIONS.reflect && action !== READINESS_ACTIONS.compose) ||
      (assessment !== READINESS_ASSESSMENTS.notReady &&
        assessment !== READINESS_ASSESSMENTS.ready &&
        assessment !== READINESS_ASSESSMENTS.readyWithUncertainty) ||
      actions.has(action)
    ) continue;
    const explanation = "explanation" in item ? item.explanation : null;
    if (
      assessment === READINESS_ASSESSMENTS.readyWithUncertainty &&
      (typeof explanation !== "string" || explanation.trim().length === 0)
    ) continue;
    readiness.push({
      action,
      assessment,
      ...(typeof explanation === "string" && explanation.trim()
        ? { explanation: explanation.trim() }
        : {}),
    });
    actions.add(action);
  }
  return readiness;
}

function parseUserIntention(value: unknown): UserIntention | null {
  return value === USER_INTENTIONS.explore ||
      value === USER_INTENTIONS.reflect ||
      value === USER_INTENTIONS.compose
    ? value
    : null;
}

function looksLikeStructuredOutput(content: string) {
  return content.startsWith("{") || content.startsWith("```json");
}

function stripJsonFence(content: string) {
  return content.startsWith("```json") && content.endsWith("```")
    ? content.slice(7, -3).trim()
    : content;
}
