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
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Conversation" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator("html")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("html").evaluate((element) => element.clientWidth),
  );
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
  await page.getByRole("button", { name: "Idea map" }).click();
  await expect(page.getByTestId("workspace-column")).toBeVisible();
  await page.getByRole("button", { name: "Draft" }).click();
  await expect(page.getByTestId("workspace-column")).toBeVisible();
});

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
