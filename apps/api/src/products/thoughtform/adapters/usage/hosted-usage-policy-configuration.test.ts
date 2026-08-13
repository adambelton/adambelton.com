import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOSTED_USAGE_POLICY,
  resolveHostedUsagePolicy,
} from "apps/api/src/products/thoughtform/adapters/usage/hosted-usage-policy-configuration";

describe("ThoughtForm hosted usage policy configuration", () => {
  it("uses agreed non-production defaults", () => {
    expect(resolveHostedUsagePolicy({ environment: "test", values: {} }))
      .toEqual(DEFAULT_HOSTED_USAGE_POLICY);
  });

  it("requires production values and rejects invalid values", () => {
    expect(() => resolveHostedUsagePolicy({ environment: "production", values: {} }))
      .toThrow("THOUGHTFORM_PERSONAL_DAILY_OPERATION_LIMIT is required");
    expect(() => resolveHostedUsagePolicy({
      environment: "test",
      values: { THOUGHTFORM_PERSONAL_DAILY_OPERATION_LIMIT: "0" },
    })).toThrow("must be a positive integer");
  });
});
