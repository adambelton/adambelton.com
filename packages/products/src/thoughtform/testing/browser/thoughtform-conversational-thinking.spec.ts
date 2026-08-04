import { expect, test, type Page } from "@playwright/test";

test("supports varied conversational thinking without requiring a Draft", async ({ page }) => {
  await page.request.post("/api/testing/conversational-thinking");
  await page.goto("/products/thoughtform/editor");
  await page.getByLabel("I understand how my messages will be processed and want to open the editor.").check();
  await page.getByRole("button", { name: "Open the editor" }).click();

  await expect(page.getByRole("heading", { name: "What would you like to think through?" })).toBeVisible();
  await send(page, "A long friendship ended, and I felt relief because I had stopped feeling safe enough to be honest.");
  await expect(page.getByText("no longer performing a closeness", { exact: false })).toBeVisible();

  await send(page, "I accepted a new role. I am proud, but I resent what it will take from my life, and I am not ready to reconcile that.");
  await expect(page.getByText("neither has to cancel the other", { exact: false })).toBeVisible();

  await send(page, "I have two job offers: one gives me autonomy and the other gives me security.");
  await expect(page.getByText("autonomy versus security", { exact: false })).toBeVisible();

  await send(page, "I think convenience hides who bears a cost, although convenience itself is not bad.");
  await expect(page.getByText("costs made invisible", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Draft", exact: true }).click();
  await expect(page.getByLabel("Canonical draft")).not.toBeVisible();
  await page.getByRole("button", { name: "Idea map", exact: true }).click();

  await send(page, "I want to leave, and I feel guilty. Help me articulate this now without resolving it.");
  await expect(page.getByText("already enough to articulate", { exact: false })).toBeVisible();

  await send(page, "No, it is not more control that I want. Nobody will name the trade-off we deliberately chose.");
  await expect(page.getByText("control is not the issue", { exact: false })).toBeVisible();
  const correctedIdea = page.locator("section[aria-labelledby='idea-map-title'] details")
    .filter({ hasText: "The unnamed trade-off" })
    .first();
  await correctedIdea.locator(":scope > summary").click();
  await expect(page.getByText("I am frustrated that nobody will name the trade-off", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Draft", exact: true }).click();
  await page.getByLabel("Wanting to leave").check();
  await page.getByLabel("What should this expression preserve?").fill("Keep the guilt and uncertainty unresolved.");
  await page.getByRole("button", { name: "Accept offer and compose" }).click();
  await expect(page.getByLabel("Canonical draft")).toHaveValue(/I want to leave, and I feel guilty/);
  await expect(page.getByLabel("Canonical draft")).toHaveValue(/do not need to resolve it/);
});

async function send(page: Page, message: string) {
  const composer = page.getByLabel("What are you thinking?");
  await composer.fill(message);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(composer).toBeEnabled();
}
