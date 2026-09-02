# Make article links explicit

## Goal

Make authored Markdown links visibly recognizable and ensure the article's final
capability-profile link navigates to the About page.

## Why this task is next

Mounted review showed that Tailwind's base reset removes the browser's default
anchor underline, leaving the terminal article link visually ambiguous.

## Scope

- Give all rendered Markdown anchors the website's explicit foreground,
  line-coloured underline, offset, transition, and hover treatment.
- Bold the article's terminal capability-profile link and point it to `/about`.
- Add focused coverage for the terminal link markup.

## Out of scope

- Other global anchor, article, capability-profile, or About-page styling.
- Copy, metadata, image, layout, syndication, publication, commit, or push
  changes.

## Expected files to create or modify

- `apps/client/src/content/posts/engineering-capability-profile-beyond-the-cv.md`
- `apps/client/src/styles.css`
- `apps/client/src/website/pages/WritingPages.test.tsx`
- `progress.md`
- this task record

## Definition of done

- Authored Markdown links are explicitly underlined and retain a clear focus
  treatment.
- The final article link is bold, underlined, and points to the About page.
- Focused tests, sequential build, DEV dry run, and diff checks pass.
- The running client hot-reloads the result for mounted review.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/pages/AboutPage.test.tsx apps/client/src/website/pages/WritingPages.test.tsx
pnpm build
pnpm syndicate:dev-to --dry-run
git diff --check
```

## Risks / questions

- The explicit Markdown-anchor rule affects all authored pages and posts, but
  aligns them with the site's existing visible-link convention rather than
  introducing a one-off article exception.

## Approval record

Approved by Adam on 2 September 2026.

- **Intentional boundaries:** apply the explicit treatment only inside rendered
  Markdown.
- **Important deferrals:** all other link, article, About-page, and capability-
  profile design changes.
- **Implementation decisions:** use the existing foreground/line underline
  visual language, retain focus-visible behaviour from the global anchor rule,
  and add bold semantic emphasis to the final call to action.
- **Do not reopen without new evidence:** the link text remains unchanged.

### Link-destination simplification approval record

Approved by Adam on 2 September 2026.

- **Scope:** replace `/about#capability-profile` with `/about`, remove the
  unnecessary fragment target and its test expectation, and add no hash-scroll
  behavior.
- **Intentional boundary:** retain the explicit Markdown-link treatment and bold
  terminal call to action.

## Status

Complete on `codex/publish-engineering-capability-profile`; not committed,
pushed, published, or syndicated live.

## Completion audit

- **Explicit Markdown links:** `.markdown-content a` now uses foreground colour,
  a one-pixel line-coloured underline with offset, a colour transition, and
  underline removal on hover. The existing global focus-visible outline remains
  applicable.
- **Terminal call to action:** the final article line retains its exact text,
  points directly to `/about`, and renders as semantic strong text around the
  anchor. Focused Writing-page coverage verifies the generated markup.
- **Validation:** the final full repository run passed 416 tests with 16
  intentionally skipped, repository typecheck, the sequential production build,
  the four-post DEV dry run, and `git diff --check`. The running client
  hot-reloaded the article and CSS.
- **Branch audit:** the complete working-tree diff contains only the approved
  article preparation and refinement tasks. Link presentation stays in the
  shared rendered-Markdown boundary. No product behaviour, persistence, auth,
  schema, migration, prompt, external mutation, or unsupported verification
  claim was introduced.
