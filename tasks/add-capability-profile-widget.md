# Add the capability-profile widget

## Goal

Add a Markdown-driven interactive capability profile to the public About page.

## Why this task is next

The finished capability content is available in the repository, the About page
is the intended professional-profile surface, and the existing build-time
Markdown compiler is the correct foundation for presenting it.

## Scope

- Compile and validate repository-backed widget Markdown alongside pages and posts.
- Parse the capability profile into a typed browser-safe model.
- Render Overview, Evidence basis, Development trajectory, and Impact profile views.
- Keep Engineering practice, Systems & architecture, and Leadership as the primary
  persistent structure in every view.
- Render a three-column capability grid within each section in Overview.
- Split each persistent section into classification columns in the other views.
- Render exact Markdown-authored view introductions and value explanations.
- Provide reusable classification tags, keyboard-operable view selection and
  cards, and an accessible focused capability detail presentation.
- Preserve useful responsive behaviour at desktop and mobile widths.
- Update focused tests, task records, and progress, and verify the real About route.

## Out of scope

- Editing or paraphrasing supplied copy; proficiency scores, ratings, or levels;
  a second CMS or runtime Markdown parser; unrelated About, product, API, database,
  auth, or navigation changes; commits, pushes, pull requests, or merges.

## Expected files to create or modify

- `apps/client/src/content/widgets/capability-profile-content.md`
- the host website content compiler, generated-module contract, accessors, and tests
- capability-profile presentation and focused tests under `apps/client/src/website/`
- `apps/client/src/website/pages/AboutPage.tsx` and its focused test
- `progress.md` and this task record

## Definition of done

- Markdown remains the only authority for capability copy, labels, descriptions,
  stable keys, ordering, and classifications.
- Metadata on capabilities references stable classification keys only.
- All four views preserve the three primary capability sections and the specified
  per-section desktop/mobile layouts.
- Detail content contains the exact authored evidence and current-focus paragraphs.
- Keyboard interaction, focus handling, responsive layout, and dialog dismissal work.
- Focused tests, repository typecheck, build, full tests, mounted browser inspection,
  diff checks, and the completion audit pass.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/content apps/client/src/website/capability-profile apps/client/src/website/pages/AboutPage.test.tsx
