import {
  DISCOVERY_ASSISTANT_MOVES,
  parseConversationModelResponse,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/thoughtform/shared";

export const CONVERSATION_OUTPUT_VARIANTS = {
  structured: "structured",
  plainText: "plain_text",
} as const;

export type ConversationOutputVariant =
  typeof CONVERSATION_OUTPUT_VARIANTS[keyof typeof CONVERSATION_OUTPUT_VARIANTS];

export const PLAIN_TEXT_OUTPUT_CONTRACT = `<output_contract>
Return an unconstrained text envelope in exactly this order:
The concise message shown to the user.
<metadata>{"move":"one allowed discovery move","assistantReadiness":[{"action":"reflect or compose","assessment":"not_ready, ready_with_uncertainty, or ready","explanation":"string or null"}],"userIntention":"explore, reflect, compose, or null"}</metadata>

Begin immediately with user-facing prose so useful text can stream from the first token. Then emit <metadata> as valid JSON. move must be one of: ask_for_example, branch_check, challenge, clarify, distinguish, full_reflection, offer_draft, partial_reflection, probe, suggest_research, surface_perspective. Include exactly one readiness entry for reflect and one for compose. The existing semantic contracts are authoritative for every value. Do not add a response tag, Markdown fence, commentary, or any other text.
</output_contract>`;

export interface PlainTextConversationEnvelope {
  response: string;
  move: string;
  assistantReadiness: unknown[];
  userIntention: string | null;
}

export interface ParsedPlainTextConversationOutput {
  canonicalContent: string;
  response: string;
  issues: string[];
}

export interface ConversationOutputMeasurement {
  variant: ConversationOutputVariant;
  repetition: number;
  turn: number;
  firstProviderTokenMs: number;
  firstUsefulTextMs: number;
  completeMs: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputCharacters: number;
  usefulCharacters: number;
  cacheState: "write" | "read" | "neither";
  contractIssues: string[];
  model: string;
}

export interface ConversationOutputSummary {
  calls: number;
  firstUsefulTextRangeMs: { minimum: number; maximum: number };
  medianFirstProviderTokenMs: number;
  medianFirstUsefulTextMs: number;
  medianCompleteMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalReasoningTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  contractFailureCount: number;
}

export class PlainResponseDeltaDecoder {
  private buffer = "";
  private isCompleted = false;

  push(chunk: string) {
    if (this.isCompleted) return "";
    this.buffer += chunk;
    const metadataIndex = this.buffer.indexOf("<metadata>");
    if (metadataIndex >= 0) {
      const text = this.buffer.slice(0, metadataIndex);
      this.buffer = this.buffer.slice(metadataIndex + "<metadata>".length);
      this.isCompleted = true;
      return text;
    }
    const safeLength = Math.max(0, this.buffer.length - "<metadata>".length);
    const text = this.buffer.slice(0, safeLength);
    this.buffer = this.buffer.slice(safeLength);
    return text;
  }

  finish() {
    if (this.isCompleted) return "";
    const text = this.buffer;
    this.buffer = "";
    return text;
  }
}

export function replaceStructuredOutputContract(system: string) {
  const start = system.indexOf("<output_contract>");
  const end = system.indexOf("</output_contract>");
  if (start < 0 || end < start) {
    throw new Error("The conversation prompt has no replaceable output contract.");
  }
  return `${system.slice(0, start)}${PLAIN_TEXT_OUTPUT_CONTRACT}${system.slice(
    end + "</output_contract>".length,
  )}`;
}

export function parsePlainTextConversationOutput(
  content: string,
): ParsedPlainTextConversationOutput {
  const metadataMatch = content.match(/<metadata>([\s\S]*?)<\/metadata>/);
  const issues: string[] = [];
  if (!metadataMatch) issues.push("missing metadata envelope");

  const response = content.slice(0, metadataMatch?.index ?? content.length).trim();
  if (!response) issues.push("missing response text");
  let metadata: Record<string, unknown> = {};
  if (metadataMatch) {
    try {
      const parsed = JSON.parse(metadataMatch[1]!.trim()) as unknown;
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        metadata = parsed as Record<string, unknown>;
      } else {
        issues.push("metadata is not an object");
      }
    } catch {
      issues.push("metadata is not valid JSON");
    }
  }
  issues.push(...validateMetadata(metadata));

  const tolerant = parseConversationModelResponse(JSON.stringify({
    response,
    move: metadata.move,
    assistantReadiness: metadata.assistantReadiness,
    userIntention: metadata.userIntention,
  }));
  return {
    canonicalContent: JSON.stringify(tolerant),
    response: tolerant.response,
    issues: [...new Set(issues)],
  };
}

