# Fix ThoughtForm mobile workspace allocation

## Status

Completed on 2026-08-14.

## Goal

Keep the ThoughtForm conversation, workspace tabs, composer, and Send control
usable in short mobile portrait viewports without relying on page scrolling.

## Why this task is next

Production inspection found that the mobile workspace still allocates most of
its fixed viewport to the title and subtitle. At 320×568 the conversation
history is approximately 12px high, and mobile browser viewport behaviour can
make content below Send inconsistently reachable.

## Scope

- Visually remove the redundant editor title and subtitle on mobile while
  retaining the editor's accessible name.
- Render the subtitle guidance as a static, non-persisted introductory item at
  the start of mobile conversation history.
- Place a full-width mobile workspace-action row immediately below the
  temporary-workspace banner.
- Keep Clear workspace as a button on the left when available and Leave
  workspace as a stable link centred in the right half of the action row.
- Preserve tablet and desktop presentation.
- Make Send span the mobile composer width while retaining its intrinsic width
  on tablet and desktop.
- Pass the active mobile surface height through to the existing Draft editor so
  its flexible editing area fills the single-tab workspace as it does in the
  desktop split view.
- Make Save draft and Discuss selection fill two equal mobile columns, and make
  Prepare proposal fill the mobile Draft-panel width.
- Add browser coverage for ordinary and short mobile portrait viewports and a
  basic landscape containment safeguard.

## Out of scope

- Product-domain, API, AI-context, persistence, or Idea Map changes.
- A landscape-specific visual redesign.
- Changes to the tablet and desktop hierarchy.

## Expected files

- `packages/products/src/thoughtform/client/workspace/components/ConversationEditor.tsx`
- `packages/products/src/thoughtform/client/workspace/components/ConversationEditorIntro.tsx`
- `packages/products/src/thoughtform/client/workspace/components/DraftPanel.tsx`
- `packages/products/src/thoughtform/client/workspace/components/ConversationMessageList.tsx`
- `packages/products/src/thoughtform/client/workspace/components/ConversationMessageList.test.tsx`
- `packages/products/src/thoughtform/client/workspace/components/LeaveWorkspaceLink.tsx`
- `packages/products/src/thoughtform/testing/browser/thoughtform-presentation.spec.ts`
- `tasks/fix-thoughtform-mobile-workspace.md`
- `tasks/README.md`
- `progress.md`

## Definition of done

- Mobile title and subtitle no longer consume visible space above the workspace.
- Mobile conversation history begins with the guidance as presentation-only
  content that is absent from persisted messages and model context.
- The action row spans the mobile workspace width directly below the banner;
  Clear is left-aligned and Leave remains centred in the right half whether
  Clear exists or not.
- Conversation history retains useful positive height at 390×844 and 320×568.
- Workspace tabs and the complete Send control remain inside the viewport.
- Send spans the mobile composer width as a large touch target.
- The page itself does not acquire vertical scrolling.
- Existing desktop, enlarged-text, Draft, and conversation behaviour remains
  intact.
- An existing Draft's canonical editing area expands into the available mobile
  tab height rather than collapsing to its intrinsic content height.
- Draft actions provide full-width mobile touch targets without changing their
  tablet and desktop sizing.
- Relevant tests, full browser tests, full tests, typecheck, and build pass.
- Adam inspects the real mounted client before any commit.

## Validation commands

- `pnpm test:e2e --grep "mobile workspace"`
- `pnpm test:e2e`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

## Risks and implementation decisions

- The guidance is deliberately a responsive presentation item, not a synthetic
  assistant message, so it cannot alter conversation semantics or AI input.
- Mobile landscape receives containment coverage but is not the design target.
- The mobile breakpoint must not change tablet or desktop presentation.

## Approval record

- **Approved:** 2026-08-14.
- **Intentional boundaries:** mobile presentation and viewport allocation only;
  inspect live before commit.
- **Important deferrals:** no mobile-landscape redesign and no domain changes.
- **Implementation decisions:** use the existing mobile breakpoint; retain a
  screen-reader editor heading; keep guidance in the scrollable history but out
  of the message array; keep Clear as a button and Leave as a link; make Send
  full-width only on mobile; leave Idea map presentation unchanged and pass the
  mobile panel height through to the existing Draft editor.
- **Do not reopen:** the mobile title is redundant with the composer prompt, the
  guidance belongs inside the mobile conversation history, and the action row
  belongs directly below the banner at full width.

## Completion audit

- **Mobile title and guidance:** `ConversationEditorIntro` retains the accessible
  heading while hiding the visible title/subtitle below the tablet breakpoint;
  `ConversationMessageList` renders the same guidance as a presentation-only
  first mobile item. Its component test confirms the item is separate from the
  message array.
- **Workspace actions:** `ConversationEditor` gives the mobile action row the
  workspace width, keeps Clear in the left column, and centres Leave in the
  stable right column. Browser assertions verify its edges and alignment.
- **Conversation and composer allocation:** the responsive workspace grid keeps
  conversation history positive at 390x844, 320x568, and the landscape
  containment size; Send fills the mobile composer width and remains within the
  viewport.
- **Draft allocation and controls:** the single-tab workspace uses one flexible
  content row on mobile, allowing the existing Draft grid to share the complete
  height between the canonical editor, actions, and assistant proposal without
  panel overflow. Save draft and Discuss selection fill equal mobile columns;
  Prepare proposal fills the panel width. Browser assertions verify all edges,
  proposal visibility, and the absence of internal overflow.
- **Tablet and desktop preservation:** responsive overrides begin and end at the
  established breakpoints; the existing desktop split layout, intrinsic button
  widths, enlarged-text scenario, and Draft journey all pass.
- **Mounted verification:** Adam inspected the configured local client with an
  existing persistent conversation and approved the final presentation before
  publication.
- **Automated validation:** `pnpm test:e2e` passed 6/6 Chromium journeys;
  `pnpm test` passed 369 tests with 16 skipped; `pnpm typecheck` and `pnpm build`
  passed.
- **Complete branch-diff audit:** changes remain within the ThoughtForm-owned
  client presentation and browser-test boundaries plus task records. No host
  product behaviour, duplicated production/test implementation, product-domain
  contract, persistence, migration, prompt fallback, or unsupported
  documentation claim was introduced. All approved implementation decisions
  are settled.