pnpm typecheck
pnpm build
pnpm test
git diff --check
```

## Risks / questions

- Widget compilation must remain a narrow extension of the existing host-owned
  content pipeline.
- The repository has no existing dialog or tabs component, so this task owns the
  smallest accessible implementation within the website capability.
- Unrelated Care Calendar working-tree changes must remain untouched.

## Approval record

Approved by Adam on 1 September 2026.

- **Intentional boundaries:** capability metadata contains stable classification
  keys only; labels and descriptions belong solely to classification definitions.
- **Authored-copy boundary:** render the exact view introduction and per-value
  explanatory paragraphs from Markdown rather than reconstructing them from
  shorter glossary metadata.
- **Layout boundary:** Overview is a three-column grid within each persistent
  section on desktop; classification views split each persistent section into
  that view's columns rather than grouping capabilities globally.
- **Important deferrals:** no broader content system, proficiency representation,
  unrelated About changes, or external mutation.
- **Implementation decisions:** exact file decomposition and the accessible local
  dialog/tab mechanics remain open within the approved behaviour.
- **Decision not to reopen:** the supplied Markdown is the copy and classification
  source of truth.

### Approved scope amendment — 1 September 2026

Approved by Adam after mounted review.

- Move the widget below the complete biography, including `Up the Reds.`.
- Compile each newly authored capability-description paragraph and render it in
  the detail dialog before evidence and development trajectory.
- Compact desktop presentation into a fixed four-column matrix: category in
  column one and content in columns two through four. Impact profile uses its two
  classification groups in columns two and three and leaves column four empty.
- Preserve the sequential mobile structure, readable tap targets, exact Markdown
  copy, stable classification keys, interaction behaviour, and unrelated work.

### Approved matrix-header amendment — 1 September 2026

Approved by Adam after review of the compact matrix.

- Add a structural first matrix row that remains empty in Overview.
- In classification views, place each value's label and exact authored explanation
  in that row above its corresponding capability column; keep column one empty and
  keep Impact profile column four empty.
- Remove the separate definition block above the matrix to avoid duplication.
- Preserve the active-view introduction and render populated definitions
  sequentially on mobile before the capability categories.

### Approved header-alignment amendment — 1 September 2026

Approved by Adam after mounted review.

- Remove classification-definition cell padding and its decorative left border.
- Rely on the matrix gutter for separation so definition text aligns exactly with
  the left edge of the cards beneath it.

### Approved classification-organisation amendment — 1 September 2026

Approved by Adam after discussion of colour semantics.

- Render first-row classification values as formal column headings matching the
  category-heading treatment rather than as tags.
- Give Evidence basis, Development trajectory, and Impact profile one distinct,
  consistent colour family each. Values within a classification share its colour;
  colour must not imply proficiency, progress, or hierarchy.
- Retain text as the classification value authority and maintain accessible
  contrast without relying on colour alone.
- Add an accessible information control beside the profile heading. Its focused
  guide dialog renders the exact glossary description for all three
  classifications and every value, using the shared coloured tags.
- Reuse one dialog focus, Escape, containment, dismissal, and restoration contract
  across capability details and the classification guide.

### Approved view-colour and guide-copy amendment — 1 September 2026

Approved by Adam after mounted review.

- Connect Evidence basis, Development trajectory, and Impact profile view controls
  to their corresponding tag colour families; keep Overview neutral and retain
  selection cues that do not depend on colour.
- Replace the guide's shorter glossary metadata copy with the exact compiled view
  introduction and per-value explanations used in the corresponding classification
  view. Keep shorter glossary descriptions in the content model but do not present
  a competing user-facing explanation.

### Approved card-affordance and tab-emphasis amendment — 1 September 2026

Approved by Adam after mounted review.

- Remove the link-like `View details` copy from capability cards; the complete card
  remains the sole native button and does not imply navigation.
- Add an explicit pointer cursor and a decorative detail indicator in the card's
  upper-right corner, revealed on pointer hover and keyboard focus. Preserve normal
  button semantics and focus outlines so interaction never depends on hover.
- Strengthen view controls with bolder type and a thicker classification-coloured
  edge while retaining tinted selection, borders, `aria-selected`, and neutral
  Overview treatment.

### Approved capability-impact-detail amendment — 1 September 2026

Approved by Adam after updating the Markdown source.

- Supersede the earlier tag-only Impact profile detail boundary.
- Require every capability to contain one authored `Impact profile` paragraph and
  compile it into the typed capability model.
- Render that exact paragraph after Development trajectory in the capability dialog,
  headed by `Impact profile:` and the shared coloured value tag.
- Continue to use the stable `impact_profile` metadata key for logic and preserve
  all other revised Markdown wording without UI-owned copies.

### Approved visible-copy ownership amendment — 1 September 2026

Approved by Adam after auditing the widget's remaining component-owned copy.

- Source every visible label from the capability-profile Markdown, including the
  widget eyebrow, classification-guide labels, and capability-detail classification
  headings.
- Keep functional accessibility instructions such as Open and Close labels in code.
- Restructure the Markdown where useful so its authored hierarchy explicitly models
  the classifications used by both the views and classification guide.
- Remove duplicated glossary descriptions so classifications and values each have
  one canonical visible label and one canonical authored explanation.

### Approved compact card-label amendment — 1 September 2026

Approved by Adam after mounted review.

- Reduce capability-name type enough to keep every name on one line in the
  standard desktop matrix, using `Asynchronous & event-driven architecture` as
  the limiting case.
- Preserve natural wrapping at narrower widths rather than forcing text overflow.
- Keep card dimensions, classification tags, interaction, and layout unchanged.

### Approved card-label and indicator revision — 1 September 2026

Approved by Adam after mounted review; this supersedes the compact card-label
amendment and the decorative-indicator part of the earlier card-affordance amendment.

- Restore capability names to their original `text-base` size and normal tracking.
- Remove the decorative `+` hover/focus indicator and all space reserved for it.
- Retain the whole-card native button, pointer cursor, border hover treatment, and
  keyboard focus presentation as the interaction affordance.
- Permit long names to wrap naturally rather than compromising readability.

### Approved impact-colour and card-height amendment — 1 September 2026

Approved by Adam after mounted review.

- Replace the Impact profile lavender family with a muted burgundy family:
  `#eadcdf` background, `#a77b84` border, and `#5b3440` text.