export function getStructuredConversationContractIssues(content: string) {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return ["structured output is not an object"];
    }
    const value = parsed as Record<string, unknown>;
    const issues = validateMetadata(value);
    if (typeof value.response !== "string" || !value.response.trim()) {
      issues.unshift("invalid response");
    }
    return issues;
  } catch {
    return ["structured output is not valid JSON"];
  }
}

export function summariseConversationOutputMeasurements(
  measurements: readonly ConversationOutputMeasurement[],
): ConversationOutputSummary {
  const useful = measurements.map((measurement) => measurement.firstUsefulTextMs);
  return {
    calls: measurements.length,
    firstUsefulTextRangeMs: {
      minimum: useful.length > 0 ? Math.min(...useful) : 0,
      maximum: useful.length > 0 ? Math.max(...useful) : 0,
    },
    medianFirstProviderTokenMs: median(
      measurements.map((measurement) => measurement.firstProviderTokenMs),
    ),
    medianFirstUsefulTextMs: median(useful),
    medianCompleteMs: median(
      measurements.map((measurement) => measurement.completeMs),
    ),
    totalInputTokens: sum(measurements, (measurement) => measurement.inputTokens),
    totalOutputTokens: sum(measurements, (measurement) => measurement.outputTokens),
    totalReasoningTokens: sum(
      measurements,
      (measurement) => measurement.reasoningTokens,
    ),
    totalCacheReadTokens: sum(
      measurements,
      (measurement) => measurement.cacheReadTokens,
    ),
    totalCacheWriteTokens: sum(
      measurements,
      (measurement) => measurement.cacheWriteTokens,
    ),
    contractFailureCount: measurements.filter(
      (measurement) => measurement.contractIssues.length > 0,
    ).length,
  };
}

function validateMetadata(metadata: Record<string, unknown>) {
  const issues: string[] = [];
  if (
    typeof metadata.move !== "string" ||
    !(DISCOVERY_ASSISTANT_MOVES as readonly string[]).includes(metadata.move)
  ) {
    issues.push("invalid move");
  }
  if (!Array.isArray(metadata.assistantReadiness)) {
    issues.push("invalid readiness collection");
  } else {
    const entries = metadata.assistantReadiness;
    const actions = new Set(entries.flatMap((entry) =>
      typeof entry === "object" && entry !== null && "action" in entry &&
        typeof entry.action === "string"
        ? [entry.action]
        : []
    ));
    if (
      entries.length !== 2 ||
      !actions.has(READINESS_ACTIONS.reflect) ||
      !actions.has(READINESS_ACTIONS.compose)
    ) {
      issues.push("readiness must contain reflect and compose");
    }
    for (const entry of entries) {
      if (typeof entry !== "object" || entry === null) {
        issues.push("invalid readiness entry");
        continue;
      }
      const value = entry as Record<string, unknown>;
      if (
        value.assessment !== READINESS_ASSESSMENTS.notReady &&
        value.assessment !== READINESS_ASSESSMENTS.readyWithUncertainty &&
        value.assessment !== READINESS_ASSESSMENTS.ready
      ) {
        issues.push("invalid readiness assessment");
      }
      if (
        value.assessment === READINESS_ASSESSMENTS.readyWithUncertainty &&
        (typeof value.explanation !== "string" || !value.explanation.trim())
      ) {
        issues.push("uncertain readiness requires an explanation");
      }
    }
  }
  if (
    metadata.userIntention !== null &&
    metadata.userIntention !== undefined &&
    !(Object.values(USER_INTENTIONS) as string[]).includes(
      String(metadata.userIntention),
    )
  ) {
    issues.push("invalid user intention");
  }
  return issues;
}

function median(values: readonly number[]) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0
    ? Math.round((ordered[middle - 1]! + ordered[middle]!) / 2)
    : ordered[middle]!;
}

function sum<T>(values: readonly T[], select: (value: T) => number) {
  return values.reduce((total, value) => total + select(value), 0);
}
