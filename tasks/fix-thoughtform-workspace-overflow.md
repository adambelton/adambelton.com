# Fix ThoughtForm workspace overflow

## Status

Completed on 2026-08-13.

## Goal

Keep the ThoughtForm conversation and controls visible within a fixed-height
workspace at ordinary desktop sizes, short laptop viewports, narrow screens,
and substantially enlarged text sizes.

## Why this task is next

The production workspace can collapse the conversation history to zero height
and clip the Send button because its fixed viewport-derived height does not
account for the rendered height of the conversation controls. This is a
production accessibility and primary-flow failure.

## Scope

- Preserve a fixed-height application workspace.
- Replace the normal website shell with a focused editor shell on temporary and
  owner editor routes: no global header, footer, or breadcrumbs.
- Place compact Leave workspace and available Clear workspace actions at the
  top right of the editor.
- Centralise primary and secondary workspace button interaction styling in a
  product-owned component and use it for the main conversation and Draft
  actions.
- Restore uniform spacing between the global navigation links by removing the
  one-off margin around Log in and Log out.
- Reclaim excessive reserved space between the workspace and footer when
  calculating the available height.
- Make more compact use of the conversation controls so the history retains a
  useful share of the workspace.
- Keep conversation history as the internal scrolling surface rather than
  adding page-level scrolling to the workspace.
- Use the dedicated shell's `100dvh` grid directly rather than calculating
  workspace height in JavaScript.
- Cover restored conversations, compact laptop dimensions, narrow screens, and
  enlarged text with browser regression tests.
- Verify the corrected layout through the real client host as well as the
  product browser host.

## Out of scope

- Visual redesign.
- API, authentication, persistence, hosted-AI, or product-domain changes.
- Changes to desktop workspace behaviour beyond the responsive safeguards
  needed to keep content reachable.

## Expected files

- `apps/client/src/bootstrap/App.tsx`
- `apps/client/src/ui/layout/SiteHeader.tsx`
- `apps/client/src/ui/layout/SiteHeader.test.tsx`
- `apps/client/src/products/ProductRoutePage.tsx`
- `packages/products/src/thoughtform/client/workspace/components/ConversationEditor.tsx`
- `packages/products/src/thoughtform/client/workspace/components/ConversationComposer.tsx`
- `packages/products/src/thoughtform/client/workspace/components/WorkspaceButton.tsx`
- `packages/products/src/thoughtform/testing/browser/thoughtform-presentation.spec.ts`
- `tasks/fix-thoughtform-workspace-overflow.md`
- `tasks/README.md`
- `progress.md`

## Definition of done

- The workspace remains fixed-height and does not introduce page-level vertical
  scrolling at ordinary desktop dimensions.
- Global header, footer, and breadcrumbs are absent on editor routes.
- Leave workspace and available Clear workspace actions appear at the top right.
- Clear workspace precedes Leave workspace so the stable Leave position does
  not shift, and Leave includes an exit icon.
- Conversation history retains a positive usable height in every covered layout
  and scrolls internally.
- Existing messages are visible and reachable.
- The complete Send button and restored-workspace Clear control remain visible
  inside the workspace.
- No workspace content is trapped by an unscrollable clipping container.
- Conversation, Idea Map, and Draft mobile surfaces remain usable.
- The existing desktop two-column layout remains bounded when space permits.
- Relevant browser tests, the full test suite, typecheck, and build pass.
- The real mounted client host is inspected at ordinary desktop, compact
  laptop, narrow mobile, and enlarged-text layouts.

## Validation commands

- `pnpm test:e2e --grep "workspace remains reachable"`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

## Risks and implementation decisions

- The fixed-height constraint requires compact controls and careful allocation
  between history and composition. At extreme text enlargement, the fixed
  workspace may need to exceed the remaining viewport and participate in
  standards-compliant document scrolling rather than clip either region.
- Enlarged text must remain usable without allowing either grid row to collapse
  or clipping the Send control.

## Approval record

- **Approved:** 2026-08-13.
- **Intentional boundaries:** targeted production layout hotfix and regression
  coverage; no redesign or server-side changes.
- **Important deferrals:** broader visual changes and unrelated accessibility
  improvements remain separate tasks.
- **Implementation decisions left open:** exact reclaimed footer spacing,
  composer density, and minimum conversation allocation may be settled during
  implementation from rendered evidence.
- **Do not reopen:** this is not mobile-only; normal desktops, short laptop
  viewports, restored workspaces, and enlarged text are required coverage, and
  the workspace must remain fixed-height and its conversation history is the
  intended scrolling surface.
- **Additional adjustment approved:** 2026-08-13. Log in and Log out use the
  same navigation gap as the other global links; authentication behaviour and
  the remaining header presentation stay unchanged.

## Completion audit

- Fixed-height workspace: the mounted client uses a dedicated `100dvh` editor
  shell with no document scrolling; Playwright verified ordinary, 700px-high,
  200%-text, and 390px-wide viewports.
- Focused editor shell: mounted editor routes omit the site header, footer, and
  breadcrumbs while public and non-editor routes retain them.
- Workspace actions: Clear precedes Leave at the top right; Clear is a button
  with a trash icon and Leave is a link with an exit icon.
- Reachability: conversation history has positive height and internal overflow;
  restored messages, Send, Clear, Idea Map, and Draft remain reachable in all
  covered layouts.
- Space allocation: viewport-capped shell gaps, notification spacing, heading
  treatment, and composer dimensions preserve conversation space at 200% text
  without reducing the text size itself.
- Control consistency: product-owned primary and secondary button variants
  provide button affordance, hover feedback, and pointer/disabled cursors;
  navigation remains link-styled and view selectors remain tabs.
- Header spacing: Log in and Log out now participate directly in the shared
  navigation gap with no one-off margin.
- Automated validation: `pnpm test` passed 368 tests (16 skipped), `pnpm
  typecheck` passed, `pnpm build` passed, and `pnpm test:e2e` passed all six
  Chromium scenarios.
- Browser inspection: the real mounted client was inspected live at the user's
  active desktop viewport; Adam approved the resulting presentation. Automated
  responsive inspection is not represented as human assistive-technology
  verification.
- Branch audit: the complete diff keeps product presentation in the ThoughtForm
  client boundary, host shell composition in `apps/client`, and browser support
  with the product; it adds no persistence, AI, auth, migration, or duplicated
  product-behaviour implementation.
