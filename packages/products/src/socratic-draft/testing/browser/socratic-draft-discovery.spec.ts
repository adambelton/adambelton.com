import { expect, test, type Locator, type Page } from "@playwright/test";

test("develops and negotiates a complete discovery conversation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await test.step("open the temporary discovery workspace", async () => {
    const reset = await page.request.post("/api/testing/reset");
    expect(reset.ok()).toBe(true);
    await page.goto("/products/socratic-draft/editor");
    await expect(page.getByRole("heading", { name: "Your writing and this demo" })).toBeVisible();
    await page.getByLabel("I understand how my writing will be processed and want to open the editor.").check();
    const restored = page.waitForResponse((response) => response.url().includes("/temporary-conversation/current"));
    await page.getByRole("button", { name: "Open the editor" }).click();
    await restored;
    await expect(page.getByText("This demo conversation is temporary.", { exact: false })).toBeVisible();
    await expect(page.getByRole("list", { name: "Conversation" })).toContainText("No messages yet.");
    await expect(page.getByRole("heading", { name: "Idea map" })).not.toBeVisible();
    const emptyLayout = await page.getByTestId("workspace").evaluate(
      (workspace) => {
        const conversationColumn = workspace.querySelector(
          '[data-testid="conversation-column"]',
        )!;
        const workspaceColumn = workspace.querySelector(
          '[data-testid="workspace-column"]',
        )!;
        const composer = conversationColumn.querySelector("form")!;
        const footer = document.querySelector("footer");
        return {
          viewportBottom: globalThis.innerHeight,
          pageContentBottom: footer?.getBoundingClientRect().bottom ?? globalThis.innerHeight,
          workspaceHeight: workspace.getBoundingClientRect().height,
          conversationHeight: conversationColumn.getBoundingClientRect().height,
          workspaceColumnHeight: workspaceColumn.getBoundingClientRect().height,
          workspaceBottom: workspace.getBoundingClientRect().bottom,
          composerBottom: composer.getBoundingClientRect().bottom,
        };
      },
    );
    expect(Math.abs(emptyLayout.pageContentBottom - emptyLayout.viewportBottom)).toBeLessThanOrEqual(1);
    expect(emptyLayout.workspaceHeight).toBeGreaterThan(320);
    expect(emptyLayout.conversationHeight).toBe(emptyLayout.workspaceHeight);
    expect(emptyLayout.workspaceColumnHeight).toBe(emptyLayout.workspaceHeight);
    expect(Math.abs(emptyLayout.composerBottom - emptyLayout.workspaceBottom)).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 1440, height: 700 });
    const compactLayout = await page.getByTestId("workspace").evaluate(
      (workspace) => {
        const conversationColumn = workspace.querySelector(
          '[data-testid="conversation-column"]',
        )!;
        const composer = conversationColumn.querySelector("form")!;
        return {
          workspaceHeight: workspace.getBoundingClientRect().height,
          workspaceBottom: workspace.getBoundingClientRect().bottom,
          conversationHeight: conversationColumn.getBoundingClientRect().height,
          composerBottom: composer.getBoundingClientRect().bottom,
        };
      },
    );
    expect(compactLayout.workspaceHeight).toBeGreaterThanOrEqual(320);
    expect(compactLayout.conversationHeight).toBe(compactLayout.workspaceHeight);
    expect(Math.abs(compactLayout.composerBottom - compactLayout.workspaceBottom)).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 390, height: 844 });
    const narrowWorkspace = page.getByTestId("workspace");
    await expect(page.getByTestId("conversation-column")).toBeVisible();
    expect(await page.getByTestId("conversation-column").evaluate(
      (column) => column.getBoundingClientRect().height,
    )).toBe(await narrowWorkspace.evaluate((workspace) => workspace.getBoundingClientRect().height));
    await page.getByRole("button", { name: "idea map" }).click();
    await expect(page.getByTestId("workspace-column")).toBeVisible();
    expect(await page.getByTestId("workspace-column").evaluate(
      (column) => column.getBoundingClientRect().height,
    )).toBe(await narrowWorkspace.evaluate((workspace) => workspace.getBoundingClientRect().height));
    await page.getByRole("button", { name: "conversation" }).click();
    await page.setViewportSize({ width: 1440, height: 1200 });
  });

  await test.step("identify the leadership problem", async () => {
    await send(page, "I condemn Gianni Infantino's leadership of FIFA, but I want to understand how football itself can save FIFA from him.");
    await expect(page.getByText("What has made that leadership feel intolerable to you?", { exact: false })).toBeVisible();
    const leadership = idea(page, "Leadership without accountability");
    await expect(leadership).toBeVisible();
    await openIdea(leadership);
    await expect(leadership.getByText("Infantino's leadership represents a FIFA that appears insulated from accountability.")).toBeVisible();
    await expect(leadership.getByText("Emerging. Appears to be central.")).toBeVisible();
    await expect(leadership.getByText("What conduct makes that leadership feel intolerable?")).toBeVisible();
  });

  await test.step("enrich the criticism without duplicating the idea", async () => {
    await send(page, "He presents every expansion of his power as service to the game, while meaningful scrutiny seems to recede further away.");
    const leadership = idea(page, "Leadership without accountability");
    await expect(
      page.locator("section[aria-labelledby='idea-map-title']")
        .getByText("Leadership without accountability", { exact: true }),
    ).toHaveCount(1);
    await expect(leadership.getByText("Infantino's FIFA presents concentrated power as service to football while resisting meaningful scrutiny.")).toBeVisible();
    await expect(leadership.getByText("Developing. Appears to be central.")).toBeVisible();
    await expect(leadership.getByText("Is the deepest objection concentrated power, hypocrisy, or the damage done to football's legitimacy?")).toBeVisible();
  });

  await test.step("separate football from its governing body", async () => {
    await send(page, "The damage to legitimacy matters most. FIFA acts as if it owns football, but the game belongs to everyone who plays and cares for it.");
    const football = idea(page, "Football is larger than FIFA");
    await openIdea(football);
    await expect(football.getByText("FIFA depends on a game whose meaning and legitimacy come from beyond its leadership.")).toBeVisible();
    await football.getByText("View substance").click();
    await expect(football.getByText("Football lives in players, supporters, clubs, local associations, shared memory, and play itself.", { exact: false })).toBeVisible();
    await expect(football.getByText("Emerging. Appears to be central.")).toBeVisible();
    await expect(page.locator("section[aria-labelledby='idea-map-title'] > div.grid > details")).toHaveCount(2);
  });

  await test.step("focus ideas and transfer focus visibly", async () => {
    const leadership = idea(page, "Leadership without accountability");
    const football = idea(page, "Football is larger than FIFA");
    await act(page, leadership, "Focus", "focused");
    await act(page, football, "Focus", "focused");
    await expect(summary(leadership)).toContainText("active");
    await expect(summary(football)).toContainText("focused");
  });

  await test.step("record the user's correction", async () => {
    const leadership = idea(page, "Leadership without accountability");
    await leadership.getByRole("button", { name: "Correct" }).click();
    const correction = "My objection is not ambition itself; it is power borrowing football's authority without answering to football's people.";
    await leadership.getByLabel("Your interpretation").fill(correction);
    const response = page.waitForResponse((candidate) => candidate.url().includes("/ideas/"));
    await leadership.getByRole("button", { name: "Save correction" }).click();
    await response;
    await expect(leadership.getByRole("heading", { name: "Your interpretation" })).toBeVisible();
    await expect(leadership.getByText(correction)).toBeVisible();
  });

  await test.step("develop supporter power and exercise parking", async () => {
    await send(page, "Supporters can refuse FIFA's claim to speak for our loyalty. We can organise, pressure sponsors and associations, and keep its conduct visible.");
    const supporters = idea(page, "Supporters can withdraw consent");
    await openIdea(supporters);
    await expect(supporters.getByText("Supporters can deny FIFA the passive consent on which its authority depends.")).toBeVisible();
    await expect(supporters.getByText("Emerging. Appears to be supporting.")).toBeVisible();
    await act(page, supporters, "Park", "parked");
    await act(page, supporters, "Reopen", "active");
  });

  await test.step("develop institutional reform and exercise satisfaction", async () => {
    await send(page, "Public pressure needs an institutional route. Member associations must coordinate, challenge the presidency, and demand transparent decisions and independent scrutiny.");
    const associations = idea(page, "Associations must reclaim governance");
    await openIdea(associations);
    await expect(associations.getByText("Football associations can convert public pressure into enforceable institutional reform.")).toBeVisible();
    await expect(associations.getByText("Emerging. Appears to be central.")).toBeVisible();
    await act(page, associations, "Satisfied for now", "satisfied");
    await act(page, associations, "Reopen", "active");
  });

  await test.step("exercise dismissal without losing the idea", async () => {
    const leadership = idea(page, "Leadership without accountability");
    await act(page, leadership, "Dismiss", "dismissed");
    await expect(leadership.getByText("My objection is not ambition itself;", { exact: false })).toBeVisible();
    await act(page, leadership, "Reopen", "active");
  });

  await test.step("resolve the central distinction through reflection", async () => {
    await send(page, "Yes. Accountability joins it together: football lends FIFA legitimacy, so football's communities and associations can make that legitimacy conditional.");
    const leadership = idea(page, "Leadership without accountability");
    const football = idea(page, "Football is larger than FIFA");
    await expect(leadership.getByText("Well explored. Appears to be central.")).toBeVisible();
    await expect(football.getByText("Because football creates FIFA's legitimacy, football also retains the power to remake it.")).toBeVisible();
    await expect(football.getByText("Well explored. Appears to be central.")).toBeVisible();
    await expect(leadership.getByRole("heading", { name: "Unresolved questions" })).not.toBeVisible();
    await expect(football.getByRole("heading", { name: "Unresolved questions" })).not.toBeVisible();
  });

  await test.step("complete the constructive argument", async () => {
    await send(page, "The destination is a FIFA whose leaders remain answerable to the game: organised supporters apply pressure and associations turn it into durable limits on power.");
    const supporters = idea(page, "Supporters can withdraw consent");
    const associations = idea(page, "Associations must reclaim governance");
    await expect(supporters.getByText("Supporters protect football by making consent conditional on accountable governance.")).toBeVisible();
    await expect(supporters.getByText("Well explored. Appears to be supporting.")).toBeVisible();
    await expect(associations.getByText("Collective association action can rebuild FIFA so accountability outlasts any president.")).toBeVisible();
    await expect(associations.getByText("Well explored. Appears to be central.")).toBeVisible();
    await expect(page.locator("section[aria-labelledby='idea-map-title'] > div.grid > details")).toHaveCount(4);

    const messages = page.getByRole("list", { name: "Conversation" }).getByRole("listitem");
    await expect(messages).toHaveCount(14);
    await expect(messages.first()).toContainText("I condemn Gianni Infantino's leadership");
    await expect(messages.last()).toContainText("the condemnation has a constructive destination");
  });

  await test.step("clear all visible conversation state", async () => {
    page.once("dialog", (dialog) => dialog.accept());
    const cleared = page.waitForResponse((response) => response.url().includes("/temporary-conversation/current") && response.request().method() === "DELETE");
    await page.getByRole("button", { name: "Clear this conversation" }).click();
    await cleared;
    await expect(page.getByRole("list", { name: "Conversation" })).toContainText("No messages yet.");
    await expect(page.getByRole("heading", { name: "Idea map" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Clear this conversation" })).not.toBeVisible();
    await expect(page.getByLabel("Your next thought")).toHaveValue("");
  });
});

async function send(page: Page, message: string) {
  const composer = page.getByLabel("Your next thought");
  await composer.fill(message);
  const response = page.waitForResponse((candidate) => candidate.url().endsWith("/conversation/respond") && candidate.request().method() === "POST");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("button", { name: "Sending..." })).toBeDisabled();
  await response;
  await expect(composer).toBeEnabled();
  await expect(composer).toHaveValue("");
}

function idea(page: Page, title: string) {
  return page.locator("section[aria-labelledby='idea-map-title'] details").filter({
    has: page.locator(":scope > summary", { hasText: title }),
  }).first();
}

function summary(ideaRow: Locator) {
  return ideaRow.locator(":scope > summary");
}

async function openIdea(ideaRow: Locator) {
  if (!(await ideaRow.getAttribute("open"))) await summary(ideaRow).click();
}

async function act(page: Page, ideaRow: Locator, action: string, disposition: string) {
  const response = page.waitForResponse((candidate) => candidate.url().includes("/ideas/") && candidate.request().method() === "POST");
  await ideaRow.getByRole("button", { name: action, exact: true }).click();
  await response;
  await expect(summary(ideaRow)).toContainText(disposition);
  await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Idea map updated." })).toBeVisible();
}
