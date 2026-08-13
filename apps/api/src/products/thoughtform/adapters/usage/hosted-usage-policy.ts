import { resolveHostedUsagePolicy } from "apps/api/src/products/thoughtform/adapters/usage/hosted-usage-policy-configuration";

export const hostedUsagePolicy = resolveHostedUsagePolicy({
  environment: process.env.NODE_ENV === "production" ? "production" :
    process.env.NODE_ENV === "test" ? "test" : "development",
  values: process.env,
});
