import { describe, expect, it } from "vitest";
import {
  createJsonStringFieldDeltaDecoder,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-response-stream";
import { decodeConversationText } from "packages/products/src/thoughtform/shared";

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

  it("decodes Unicode escapes split across provider chunks", () => {
    const decoder = createJsonStringFieldDeltaDecoder("response");
    const chunks = [
      '{"response":"Concrete material \\u20',
      '14 what recently changed?"}',
    ];

    expect(chunks.map((chunk) => decoder.push(chunk)).join(""))
      .toBe("Concrete material — what recently changed?");
  });

  it("decodes a doubly escaped Unicode sequence without exposing JSON syntax", () => {
    const decoder = createJsonStringFieldDeltaDecoder("response");
    const chunks = [
      '{"response":"Concrete material \\\\u2',
      '014 what recently changed?"}',
    ];

    expect(chunks.map((chunk) => decoder.push(chunk)).join(""))
      .toBe("Concrete material — what recently changed?");
    expect(decodeConversationText("Concrete material \\u2014 what changed"))
      .toBe("Concrete material — what changed");
  });
});
