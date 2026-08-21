# Add Care Calendar and The Blackout project pages

## Goal

Add public project pages for Care Calendar and The Blackout, and distinguish
current work from a completed concept prototype on the product catalogue.

## Why this task is next

Care Calendar now has enough authoritative learning and definition material for
an accurate public account. The Blackout repository is public and records a
completed, live-tested concept prototype. The existing catalogue assumes that
every registered product has a demo and cannot represent either project
truthfully.

## Scope

- Add public overview routes at `/products/care-calendar` and
  `/products/the-blackout` through the existing product mount.
- Keep ThoughtForm and Care Calendar under `Current`; place The Blackout under
  `Completed` with the label `Concept prototype complete`.
- Give ThoughtForm the label `Demo available` and Care Calendar the label
  `In definition`.
- Write product-owned overview copy grounded in Care Calendar's authoritative
  documents and The Blackout's public repository.
- Link The Blackout overview to its public source repository.
- Present the separate Current and Completed catalogue sections as responsive
  one-, two-, and three-column editorial grids like Writing, with one full-width
  divider beneath each section heading.
- Prerender the product catalogue and all three public project roots.
- Add the new routes to the public sitemap.
- Add focused catalogue, routing, page, and metadata tests.
- Update owning README trees, `progress.md`, and this task record.

## Out of scope

- A Care Calendar runtime, interface, integration, API, database model, or demo.
- Clinical, regulatory, organisational, or production-readiness claims for Care
  Calendar.
- Importing or running The Blackout inside this repository.
- Recreating The Blackout's matchroom as an interactive demo.
- Redesigning ThoughtForm's working product interface.
- Project cover images or social-image metadata.
- Deployment, commits, pushes, or pull-request operations.
- New architectural roles or changes to established product boundaries.

## Expected files to create or modify

- product-owned Care Calendar and The Blackout client overview/routes/tests
- product registry definitions and platform-wide product registry types
- host product route dispatch, catalogue, metadata, prerendering, and tests
- `apps/client/public/sitemap.xml`
- owning product and root README trees where their implemented shape changes
- `progress.md`
- this task record

## Definition of done

- The real website shell renders complete public pages for all three project
  roots, with accurate canonical and social metadata.
- The catalogue groups ThoughtForm and Care Calendar under `Current`, and The
  Blackout under `Completed`, with the approved per-project labels.
- Care Calendar makes no unsupported implementation, assurance, regulatory, or
  readiness claims.
- The Blackout accurately presents its public-source, completed-prototype, and
  paused-development status.
- The separate Current and Completed sections each use a responsive one-, two-,
  and three-column editorial grid; one divider spans the full content width
  beneath each section heading.
- Unknown products and unsupported nested routes remain not found.
- The catalogue and all three public product roots are prerendered and the new
  roots appear in the sitemap.
- Focused tests, the full test suite, typecheck, production build, responsive
  browser inspection, generated-HTML inspection, and the complete diff audit
  pass.
- `progress.md` and this task contain evidence-backed completion records.

## Validation commands