- Keep Evidence basis and Development trajectory colours unchanged.
- Remove the capability-card minimum height so cards derive their height from
  their title, visible tags, and padding, particularly in classification views.
- Preserve natural grid stretching, responsive layout, interaction behaviour,
  and accessible contrast.

### Approved Leverage profile rename amendment — 1 September 2026

Approved by Adam after the final content review renamed the third classification.

- Rename the stable classification key from `impact_profile` to
  `leverage_profile` and the stable view key from `impact-profile` to
  `leverage-profile`.
- Rename the corresponding compiled capability fields, presentation mappings,
  tests, and colour variables while preserving the approved burgundy treatment.
- Render the revised Leverage profile heading and exact updated Markdown copy in
  the view, guide, cards, and capability dialogs.
- Leave the remaining content changes authored by Adam intact and push the
  validated correction to pull request 54.

### Approved public-page typography amendment — 1 September 2026

Approved by Adam after a mounted typography audit across About, Writing,
Products, and all three product overview pages.

- Align the transient product loading title with the shared public-page title
  scale: 48px on mobile and 72px from the small breakpoint.
- Preserve its weight, line-height, copy, status semantics, and surrounding
  spacing while removing the 60px/96px loading-to-content layout jump.
- Leave all other public typography unchanged; the audit found its hierarchy,
  measures, weights, and responsive scales consistent.
- Validate the loading and completed product states and push the correction to
  pull request 54.

## Status

Complete on `codex/capability-profile-widget`; committed and published to pull
request 54, but not merged.

## Completion audit

- **Markdown content authority:** the Vite content plugin reads the widget
  directory and compiles the supplied document through the existing frontmatter,
  Markdown, sanitization, generated-module, and hot-reload boundary. Every visible
  label—including the widget and guide eyebrows/titles and detail classification
  headings—comes from the compiled document. Component source contains no
  capability copy or human-readable classification mapping; only functional
  accessibility instructions and decorative symbols remain component-owned.
- **Stable metadata keys:** capability YAML accepts only the three stable
  classification keys and order. Focused compiler tests prove unknown keys and a
  duplicated human-readable label field fail with source-specific errors.
- **Exact explanatory copy:** every view introduction is compiled from its own
  authored Markdown block, including both Overview paragraphs. Each classification
  and value now has one canonical heading, stable key, and authored explanation;
  the former duplicate short glossary descriptions have been removed.
- **Persistent section structure:** all views render Engineering practice, Systems
  & architecture, and Leadership first. Desktop renders each as a fixed four-column
  matrix row with category in column one. Overview flows ordered cards across the
  remaining three columns; classification views place their groups there, and
  Leverage profile leaves its fourth matrix column intentionally empty.
- **Matrix header:** Overview retains an empty structural first row. Each
  classification view renders exactly one populated definition row with column one
  empty and each value's formal heading plus exact authored explanation aligned above
  its capability column. Leverage profile also leaves header column four empty.
  Repeated per-category group labels are hidden on desktop and retained on mobile.
  The definition cells have no internal left padding or decorative border, and
  their 16px gutters match the capability-group gutters. Mounted measurement at
  1440px confirms label, paragraph, and card edges align exactly at 380px, 728px,
  and 1076px.
