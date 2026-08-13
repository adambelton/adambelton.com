import { describe, expect, it } from "vitest";
import {
  measurementOperationId,
  measurementOperationPrefix,
  parseMeasurementOperationId,
} from "packages/db/src/adapters/thoughtform/usage-measurement-reader";

describe("ThoughtForm usage measurement ledger identity", () => {
  it("creates a scoped, content-free operation identity", () => {
    expect(measurementOperationPrefix("run-2026-08-13")).toBe("usage-measurement/run-2026-08-13/");
    expect(measurementOperationId({
      runId: "run-2026-08-13", scenarioId: "guided-vague-discovery", repetition: 2, sequence: 3,
    })).toBe("usage-measurement/run-2026-08-13/guided-vague-discovery/2/3");
  });

  it("allows the product's independent Idea Map attempt suffix", () => {
    const operationId = measurementOperationId({
      runId: "run-2026-08-13", scenarioId: "guided-vague-discovery", repetition: 2, sequence: 3,
    });
    expect(parseMeasurementOperationId("run-2026-08-13", `${operationId}:idea-map`))
      .toEqual({ scenarioId: "guided-vague-discovery", repetition: 2 });
    expect(parseMeasurementOperationId("another-run", operationId)).toBeNull();
  });

  it("rejects content-bearing or ambiguous identity parts", () => {
    expect(() => measurementOperationId({
      runId: "private thought", scenarioId: "guided-vague-discovery", repetition: 1, sequence: 1,
    })).toThrow("run ID");
    expect(() => measurementOperationId({
      runId: "run-1", scenarioId: "../../other", repetition: 1, sequence: 1,
    })).toThrow("scenario ID");
  });
});