```txt
pnpm vitest run apps/client/src/products packages/products/src/care-calendar packages/products/src/the-blackout
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- Care Calendar copy must describe coordination and learning without implying a
  finished interface or clinically assured product.
- Care Calendar and ThoughtForm appear in that order in Current; The Blackout
  appears underneath in Completed.

## Approval record

Approved by Adam on 21 August 2026.

- **Intentional boundaries:** add two informational project pages through the
  established product mount; retain ThoughtForm's existing product behaviour;
  distinguish current projects from completed work; use repository-owned,
  title-free editorial imagery for all three projects.
- **Important deferrals:** Care Calendar implementation, a hosted or embedded
  Blackout demo, broader product-interface redesign, deployment, commits,
  pushes, and pull requests remain separate work.
- **Implementation decisions:** the catalogue groups ThoughtForm and Care
  Calendar under `Current` and The Blackout under `Completed`; the labels are
  `Demo available`, `In definition`, and `Concept prototype complete`;
  standalone project heroes have descriptive alt text while linked catalogue
  thumbnails have empty alt text; project covers follow the established writing
  image guidance for visual consistency.
- **Do not reopen without new evidence:** The Blackout is complete rather than
  current or merely inactive; Care Calendar must not be represented as an
  implemented or assured healthcare product; adding imagery to the two new
  pages requires equivalent ThoughtForm imagery in the same task.

### Presentation amendment

Approved by Adam on 21 August 2026 after reviewing two rounds of generated
project artwork.

- **Decision:** abandon project imagery for this task and remove every generated
  source, rendition, metadata field, component, and test rather than retaining
  artwork that does not improve the pages.
- **Catalogue presentation:** use a responsive text-led column layout similar to
  the writing collection. Later mounted review clarified that Current and
  Completed remain separate sections, each reaching three columns at the wide
  breakpoint. Care Calendar precedes ThoughtForm in Current, and The Blackout
  appears in Completed below. Each section heading owns one full-width divider;
  project cards do not repeat individual top rules.
- **Intentional boundary:** the original consistency requirement is superseded;
  ThoughtForm, Care Calendar, and The Blackout remain equally image-free on the
  catalogue and project pages.

### Host-ownership amendment

Approved by Adam on 21 August 2026.

- **Decision:** public product overview pages describe products as part of the
  personal website and are owned by `apps/client`, not by reusable product
  packages.
- **Registry boundary:** the host owns a separate overview catalogue containing
  Care Calendar, ThoughtForm, and The Blackout. The platform product registry
  contains only integrated products, so The Blackout and definition-stage Care
  Calendar receive no platform `ProductId` or hosted-product registry entry.
- **Intentional boundary:** all three product roots and their shared overview
  presentation move to the host; ThoughtForm's functional nested routes remain
  product-owned and continue to receive host-supplied capabilities.
- **Important deferrals:** no copy, visual design, URL, access, catalogue,
  prerendering, or functional product behaviour changes are introduced by the
  move.
- **Do not reopen without new evidence:** a public description of a product is
  not product implementation merely because it is mounted under that product's
  URL.

### Host-products organisation amendment

Approved by Adam on 21 August 2026.

- **Decision:** organise the host products interface by presentation, catalogue,
  routing, and ThoughtForm-specific integration roles; every page belongs under
  `pages` and tests remain colocated with their owner.
- **Runtime scope:** load ThoughtForm runtime capabilities only for the public
  overview and temporary editor, and restore pending state whenever an enabled
  load begins.
- **Layout stability:** unresolved or unavailable demo links reserve their final
  text space with non-interactive hidden placeholder text so capability loading
  does not shift the overview layout.
- **Intentional boundary:** the API contract, authentication, access rules,
  product-owned functional UI, URLs, copy, and visual design remain unchanged.

## Status

Complete on `codex/add-care-calendar-blackout-project-pages`.

The two public pages, registry entries, host routing, catalogue presentation,
prerendering, sitemap entries, and focused regressions are implemented. Two
rounds of generated artwork were reviewed and then removed completely at Adam's
direction. The final catalogue keeps separate Current and Completed sections,
each with a full-width divider and a responsive three-column-capable grid. Care
Calendar precedes ThoughtForm; The Blackout appears below. The Blackout page is
written from the match consumer's perspective, with writer input and system
architecture presented only as support for the audience experience. A later
approved ownership correction moves all three descriptive pages and their
shared presentation into the client host; ThoughtForm alone retains functional
nested routes in its product package.

## Completion audit

- **Care Calendar overview:** complete. Host-owned page and route tests verify
  the ongoing learning-first framing, six learning-plan areas, the role of
  the bounded concept, definition-stage status, and explicit absence of
  implementation, completed-learning, or assurance claims.
- **The Blackout overview:** complete. Host-owned page and route tests verify
  the new football-consumption experience, football writing as the source of
  value, AI as the live-enabling medium, shared timing, present-tense framing,
  completed prototype status, and public source link.
- **Catalogue grouping and order:** complete. Host catalogue and page tests verify Care
  Calendar then ThoughtForm under Current, followed by The Blackout under
  Completed, with `In definition`, `Demo available`, and
  `Concept prototype complete` labels.
- **Registry ownership:** complete. The host overview catalogue owns all three
  website descriptions and their presentation metadata. The platform product
  registry and `ProductId` vocabulary contain only integrated ThoughtForm;
  focused tests explicitly verify that Care Calendar and The Blackout are not
  returned as registered products.
- **Host-products organisation:** complete. Catalogue policy, shared
  presentation, pages, routing, and ThoughtForm-specific integration occupy
  distinct role-named directories. Every host product page and its colocated
  test now lives under `pages`.
- **Runtime-capability scope:** complete. Host tests verify capabilities load
  only for the ThoughtForm overview and temporary editor, not privacy, saved
  conversations, persistent editors, or other products. An enabled load resets
  pending state; unavailable and unresolved demo links retain two
  non-interactive hidden text placeholders so the overview layout remains
  stable.
- **Catalogue presentation:** complete. Mounted inspection at 1440px verifies
  that both sections compute three equal columns, while Current uses its first
  two and Completed uses its first. Both heading dividers measure the complete
  1,346px section width. At 390px the grid collapses to one column without
  horizontal overflow.
- **Public routing and metadata:** complete. The real host renders both new roots
  with public access, correct titles and canonical URLs; unsupported nested paths
  remain not found. Mounted verification after the ownership move confirms Care
  Calendar, The Blackout, and ThoughtForm roots plus ThoughtForm's delegated
  public privacy route retain their expected titles and headings.
- **Static delivery:** complete. The production build emits `/products`, all
  three public product roots, and the new Care Calendar and The Blackout sitemap
  entries. Generated HTML contains the expected catalogue and page content.
- **Imagery amendment:** complete. No generated source, rendition, registry
  field, page component, metadata, or test remains under the branch diff.
- **Documentation:** complete. The root README, both owning product READMEs,
  task index, task record, and `progress.md` describe the implemented shape and
  status. Decision 068 records that public product descriptions belong to the
  host while reusable product behaviour remains product-owned.
- **Shared presentation:** complete. All three overview pages reuse
  `ProductOverviewSection` for semantic section labelling, heading, divider, and
  content layout. Repeated level-three headings with their associated text use
  `ProductOverviewSubsection`; its name describes presentation rather than the
  current Care Calendar subject matter. Product-specific descriptive content
  remains inline with its host-owned page; the former narrow `LearningArea`
  abstraction does not remain. `ProductOverviewTitleSection` owns the repeated
  H1, proposition, introduction, and optional action-area presentation across
  all three pages.
- **Validation:** focused component and page tests, full suite (401 passed, 16 skipped),
  `pnpm typecheck`, `pnpm build`, `git diff --check`, generated-HTML inspection,
  and mounted desktop/mobile browser inspection pass.
- **Complete branch-diff audit:** public description and product-root routing
  stay in the client host. ThoughtForm's functional nested routes remain in its
  product client entrypoint; Care Calendar has no client implementation here and
  The Blackout remains externally implemented. Platform changes are limited to
  generic registry vocabulary, static route discovery, sitemap, and the
  registry-aligned writing tag allowlist. No product behavior is duplicated in
  the host; no persistence, migration, auth, AI-provider, prompt, usage, or
  unrelated production behavior changes are present.
