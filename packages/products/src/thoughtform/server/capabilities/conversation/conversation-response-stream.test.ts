import { describe, expect, it } from "vitest";
import { createJsonStringFieldDeltaDecoder } from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-response-stream";

describe("conversation response stream", () => {
  it("emits only decoded response-field text across arbitrary JSON chunks", () => {
    const decoder = createJsonStringFieldDeltaDecoder("response");
    const chunks = [
      '{"res',
      'ponse":"A grounded \\n',
      'reflection with \\"care\\"',
      '.","move":"probe"}',
    ];

    expect(chunks.map((chunk) => decoder.push(chunk)).join(""))
      .toBe('A grounded \nreflection with "care".');
  });
});
