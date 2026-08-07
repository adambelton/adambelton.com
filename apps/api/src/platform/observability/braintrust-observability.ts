import {
  NOOP_SPAN,
  currentSpan,
  initLogger,
  type Logger,
  type Span,
} from "braintrust";
import type {
  ObservationAttributes,
  ObservationContent,
  Observability,
} from "packages/observability/src";

export type BraintrustObservabilityConfiguration = {
  apiKey?: string;
  projectName?: string;
  environment?: string;
};

export function createBraintrustObservability(
  configuration: BraintrustObservabilityConfiguration,
): Observability | null {
  if (!configuration.apiKey?.trim() || !configuration.projectName?.trim()) {
    return null;
  }

  try {
    const logger = initLogger({
      apiKey: configuration.apiKey,
      projectName: configuration.projectName,
      environment: { name: configuration.environment ?? "development" },
      asyncFlush: true,
    });
    return new BraintrustObservability(logger);
  } catch {
    return null;
  }
}

class BraintrustObservability implements Observability {
  constructor(private readonly logger: Logger<true>) {}

  async observe<T>(
    name: string,
    attributes: ObservationAttributes,
    operation: () => Promise<T>,
  ): Promise<T> {
    const parent = currentSpan();
    const traced =
      parent === NOOP_SPAN
        ? this.logger.traced.bind(this.logger)
        : parent.traced.bind(parent);

    let hasOperationStarted = false;
    let hasOperationCompleted = false;
    let operationResult: T | undefined;
    let operationError: unknown;
    try {
      return await traced(
        async (span: Span) => {
          try {
            span.log({ metadata: attributes });
          } catch {
            // Telemetry is best effort.
          }
          hasOperationStarted = true;
          try {
            const result = await operation();
            operationResult = result;
            hasOperationCompleted = true;
            try {
              span.log({ metadata: { result: "success" } });
            } catch {
              // Telemetry is best effort.
            }
            return result;
          } catch (error) {
            operationError = error;
            try {
              span.log({
                error: {
                  name: error instanceof Error ? error.name : "unknown_error",
                },
                metadata: { result: "failure" },
              });
            } catch {
              // Telemetry is best effort.
            }
            throw error;
          }
        },
        { name },
      );
    } catch (error) {
      if (operationError !== undefined) throw operationError;
      if (hasOperationCompleted) return operationResult as T;
      if (!hasOperationStarted) return operation();
      throw error;
    }
  }

  record(attributes: ObservationAttributes) {
    const span = currentSpan();
    if (span !== NOOP_SPAN) {
      try {
        span.log({ metadata: attributes });
      } catch {
        // Telemetry is best effort.
      }
    }
  }

  recordContent(content: ObservationContent) {
    const span = currentSpan();
    if (span !== NOOP_SPAN) {
      try {
        span.log(content);
      } catch {
        // Telemetry is best effort.
      }
    }
  }
}
