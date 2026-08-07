import { LangfuseSpanProcessor } from "@langfuse/otel";
import {
  type LangfuseGeneration,
  type LangfuseSpan,
  startActiveObservation,
  propagateAttributes,
  updateActiveObservation,
} from "@langfuse/tracing";
import { NodeSDK } from "@opentelemetry/sdk-node";
import type {
  ObservationAttributes,
  ObservationContent,
  ObservationGeneration,
  ObservationPrompt,
  Observability,
} from "packages/observability/src";
import { OBSERVATION_ATTRIBUTE_NAMES } from "packages/observability/src";

export type LangfuseObservabilityConfiguration = {
  publicKey?: string;
  secretKey?: string;
  baseUrl?: string;
  environment?: string;
};

let telemetrySdk: NodeSDK | null = null;
let langfuseSpanProcessor: LangfuseSpanProcessor | null = null;

export async function flushLangfuseObservability() {
  await langfuseSpanProcessor?.forceFlush();
}

export function createLangfuseObservability(
  configuration: LangfuseObservabilityConfiguration,
): Observability | null {
  if (
    !configuration.publicKey?.trim() ||
    !configuration.secretKey?.trim() ||
    !configuration.baseUrl?.trim()
  ) {
    return null;
  }

  try {
    if (!telemetrySdk) {
      langfuseSpanProcessor = new LangfuseSpanProcessor({
        publicKey: configuration.publicKey,
        secretKey: configuration.secretKey,
        baseUrl: configuration.baseUrl,
        environment: configuration.environment ?? "development",
      });
      telemetrySdk = new NodeSDK({
        spanProcessors: [langfuseSpanProcessor],
      });
      telemetrySdk.start();
    }
    return new LangfuseObservability();
  } catch {
    return null;
  }
}

class LangfuseObservability implements Observability {
  async observe<T>(
    name: string,
    attributes: ObservationAttributes,
    operation: () => Promise<T>,
  ): Promise<T> {
    let hasOperationStarted = false;
    let hasOperationCompleted = false;
    let operationResult: T | undefined;
    let operationError: unknown;
    try {
      const runOperation = async (
        observation: LangfuseGeneration | LangfuseSpan,
      ) => {
          hasOperationStarted = true;
          observation.update({ metadata: attributes });
          try {
            const result = await operation();
            operationResult = result;
            hasOperationCompleted = true;
            observation.update({ metadata: { ...attributes, result: "success" } });
            return result;
          } catch (error) {
            operationError = error;
            observation.update({
              level: "ERROR",
              statusMessage:
                error instanceof Error ? error.name : "unknown_error",
              metadata: { ...attributes, result: "failure" },
            });
            throw error;
          }
        };
      const start = () => isGenerationObservation(name)
        ? startActiveObservation(name, runOperation, { asType: "generation" })
        : startActiveObservation(name, runOperation);
      const sessionId = attributes[OBSERVATION_ATTRIBUTE_NAMES.sessionId];
      return typeof sessionId === "string"
        ? await propagateAttributes({ sessionId }, start) as T
        : await start() as T;
    } catch (error) {
      if (operationError !== undefined) throw operationError;
      if (hasOperationCompleted) return operationResult as T;
      if (!hasOperationStarted) return operation();
      throw error;
    }
  }

  record(attributes: ObservationAttributes) {
    try {
      updateActiveObservation({ metadata: attributes });
    } catch {
      // Telemetry is best effort.
    }
  }

  recordContent(content: ObservationContent) {
    try {
      updateActiveObservation(content);
    } catch {
      // Telemetry is best effort.
    }
  }

  recordPrompt(prompt: ObservationPrompt) {
    try {
      updateActiveObservation({ prompt }, { asType: "generation" });
    } catch {
      // Telemetry is best effort.
    }
  }

  recordGeneration(generation: ObservationGeneration) {
    try {
      updateActiveObservation({
        model: generation.model,
        usageDetails: {
          input: generation.inputTokens ?? 0,
          output: generation.outputTokens ?? 0,
          reasoning: generation.reasoningTokens ?? 0,
          cache_read: generation.cacheReadTokens ?? 0,
          cache_write: generation.cacheWriteTokens ?? 0,
        },
      }, { asType: "generation" });
    } catch {
      // Telemetry is best effort.
    }
  }
}

function isGenerationObservation(name: string) {
  return name.startsWith("thoughtform.provider.");
}
