import { describe, expect, it } from "vitest";
import { createBraintrustObservability } from "apps/api/src/platform/observability/braintrust-observability";

describe("Braintrust observability configuration", () => {
  it("is disabled unless both credentials and a project are explicit", () => {
    expect(createBraintrustObservability({})).toBeNull();
    expect(createBraintrustObservability({ apiKey: "key" })).toBeNull();
    expect(createBraintrustObservability({ projectName: "project" })).toBeNull();
  });
});
