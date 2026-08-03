import { describe, expect, it } from "vitest";
import {
  acknowledgePrivacy,
  hasAcknowledgedPrivacy,
} from "packages/products/src/socratic-draft/client/workspace/actions/privacy-acknowledgement";

describe("Socratic Draft privacy acknowledgement state", () => {
  it("records acknowledgement only after the affirmative action", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(hasAcknowledgedPrivacy(storage)).toBe(false);
    acknowledgePrivacy(storage);
    expect(hasAcknowledgedPrivacy(storage)).toBe(true);
  });
});
