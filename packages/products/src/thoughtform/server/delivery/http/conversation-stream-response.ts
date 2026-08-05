import type { ConversationStreamEvent } from "packages/products/src/thoughtform/shared";

export function conversationStreamResponse(
  events: AsyncIterable<ConversationStreamEvent>,
): Response {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    async start(controller) {
      try {
        for await (const event of events) {
          controller.enqueue(encoder.encode(
            `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`,
          ));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  }), {
    headers: {
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "content-type": "text/event-stream; charset=utf-8",
      "x-accel-buffering": "no",
    },
  });
}
