import { expect, test } from "@playwright/test";

test("composes, revises, reviews, restores, and clears a private draft", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.request.post("/api/testing/reset");
  await page.request.post("/api/testing/draft-workspace");
  await page.goto("/products/thoughtform/editor");
  await page.getByLabel("I understand how my messages will be processed and want to open the editor.").check();
  await page.getByRole("button", { name: "Open the editor" }).click();
  await expect(page.getByText("Accountability is the central argument.")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Workspace views" })).toBeHidden();
  await expect(page.getByRole("group", { name: "Workspace" })).toBeVisible();
  const workspaceColumns = await page.locator(".lg\\:grid-cols-2").evaluate(
    (element) => globalThis.getComputedStyle(element).gridTemplateColumns,
  );
  expect(workspaceColumns.split(" ")).toHaveLength(2);
  const workspaceLayout = await page.getByTestId("conversation-history").evaluate(
    (history) => {
      const column = history.parentElement!;
      const workspace = column.parentElement!;
      const composer = column.querySelector("form")!;
      const messages = history.querySelector("ol")!;
      const workspaceRect = workspace.getBoundingClientRect();
      const columnRect = column.getBoundingClientRect();
      const historyRect = history.getBoundingClientRect();
      return {
        workspaceBottom: workspaceRect.bottom,
        viewportHeight: globalThis.innerHeight,
        columnBottom: columnRect.bottom,
        composerBottom: composer.getBoundingClientRect().bottom,
        historyOverflow: globalThis.getComputedStyle(history).overflowY,
        messagesBottom: messages.getBoundingClientRect().bottom,
        historyBottom: historyRect.bottom,
      };
    },
  );
  expect(workspaceLayout.workspaceBottom).toBeLessThanOrEqual(workspaceLayout.viewportHeight);
  expect(workspaceLayout.historyOverflow).toBe("auto");
  expect(Math.abs(workspaceLayout.columnBottom - workspaceLayout.composerBottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(workspaceLayout.historyBottom - workspaceLayout.messagesBottom)).toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "Draft", exact: true }).click();
  await expect(page.getByLabel("Optional format guidance")).not.toBeVisible();
  await expect(page.getByLabel("Canonical draft")).not.toBeVisible();
  await page.getByLabel("Accountability gives legitimacy").check();
  await page.getByLabel("What should this expression preserve?").fill("Compose an intentionally early draft.");
  await page.getByRole("button", { name: "Compose draft" }).click();
  const editor = page.getByLabel("Canonical draft");
  await expect(editor).toHaveValue(/Football gives its institutions legitimacy/);
  await expect(page.getByText("Revision 1")).toBeVisible();
  const draftLayout = await editor.evaluate((draftEditor) => {
    const draft = draftEditor.closest("section")!;
    const workspaceSurface = draft.parentElement!;
    return {
      draftBottom: draft.getBoundingClientRect().bottom,
      surfaceBottom: workspaceSurface.getBoundingClientRect().bottom,
      editorHeight: draftEditor.getBoundingClientRect().height,
      availableHeight: draft.getBoundingClientRect().height,
      editorOverflow: globalThis.getComputedStyle(draftEditor).overflowY,
    };
  });
  expect(Math.abs(draftLayout.draftBottom - draftLayout.surfaceBottom)).toBeLessThanOrEqual(1);
  expect(draftLayout.editorHeight).toBeGreaterThan(draftLayout.availableHeight / 2);
  expect(draftLayout.editorOverflow).toBe("auto");

  await editor.fill("Football grants legitimacy, and accountability must follow.");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Revision 2")).toBeVisible();
  await expect(page.getByText("It sounds as though this edit changes what matters to you. Is that right?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Discuss this edit" })).not.toBeVisible();
  await page.getByRole("button", { name: "Draft", exact: true }).click();

  await page.getByRole("button", { name: "History" }).click();
  await page.getByRole("button", { name: /Revision 1/ }).click();
  await expect(page.getByLabel("Preview revision 1")).toContainText("Football gives its institutions legitimacy");
  await page.getByRole("button", { name: "Restore this version" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: "Revision 3" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "History" })).toBeFocused();

  await page.getByPlaceholder("Describe the change you want to review.").fill("End with a direct demand for accountability.");
  await page.getByRole("button", { name: "Prepare proposal" }).click();
  await expect(page.getByRole("heading", { name: "Current content" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proposed content" })).toBeVisible();
  await page.getByRole("button", { name: "Accept proposal" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: "Revision 4" })).toBeVisible();
  await expect(editor).toHaveValue(/End with a direct demand for accountability/);

  await editor.evaluate((element: HTMLTextAreaElement) => {
    element.focus();
    element.setSelectionRange(0, 8);
  });
  await page.getByPlaceholder("Describe the change you want to review.").fill("Use firmer language in this passage.");
  await page.getByRole("button", { name: "Prepare proposal" }).click();
  await expect(page.getByRole("heading", { name: "Current content" })).toBeVisible();
  await expect(page.getByText("Football", { exact: true })).toBeVisible();
  await page.getByLabel("Request an amendment").fill("Keep the passage concise.");
  await page.getByRole("button", { name: "Amend proposal" }).click();
  await expect(page.getByText("Keep the passage concise.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(editor).not.toHaveValue(/Keep the passage concise/);

  await editor.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(0, 0));
  await page.getByPlaceholder("Describe the change you want to review.").fill("Prepare a whole-draft alternative.");
  await page.getByRole("button", { name: "Prepare proposal" }).click();
  await expect(page.getByRole("heading", { name: "Current content" })).toBeVisible();
  await editor.fill("Newer canonical writing that must be preserved.");
  await expect(page.getByRole("button", { name: "Save draft" })).toBeEnabled();
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByRole("button", { name: "Accept proposal" }).click();
  await expect(page.getByRole("heading", { name: "This proposal is stale" })).toBeVisible();
  await expect(editor).toHaveValue("Newer canonical writing that must be preserved.");
  await page.getByRole("button", { name: "Dismiss stale proposal" }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileNavigation = page.getByRole("navigation", { name: "Workspace views" });
  await mobileNavigation.getByRole("button", { name: "draft", exact: true }).click();
  await expect(mobileNavigation.getByRole("button", { name: "draft", exact: true })).toHaveAttribute("aria-current", "page");
  await editor.selectText();
  await page.getByRole("button", { name: "Discuss selection" }).click();
  await expect(mobileNavigation.getByRole("button", { name: "conversation", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByLabel("Attached draft passage")).toContainText("Newer canonical writing");
  await mobileNavigation.getByRole("button", { name: "draft", exact: true }).click();
  await mobileNavigation.getByRole("button", { name: "conversation", exact: true }).click();
  await expect(page.getByLabel("Attached draft passage")).toContainText("Newer canonical writing");
  await page.getByLabel("What are you thinking?").fill("What should I examine here?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("What feels most important to examine in that passage?")).toBeVisible();
  await expect(page.getByLabel("Attached draft passage")).not.toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear this conversation" }).click();
  await expect(page.getByRole("list", { name: "Conversation" })).toContainText("No messages yet.");
  await mobileNavigation.getByRole("button", { name: "draft", exact: true }).click();
  await expect(page.getByText("A Draft is optional.", { exact: false })).toBeVisible();
});
