import { defineConfig, devices } from "@playwright/test";

const apiUrl = "http://127.0.0.1:8788";
const clientUrl = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "packages/products/src/socratic-draft/testing",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: clientUrl,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @adambelton/products e2e:api",
      url: `${apiUrl}/products/socratic-draft/temporary-conversation/current`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "pnpm --filter @adambelton/products e2e:client",
      env: { API_BASE_URL: apiUrl },
      url: clientUrl,
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