- **Cards and tags:** cards contain the authored capability name, only the
  non-spatial classifications for the active view, the shared classification-tag
  presentation, and a persistent selectable affordance. They are native buttons.
  Capability names use the original 16px semibold type and wrap naturally where
  needed; no decorative indicator reserves space beside them. Cards have no
  minimum height and size from their visible title, tags, and padding. Mounted
  desktop measurement places classification-view cards between 82px and 104px,
  compared with 110px to 132px in Overview where all three tags remain visible.
  Evidence, trajectory, and leverage each have one consistent colour family; values
  remain distinguished by text rather than tone. Mounted contrast ratios for the
  three families are 7.62:1, 7.11:1, and 7.86:1 respectively. Leverage uses the
  approved muted burgundy family rather than lavender.
- **Classification guide:** an information button beside the profile title opens a
  focused dialog containing the exact same three view introductions and eight
  value explanations rendered in the matrix views, with their shared coloured
  tags. Its visible eyebrow and title are also Markdown-owned, and shorter glossary
  metadata no longer creates competing user-facing copy.
  The guide reuses the capability dialog's focus, containment, Escape, dismissal,
  and restoration contract.
- **View/tag link:** Evidence basis, Development trajectory, and Leverage profile
  controls reuse the exact background, border, and text colours of their tags in
  selected state, while their inactive borders retain the same family. Overview
  remains neutral and `aria-selected`, borders, and background continue to convey
  selection without relying on colour alone.
- **Card affordance:** each capability card remains one native button with an
  explicit pointer cursor. Link-like `View details` copy and the decorative `+`
  indicator are absent. Border hover treatment, the normal focus outline, and
  button semantics remain the authoritative interaction cues.
- **Tab emphasis:** classification-family borders are 4px and tab-label spans
  compute to font weight 700. The span is necessary because the repository's global
  `button { font: inherit }` shorthand otherwise resets button-level weight utilities.
- **Capability detail:** selection opens an ARIA modal dialog with section, all
  three classifications, the newly authored capability description before exact
  evidence, current-focus, and Leverage profile paragraphs, an explicit close control,
  focus containment/restoration, backdrop dismissal, and Escape handling. The
  approved amendments intentionally supersede the original tag-only Impact profile
  boundary; no proficiency representation was added. Compiler coverage requires
  the authored Leverage profile paragraph for every capability.
- **Responsive presentation:** mounted inspection measured four equal 332px matrix
  columns at 1440px, with three compact 335px content columns after the category.
  Leverage profile exposes two populated groups plus the intentionally empty final
  column. At 390px, category sections and groups return to one 350px column, the
  empty desktop column is hidden, the dialog fits, and document overflow is zero.
  The complete biography, including `Up the Reds.`, precedes the widget. This was
  browser inspection, not human assistive-technology verification.
- **Public typography:** mounted desktop/mobile inspection confirms About, Writing,
  Products, and completed product overviews share the intended title, eyebrow,
  introduction, body, and subsection scales. The transient product loading title
  now matches the completed 48px/72px title scale with no mobile overflow, removing
  the sole observed loading-to-content typography jump.
- **Validation:** 411 tests passed with 16 skipped; repository typecheck and build
  passed. The repository-wide `git diff --check` reached only unrelated pre-existing
  trailing spaces in the modified Care Calendar learning-outcomes file. The same
  check scoped to this task's files passes.
- **Branch audit:** the complete task diff stays within host-owned public content,
  its build compiler, website presentation, tests, and records. It introduces no
  product behaviour, host/product duplication, persistence, schema, migration,
  auth, API, managed prompts, unsupported documentation claim, or unsettled approved
  implementation decision. Unrelated Care Calendar changes remain untouched and
  outside this completion claim.
