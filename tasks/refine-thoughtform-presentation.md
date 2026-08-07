# Refine ThoughtForm presentation and workspace hierarchy

## Status

Completed on 2026-08-07.

## Goal

Improve how ThoughtForm is explained and presented across the Products page,
product overview, consent screen, and active workspace while preventing
vertical overflow from shifting centred page content horizontally.

## Why this task is next

ThoughtForm is approaching public beta, but the public pages currently place
the detailed explanation on the product index and leave the product overview
too sparse. The consent and workspace screens also use public-page display
typography where a compact application hierarchy would make the working area
clearer and more usable.

## Scope

- Make the Products-page entry concise and scannable, including its current
  development stage.
- Expand the ThoughtForm overview to explain its value, useful situations,
  conversation–Idea Map–Draft workflow, user authorship, and current state.
- Present development progress as a curated product and engineering signal,
  not a raw backlog.
- Align the product overview with the established public-page hierarchy.
- Turn temporary-workspace consent into a compact, differentiated “Before you
  begin” checkpoint while retaining every material fact before acknowledgement.
- Remove owner-only context from temporary-user disclosure and foreground the
  provider active for the current session.
- Use application-oriented typography and spacing in the active workspace and
  make its temporary lifetime concise and noticeable.
- Give active workspace routes compact shell spacing without changing the
  established public-page rhythm.
- Prevent scrollbar state from shifting centred page content while retaining
  native, accessible scrolling behaviour.
- Align About and writing-post paragraphs with the established regular-copy
  measure, size, line-height, and colour.
- Remove stale owner-only framing from the shared sign-in page and align its
  typography with the other public pages.
- Redirect authenticated visitors away from the sign-in form to the product
  catalogue.
- Verify desktop and mobile presentation through the mounted development host.

## Out of scope

- ThoughtForm domain behaviour or new capabilities.
- Retention, privacy policy, access control, or beta-gate changes.
- Broad redesign of unrelated pages or a custom JavaScript scrollbar.
- Overriding the user's operating-system scrollbar visibility preference.
- Publishing internal task history or a detailed development changelog.

## Expected files

- `packages/products/src/registry.ts`
- `apps/client/src/products/ProductsPage.tsx`
- `apps/client/src/styles.css`
- About-page and rendered-Markdown presentation under `apps/client/src/website`
- ThoughtForm overview, temporary-workspace, disclosure, and workspace UI
- Associated component and browser tests
- `tasks/README.md` and `progress.md`

No new architectural role is expected.

## Definition of done

- ThoughtForm is concise on Products and meaningfully explained on its overview.
- Development information provides honest portfolio signal without a raw backlog.
- Public typography follows the existing website hierarchy.
- Consent facts are differentiated, compact, and available before consent.
- The workspace prioritises working space and makes its temporary state clear.
- Short and overflowing pages remain horizontally stable.
- Desktop and mobile flows remain accessible and functional.
- Existing ThoughtForm behaviour is unchanged.
- Relevant tests, typecheck, build, and mounted-host verification pass.

## Validation commands

- Targeted Vitest component tests
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Relevant ThoughtForm Playwright scenarios
- Mounted-host desktop and mobile browser inspection, including keyboard focus
  and short/overflowing-page horizontal stability

## Risks and implementation decisions

- Public development copy must remain accurate as beta preparation progresses.
- Progressive disclosure must not conceal facts necessary for informed consent.
- Native scrollbar visibility is partly controlled by the browser and operating
  system; the task guarantees layout stability rather than replacing scrolling.
- Exact copy, section names, and visual treatment may be settled during
  implementation within the approved hierarchy.

## Approval record

- **Approved:** 2026-08-07.
- **Intentional boundaries:** one cosmetic and content pass across the product
  index, overview, consent, workspace, and scrollbar stability; no product
  behaviour, retention, access, or privacy-policy changes.
- **Important deferrals:** broader redesign, custom scrollbars, and new product
  capabilities remain outside this task.
- **Implementation decisions left open:** exact copy, section names, disclosure
  styling, application heading scale, and standards-based scrollbar treatment.
- **Do not reopen:** conversation remains primary; Idea Map and optional Draft
  remain distinct; consent stays explicit; material facts remain available;
  native scrollbar visibility preferences remain user-controlled.
