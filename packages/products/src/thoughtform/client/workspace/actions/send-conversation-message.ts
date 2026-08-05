import type {
  ConversationCompletion,
  ConversationRequest,
  ConversationStreamEvent,
  IdeaMap,
} from "packages/products/src/thoughtform/shared";
import { CONVERSATION_STREAM_EVENT_TYPES } from "packages/products/src/thoughtform/shared";
import type { ApiResponse } from "packages/shared/src";

const temporaryEndpoint = "/api/products/thoughtform/conversation/respond-stream";

export class ConversationRequestError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "ConversationRequestError";
  }
}

export interface ConversationStreamResult extends ConversationCompletion {
  ideaMap?: IdeaMap;
  expiresAt?: string;
}

export interface ConversationStreamCallbacks {
  onAssistantDelta?(delta: string): void;
  onIdeaMap?(ideaMap: IdeaMap): void;
  onIdeaMapFailed?(message: string): void;
}

export async function sendConversationMessage(
  request: ConversationRequest,
  callbacks: ConversationStreamCallbacks = {},
  fetcher: typeof fetch = fetch,
): Promise<ConversationStreamResult> {
  return sendRequest(temporaryEndpoint, request, callbacks, fetcher, false);
}

export async function sendPersistentConversationMessage(
  request: ConversationRequest & { conversationId: string },
  callbacks: ConversationStreamCallbacks = {},
  fetcher: typeof fetch = fetch,
): Promise<ConversationStreamResult> {
  return sendRequest(
    `/api/products/thoughtform/conversations/${encodeURIComponent(request.conversationId)}/respond-stream`,
    request,
    callbacks,
    fetcher,
    true,
  );
}

async function sendRequest(
  endpoint: string,
  request: ConversationRequest,
  callbacks: ConversationStreamCallbacks,
  fetcher: typeof fetch,
  observeOwner: boolean,
): Promise<ConversationStreamResult> {
  const observationId = observeOwner ? globalThis.crypto.randomUUID() : null;
  const startedAt = globalThis.performance.now();
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(observationId ? { "x-thoughtform-observation-id": observationId } : {}),
    },
    body: JSON.stringify(request),
  });
  if (!response.ok || !response.body) {
    const body = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    throw new ConversationRequestError(
      body && !body.ok ? body.error.code : "conversation_request_failed",
      body && !body.ok ? body.error.message : "Conversation request failed.",
    );
  }

  return new Promise<ConversationStreamResult>((resolve, reject) => {
    let responseSettled = false;
    let firstDeltaObserved = false;
    void (async () => {
      try {
        for await (const event of parseConversationEvents(response.body!)) {
          if (event.type === CONVERSATION_STREAM_EVENT_TYPES.assistantDelta) {
            callbacks.onAssistantDelta?.(event.delta);
            if (observationId && !firstDeltaObserved) {
              firstDeltaObserved = true;
              recordClientObservation(fetcher, {
                observationId,
                operation: "conversation_first_token",
                durationMs: Math.round(globalThis.performance.now() - startedAt),
                succeeded: true,
              });
            }
          } else if (event.type === CONVERSATION_STREAM_EVENT_TYPES.assistantCompleted) {
            responseSettled = true;
            if (observationId) {
              recordClientObservation(fetcher, {
                observationId,
                operation: "conversation_response",
                durationMs: Math.round(globalThis.performance.now() - startedAt),
                succeeded: true,
              });
            }
            resolve({
              ...event.response,
              ...(event.expiresAt ? { expiresAt: event.expiresAt } : {}),
            });
          } else if (event.type === CONVERSATION_STREAM_EVENT_TYPES.ideaMapCompleted) {
            callbacks.onIdeaMap?.(event.ideaMap);
          } else if (event.type === CONVERSATION_STREAM_EVENT_TYPES.ideaMapFailed) {
            callbacks.onIdeaMapFailed?.(event.message);
          } else if (
            event.type === CONVERSATION_STREAM_EVENT_TYPES.failed &&
            !responseSettled
          ) {
            reject(new ConversationRequestError(event.code, event.message));
            return;
          }
        }
        if (!responseSettled) {
          reject(new ConversationRequestError(
            "conversation_request_failed",
            "The conversation stream ended before the response was retained.",
          ));
        }
      } catch (error) {
        if (!responseSettled) reject(error);
      }
    })();
  });
}

async function* parseConversationEvents(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<ConversationStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = frame.split("\n")
        .find((line) => line.startsWith("data: "))
        ?.slice(6);
      if (data) yield JSON.parse(data) as ConversationStreamEvent;
      boundary = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
}

function recordClientObservation(
  fetcher: typeof fetch,
  input: {
    observationId: string;
    operation: "conversation_first_token" | "conversation_response";
    durationMs: number;
    succeeded: boolean;
  },
) {
  try {
    void Promise.resolve(fetcher("/api/products/thoughtform/owner-observations/client", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    })).catch(() => undefined);
  } catch {
    // Observation delivery is best-effort and must not affect the conversation.
  }
}
