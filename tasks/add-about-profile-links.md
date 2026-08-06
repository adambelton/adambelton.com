# Add About-page profile links

## Goal

Make Adam's professional contact routes available in the contextual About-page
Contact section while simplifying the global footer.

## Why this task is next

The About copy and retained typography are settled, and the About page is the
natural location for email and professional profiles before deployment.

## Scope

- Add text links for Email, LinkedIn, and GitHub to the About Contact section.
- Use fully qualified HTTPS profile URLs and normal same-tab navigation.
- Remove the Email link from the global footer while retaining Privacy.
- Record DM Sans as the retained font decision.
- Verify focus, wrapping, and desktop/mobile presentation.

## Out of scope

- Social icons, forced new tabs, tracking parameters, or footer profile links.
- Other About copy, navigation, or typography changes.

## Expected files to create or modify

- `apps/client/src/website/pages/AboutPage.tsx`
- `apps/client/src/website/pages/AboutPage.test.tsx`
- `apps/client/src/ui/layout/SiteFooter.tsx`
- `apps/client/src/ui/layout/SiteFooter.test.tsx`
- the DM Sans experiment record
- `progress.md`
- this task record

## Definition of done

- Email, LinkedIn, and GitHub are visible and correctly addressed on About.
- The links are keyboard focusable and wrap without overflow.
- The global footer contains Privacy but no email link.
- Focused tests, client build, mounted inspection, and diff checks pass.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/pages/AboutPage.test.tsx apps/client/src/ui/layout/SiteFooter.test.tsx
pnpm --filter @adambelton/client build
git diff --check
```

## Risks / questions

- The Contact row must remain legible when its links wrap on narrow screens.

## Approval record

Approved by Adam on 6 August 2026.

- **Intentional boundaries:** use accessible text links without icons, expose
  email only contextually on About, and retain only Privacy globally.
- **Important deferrals:** icons, footer profile links, new-tab behaviour, and
  tracking.
- **Implementation decision:** present Contact as a wrapping semantic list.
- **Do not reopen without new evidence:** DM Sans is retained as the site font.

## Status

Complete on `codex/public-markdown-and-private-thoughtform`; not yet committed or
published.

## Completion audit

- **Contextual profile links:** About presents Email, LinkedIn, and GitHub as a
  semantic wrapping list. Mounted inspection confirmed the exact mailto and
  fully qualified HTTPS destinations, no `target` override, visible rendering,
  and a zero-default-tab-index focus target for each link.
- **Global footer:** the shared footer retains only `/privacy`; focused coverage
  asserts that no `mailto:` link remains globally.
- **Responsive presentation:** the Contact row occupies 672px on desktop and the
  available 335px between 20px mobile edges. At 390px the document remains 375px
  wide, the links fit on one wrapping-capable row, and the footer has no
  horizontal overflow.
- **Retained typography:** the DM Sans experiment status now records Adam's
  mounted acceptance; no typography implementation changed in this task.
- **Regression coverage:** focused About and footer tests verify all destinations,
  placeholder removal, retained biography, Privacy, and absence of global email.
- **Validation:** two focused tests passed, the client TypeScript check and Vite
  production build passed, and `git diff --check` passed.
- **Branch audit:** changes remain in host-owned public presentation and shared
  site layout. They do not change product behaviour, authored biography,
  persistence, access, schema, or infrastructure. A concurrent user-owned edit
  to `packages/products/src/registry.ts` remains untouched and outside this
  completion claim.
