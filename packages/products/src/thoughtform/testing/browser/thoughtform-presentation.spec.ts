import { expect, test } from "@playwright/test";

test("keeps the temporary consent and workspace usable at a mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/thoughtform/editor");

  await expect(
    page.getByRole("heading", { name: "Before you begin" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI processing" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Temporary storage" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Use appropriate information" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("html").evaluate((element) => element.clientWidth),
  );

  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Open workspace" }).click();

  await expect(
    page.getByRole("heading", { name: "What would you like to think through?" }),
  ).toBeHidden();
  await expect(page.getByTestId("conversation-history").getByText(
    "Explore a question, experience, decision, or idea.",
    { exact: false },
  )).toBeVisible();
  await expect(page.getByRole("button", { name: "Conversation" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator("html")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("html").evaluate((element) => element.clientWidth),
  );

  await expectMobileWorkspace(page, false);
  await page.setViewportSize({ width: 320, height: 568 });
  await expectMobileWorkspace(page, false);
  await page.setViewportSize({ width: 667, height: 375 });
  await expectMobileWorkspace(page, false);
});

test("keeps restored conversation and controls inside the fixed-height workspace", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/products/thoughtform/editor");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Open workspace" }).click();
  await page.getByRole("textbox", { name: "What are you thinking?" }).fill(
    "I need to think through a difficult decision.",
  );
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("button", { name: "Clear workspace" }))
    .toBeVisible();
  await expect(page.getByRole("link", { name: "Leave workspace" })).toHaveAttribute(
    "href",
    "/products/thoughtform",
  );
  expect(await page.getByTestId("workspace-actions").evaluate((actions) => {
    const section = actions.closest("section");
    return section
      ? Math.abs(actions.getBoundingClientRect().right -
        section.getBoundingClientRect().right)
      : Number.POSITIVE_INFINITY;
  })).toBeLessThanOrEqual(1);

  await expectFixedWorkspace(page);

  await page.setViewportSize({ width: 1440, height: 700 });
  await page.evaluate(() => globalThis.dispatchEvent(new Event("resize")));
  await expectFixedWorkspace(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("html").evaluate((element) => {
    element.style.fontSize = "200%";
    globalThis.dispatchEvent(new Event("resize"));
  });
  await expectFixedWorkspace(page);

  await page.locator("html").evaluate((element) => {
    element.style.fontSize = "100%";
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => globalThis.dispatchEvent(new Event("resize")));
  await expectFixedWorkspace(page);
  await expectMobileWorkspace(page, true);
  await page.getByRole("button", { name: "Idea map" }).click();
  await expect(page.getByTestId("workspace-column")).toBeVisible();
  await page.getByRole("button", { name: "Draft" }).click();
  await expect(page.getByTestId("workspace-column")).toBeVisible();
  await page.getByRole("group", { name: "Ideas to include" })
    .getByRole("checkbox")
    .first()
    .check();
  await page.getByRole("button", { name: "Compose draft" }).click();
  const draftEditor = page.getByRole("textbox", { name: "Canonical draft" });
  await expect(draftEditor).toBeVisible();
  const draftLayout = await draftEditor.evaluate((editor) => {
    const panel = editor.closest<HTMLElement>('section[aria-labelledby="draft-title"]')!;
    const surface = panel.parentElement!;
    const workspaceColumn = surface.parentElement!;
    const proposal = panel.querySelector<HTMLElement>(
      'section[aria-labelledby="revision-proposal-title"]',
    )!;
    const buttons = [...panel.querySelectorAll<HTMLButtonElement>('button')];
    const save = buttons
      .find((button) => button.textContent?.includes("Save draft"))!;
    const discuss = buttons
      .find((button) => button.textContent?.includes("Discuss selection"))!;
    const prepare = buttons
      .find((button) => button.textContent?.includes("Prepare proposal"))!;
    return {
      discussRight: discuss.getBoundingClientRect().right,
      editorLeft: editor.getBoundingClientRect().left,
      editorRight: editor.getBoundingClientRect().right,
      editorHeight: editor.getBoundingClientRect().height,
      panelHeight: panel.getBoundingClientRect().height,
      prepareLeft: prepare.getBoundingClientRect().left,
      prepareRight: prepare.getBoundingClientRect().right,
      proposalBottom: proposal.getBoundingClientRect().bottom,
      saveLeft: save.getBoundingClientRect().left,
      surfaceHeight: surface.getBoundingClientRect().height,
      surfaceBottom: surface.getBoundingClientRect().bottom,
      surfaceClientHeight: surface.clientHeight,
      surfaceScrollHeight: surface.scrollHeight,
      workspaceColumnHeight: workspaceColumn.getBoundingClientRect().height,
    };
  });
  expect(Math.abs(draftLayout.panelHeight - draftLayout.surfaceHeight))
    .toBeLessThanOrEqual(1);
  expect(Math.abs(draftLayout.surfaceHeight - draftLayout.workspaceColumnHeight))
    .toBeLessThanOrEqual(1);
  expect(draftLayout.editorHeight).toBeGreaterThan(24);
  expect(Math.abs(draftLayout.saveLeft - draftLayout.editorLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(draftLayout.discussRight - draftLayout.editorRight)).toBeLessThanOrEqual(1);
  expect(Math.abs(draftLayout.prepareLeft - draftLayout.editorLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(draftLayout.prepareRight - draftLayout.editorRight)).toBeLessThanOrEqual(1);
  expect(draftLayout.proposalBottom).toBeLessThanOrEqual(draftLayout.surfaceBottom);
  expect(draftLayout.surfaceScrollHeight).toBe(draftLayout.surfaceClientHeight);
});

async function expectMobileWorkspace(
  page: import("@playwright/test").Page,
  expectsClear: boolean,
) {
  const layout = await page.getByTestId("workspace-actions").evaluate((actions) => {
    const section = actions.closest("section")!;
    const leave = actions.querySelector("a")!;
    const clear = actions.querySelector("button");
    const history = section.querySelector<HTMLElement>(
      '[data-testid="conversation-history"]',
    )!;
    const send = section.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const composer = send.closest("form")!;
    const tabs = section.querySelector<HTMLElement>(
      'nav[aria-label="Workspace views"]',
    )!;
    const actionsRect = actions.getBoundingClientRect();
    const actionsStyle = getComputedStyle(actions);
    const workspaceRect = section.querySelector<HTMLElement>(
      '[data-testid="workspace"]',
    )!.getBoundingClientRect();
    return {
      actionsLeft: actionsRect.left,
      actionsRight: actionsRect.right,
      workspaceLeft: workspaceRect.left,
      workspaceRight: workspaceRect.right,
      clearLeft: clear?.getBoundingClientRect().left ?? null,
      leaveCenter: leave.getBoundingClientRect().left +
        leave.getBoundingClientRect().width / 2,
      actionColumnGap: Number.parseFloat(actionsStyle.columnGap),
      historyHeight: history.getBoundingClientRect().height,
      composerLeft: composer.getBoundingClientRect().left,
      composerRight: composer.getBoundingClientRect().right,
      sendLeft: send.getBoundingClientRect().left,
      sendRight: send.getBoundingClientRect().right,
      sendBottom: send.getBoundingClientRect().bottom,
      tabsBottom: tabs.getBoundingClientRect().bottom,
      viewportBottom: globalThis.innerHeight,
      pageOverflow: document.documentElement.scrollHeight - globalThis.innerHeight,
    };
  });

  expect(Math.abs(layout.actionsLeft - layout.workspaceLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.actionsRight - layout.workspaceRight)).toBeLessThanOrEqual(1);
  const actionWidth = layout.actionsRight - layout.actionsLeft;
  const expectedLeaveCenter = layout.actionsLeft +
    (3 * actionWidth + layout.actionColumnGap) / 4;
  expect(Math.abs(layout.leaveCenter - expectedLeaveCenter)).toBeLessThanOrEqual(1);
  expect(layout.clearLeft === null).toBe(!expectsClear);
  if (layout.clearLeft !== null) {
    expect(Math.abs(layout.clearLeft - layout.workspaceLeft)).toBeLessThanOrEqual(1);
  }
  expect(layout.historyHeight).toBeGreaterThan(24);
  expect(Math.abs(layout.sendLeft - layout.composerLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.sendRight - layout.composerRight)).toBeLessThanOrEqual(1);
  expect(layout.tabsBottom).toBeLessThanOrEqual(layout.viewportBottom);
  expect(layout.sendBottom).toBeLessThanOrEqual(layout.viewportBottom);
  expect(layout.pageOverflow).toBe(0);
}

async function expectFixedWorkspace(
  page: import("@playwright/test").Page,
) {
  const readLayout = () => page.getByTestId("workspace").evaluate(
    (workspace) => {
      const history = workspace.querySelector<HTMLElement>(
        '[data-testid="conversation-history"]',
      );
      const column = workspace.querySelector<HTMLElement>(
        '[data-testid="conversation-column"]',
      );
      const send = column?.querySelector<HTMLButtonElement>('button[type="submit"]');
      const controls = workspace.querySelector<HTMLElement>(
        '[data-testid="conversation-controls"]',
      );
      if (!history || !column || !send || !controls) return null;

      const workspaceRect = workspace.getBoundingClientRect();
      const columnRect = column.getBoundingClientRect();
      const sendRect = send.getBoundingClientRect();
      return {
        historyHeight: history.getBoundingClientRect().height,
        historyOverflow: getComputedStyle(history).overflowY,
        sendBottom: sendRect.bottom,
        columnBottom: columnRect.bottom,
        workspaceHeight: workspaceRect.height,
        workspaceBottom: workspaceRect.bottom,
        viewportBottom: globalThis.innerHeight,
      };
    });

  await expect.poll(async () => (await readLayout())?.workspaceHeight ?? 0)
    .toBeGreaterThan(0);
  await expect.poll(async () => {
    const layout = await readLayout();
    return layout ? layout.workspaceBottom - layout.viewportBottom : Number.POSITIVE_INFINITY;
  }).toBeLessThanOrEqual(1);
  await expect.poll(async () => (await readLayout())?.historyHeight ?? 0)
    .toBeGreaterThan(0);
  await expect.poll(async () => (await readLayout())?.historyOverflow)
    .toBe("auto");
  await expect.poll(async () => {
    const layout = await readLayout();
    return layout ? layout.sendBottom - layout.columnBottom : Number.POSITIVE_INFINITY;
  }).toBeLessThanOrEqual(1);

  await expect(page.getByRole("list", { name: "Conversation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear workspace" }))
    .toBeVisible();
}
