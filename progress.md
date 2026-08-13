# Progress

## Current status

The portfolio and ThoughtForm presentation have received a restrained design
refinement pass. The product overview now promotes the working workspace near
the introduction and places the hypothetical open model after the development
snapshot. Shared eyebrow and field-control styling improves small-label and
form affordance consistency; secondary text contrast, long-form heading rhythm,
account-navigation separation, workspace tabs, divider strength, conversation
spacing, and default Idea Map visibility have also been refined without changing
the established visual direction. User-facing portfolio-release language now
calls the experience a product demo.

Task 044 is complete, merged, and deployed. The owner now has a
content-free ThoughtForm operations page showing account identity, latest
admitted operation, current UTC-day personal allowances and global totals, and
retained 90-day token/model/outcome totals. The API conceals the route from
logged-out and non-owner callers; the reader joins only authentication accounts
and the existing hosted-attempt ledger. No schema change was needed.

Task 040 is complete. Temporary hosted
operations now use atomic personal and global UTC-day operation/token budgets,
reservation-first accounting, actual input-plus-output reconciliation, owner
personal exemption, fail-closed production configuration, and bounded safe
client disclosure. Conversation, Idea Map, and Draft output caps are calibrated
to Task 039 measurements, and Draft model inputs now have a validated 16 KiB
pre-admission bound. Configured Neon tests cover concurrent admission, actual
usage replacement, missing-usage reservations, and owner/global behaviour.

Autonomous, user-correctable Idea Map evolution is complete. The existing
independent Idea Map analysis attempt may propose one bounded merge or split;
product-owned validation remains authoritative and adds no hosted action.
Temporary and durable workspaces now provide accessible direct merge, split,
and one-step undo while preserving user-established substance, questions,
interpretations, dispositions, stable identities, and potential-conflict
references. Equivalent assistant proposals are suppressed after user
correction until the source material changes. A generated migration persists
bounded structural provenance, conflict references, and suppression state.
Validation covers 345 ordinary tests, five explicitly configured Neon tests,
five Playwright journeys, full typecheck/build, database and prompt validation,
and mounted merge, reload, undo, reload, split, reload, and 390px inspection.
The two-scenario hosted Langfuse experiment against development prompt version
3 scored 1.0 for both expected structural operation and product validation in
both the merge and split cases. Draft pull request 33 awaits Adam's review and
must not merge without his explicit approval.

Task 038 is complete. Every current hosted ThoughtForm model operation now uses
one product-owned authorization/completion lifecycle backed by a host-owned,
content-free Neon ledger. Conversation response and Idea Map analysis remain
independent attempts; Draft composition, revision proposals, and model-backed
saved-change interpretation use the same boundary. Provider-neutral usage is
aggregated across calls, partial metrics remain explicitly unknown, completion
is idempotent, stale admitted work reconciles as interrupted after one hour,
completed records expire after 90 days, and deleting an auth user cascades the
ledger. Invalid input and disabled/configuration rejection create no durable
attempt. A mounted owner walkthrough produced and read back five successful
Sonnet 5 rows through the real client/API/Anthropic/Neon composition, then
cleared the synthetic workspace. Automated validation covers 333 ordinary
tests, eight unskipped Neon integration tests, four browser journeys, full
typecheck/build, schema validation, current migration status, and diff checks.

Task 039 is complete. Its usage measurement and approved autonomous Idea Map
reliability amendment are implemented, validated, recorded, and approved for
commit.
Six privacy-safe representative journeys now
run through the mounted temporary ThoughtForm composition while usage is read
exclusively from the content-free Task 038 ledger. The final report-capture run
completed 72 of 72 attempts successfully across two repetitions. Its originally displayed
monetary estimate was withdrawn after an audit found duplicate pricing of cache
and reasoning categories; the provider token measurements are unaffected.
Conversation responses used 2,186–3,408 input and 227–541 output tokens; Idea
Map analyses used 3,583–4,803 input and 151–990 output tokens. The dated report
records all operation and scenario ranges, missing reasoning metadata,
limitations, and concrete Task 040 review inputs without fixture or generated
content. A stricter targeted structure check then stopped after its first six
successful hosted attempts because none of three Idea Map analyses proposed an
autonomous merge or split; the second repetition did not run. That investigated
failure is recorded without weakening the 72-attempt usage ranges or claiming
that autonomous structure evolution occurred in the measurement. Task 040 used
those measurements to set the now-implemented policy values.

The first Idea Map reliability amendment run completed 24 calls for an estimated
$0.1126. It produced 12/12 correct requested structural changes, no changes in
nine controls, and 3/3 respected corrections. Its positive messages explicitly
requested restructuring, so it demonstrates prompted reliability rather than
autonomous detection. Revised implicit positive scenarios are implemented but
were then run in a separately approved 12-call check for an estimated $0.0905.
All 12 proposed the expected operation against the correct ideas; 11 passed
product validation and one split was safely rejected. Taken together, the
small matrix provides directional evidence of reliable clear-cue behavior with
no observed control false positives, while the earlier natural journey remains
evidence that autonomous restructuring will not occur in every conversation.

The ThoughtForm product overview now uses the approved AI-assisted cathartic-
journaling copy. It introduces the gateway use case, presents Explore, Inspect,
and Articulate as the complete reflective loop, makes user agency and the non-
therapy boundary explicit, and explains the possible open-source/prompt/hosted-
service/usage-credit model as hypothetical. The development snapshot now states
that conversation, the user-correctable Idea Map, articulation, and revision are
working while public-beta usage, privacy, safety, and operations preparation
continues. Existing workspace, saved-conversation, and privacy link permissions
are unchanged.

The refined ThoughtForm direction was documented on 8 August 2026.
ThoughtForm remains a conversational thinking workspace, now expressed through
the product-facing journey Explore, Inspect, and Articulate. Articulation is the
intended culmination and likely the point where the experience proves its
distinctive value; a user may stop earlier without coercion, but that earlier
stop is not an equivalent intended endpoint. Existing `Draft`, compose,
`Composition`, Discovery, Idea Map, conversation, and workspace terminology is
unchanged.

The current operating intent remains a portfolio project and product experiment.
“Open-source, AI-assisted cathartic journaling platform,” an open-source core, a
freely available approximation of the conversational method, a craft-led hosted
service, and non-expiring usage credit are conceptual positioning and business-
model ideas only. They are not launched functionality, current pricing, clinical
claims, or company strategy.

The documentation pass itself did not change user-facing copy, prompts, runtime
behaviour, or evaluations. The separately approved product-page copy task has
since corrected the mounted overview's weaker “when it is useful” hierarchy. The
discovery prompt still calls an offer an “optional articulation”; that remaining
behavioural mismatch requires separate approval. Deterministic no-Draft coverage
remains valid evidence that the system does not coerce continuation; it should
not be read as establishing an equal intended endpoint.

The approved ThoughtForm presentation pass is complete. The Products entry is
now concise, while the ThoughtForm overview explains when the product helps,
the conversation–Idea Map–Draft loop, user inspectability, and the current
public-beta preparation work. The consent checkpoint now distinguishes active
AI processing, temporary storage, and appropriate use without exposing
owner-only implementation context. The active workspace uses a compact heading,
a prominent temporary-lifetime notice, and visible Idea Map/Draft selection.
About and writing bodies share the regular 672px, 16px/28px muted-copy treatment;
the shared sign-in page uses neutral language and the standard public hero
hierarchy. Symmetric stable scrollbar gutters prevent overflow state from
shifting centred content while native visibility remains user-controlled.
Focused and full unit tests, typecheck, production build, four deterministic
browser journeys, mounted desktop inspection, and a 390px no-horizontal-overflow
browser check pass.

The merged Langfuse migration replaces Braintrust with manual
Langfuse/OpenTelemetry owner tracing, native generation usage and prompt-version
links, development/production Prompt Management labels, and repository
fallbacks for all five active ThoughtForm prompts. Temporary workspaces retain
no-op observability. The reviewed development prompt versions use structured
XML contracts and are recorded by immutable version and SHA-256 fingerprint.
Langfuse-hosted evaluations resolve the managed `development` prompts.
Langfuse `review` events now produce fallback pull requests, and only exact
merged versions are promoted. Local validation covers 324 tests, full
typecheck/build, prompt/workflow validators, a byte-identical live updater
simulation, a no-mutation promotion dry run, and Langfuse trace read-back. The
GitHub Actions secrets and the repository-restricted Langfuse dispatch token are
configured. The complete event-driven lifecycle was proven with a byte-identical
`thoughtform/discovery` version 3: dispatch, guarded validation, generated
metadata-only PR, approved CI, reviewed merge, exact promotion, and hosted
production resolution all succeeded.

### Langfuse migration completion audit

- **Langfuse + OpenTelemetry tracing:** complete. The API host owns SDK setup;
  native generation model, usage, prompt version, environment, and session data
  were exported and read back from Langfuse.
- **Prompt Management:** complete for the five runtime product prompts.
  Development resolves the reviewed managed versions; production resolves its
  label with independently updateable repository availability fallbacks. Model
  response schemas and runtime parsers remain with their owning capabilities.
- **Fallback synchronization:** complete and live-proven. Known-name, immutable-version,
  `review`-label, XML structure, variable, leading-newline, version, and SHA-256
  checks precede an automated pull request. Main never receives a direct push.
- **Post-merge promotion:** complete and live-proven. The workflow promoted
  `thoughtform/discovery` version 3 only after its unchanged fingerprint metadata
  merged through the generated review PR.
- **Evaluation migration:** complete. Braintrust entry points and dependencies
  are removed; Langfuse experiments use the managed development prompts while
  repository-owned scenarios, fixtures, scores, and judge criteria remain
  canonical.
- **Privacy boundary:** complete. Temporary workspaces retain no-op
  observability for conversation, Idea Map, composition, revision, and saved
  change interpretation; owner persistent operations receive the host adapter.
- **Validation:** 324 tests, full typecheck and build, three isolated browser
  journeys, current database migration status, mounted client/API HTTP checks,
  prompt/workflow validation, live updater idempotency, unknown-name rejection,
  live prompt resolution, and Langfuse trace read-back passed. A mounted owner
  walkthrough exercised Discovery, Idea Map analysis, Draft composition,
  revision proposal, and saved-change interpretation; Langfuse recorded the
  exact development prompt versions `2`, `2`, `3`, `3`, and `3` with native
  usage. A separate temporary-workspace walkthrough exercised the same product
  surfaces without producing a matching Langfuse trace.
- **External activation:** complete. Langfuse filters `updated` events to
  `thoughtform/*`; GitHub skips payloads without `review`, validates reviewed
  immutable versions, and uses its temporary built-in token for the generated
  branch and PR. The separate dispatch credential is stored only in Langfuse,
  restricted to this repository, and intentionally has no expiration.

The public website is live at `https://adambelton.com` on one persistent Railway
service in Europe West. Railway serves the Vite site and same-origin API/auth
boundaries, reports a healthy deployment, and has applied the committed initial
migration to the production Neon branch. Cloudflare proxies the apex with Full
SSL/TLS and permanently redirects `www` to the apex while preserving paths and
query strings. Better Auth now generates callbacks on the canonical apex. The
temporary Railway domain remains attached for diagnosis.

Canonical page metadata, `robots.txt`, and `sitemap.xml` are implemented and
locally validated on the current activation branch but are not yet committed or
deployed. The private ThoughtForm conversation, asynchronous Idea Map, and
Braintrust production checks remain an explicitly deferred non-blocking
follow-up.

DM Sans is now retained as the site font after Adam's mounted review. The About
Contact section exposes accessible text links for Email, LinkedIn, and GitHub
without forced new tabs, while the global footer now contains only Privacy.
Mounted desktop and 390px inspection confirmed exact destinations, keyboard
focusability, same-tab behaviour, clean wrapping, and no horizontal overflow.

The approved DM Sans typography experiment established the retained baseline.
The client self-hosts the optical-size/weight variable font, applies it
site-wide, and uses antialiased rendering without runtime Google requests. The
browser observed the 62.72KB Latin font resource and computed DM Sans across the
homepage, post, About, catalogue, ThoughtForm overview, and login; 390px checks
found no overflow. The build also emits a 31.29KB extended-Latin subset that the
current English pages did not request. CSS increased by 0.73KB raw / 0.32KB
gzip, with no material JavaScript change. Adam subsequently retained DM Sans.

The public writing hierarchy and reading treatment were refined before the font
experiment. The homepage now uses a restrained `Writing` heading and brings the
complete first-post listing above the fold at desktop and mobile widths. Compiled prose
uses foreground contrast and a 672px desktop measure, while descriptions, dates,
and navigation remain muted. Mounted inspection confirmed responsive homepage,
post, and About layouts without horizontal overflow.

The public About page now contains Adam's finished four-paragraph biography and
the approved concise introduction instead of placeholder copy. Focused content
and page tests plus the client production build pass. Mounted desktop and 390px
inspection confirmed four rendered paragraphs, the intact Contact link, and no
horizontal overflow. The later typography refinement narrowed its prose measure
from 768px to 672px.

The first real public writing post now replaces the placeholder and has been
verified through the mounted client. Long post breadcrumbs and the article grid
item shrink without horizontal overflow at 390px, Markdown lists retain visible
markers and indentation, and each post supplies its browser title and
description from validated metadata. Focused tests and the client production
build pass; desktop and mobile browser inspection confirm the corrected layout.

Task 048 is complete. Repository Markdown and YAML now compile during Vite
development and production builds into sanitized HTML and validated metadata.
The browser no longer contains the Markdown/YAML syntax-tree toolchain. The
initial JavaScript fell from Task 047's 532.74 KB / 167.80 KB gzip to 275.31 KB
/ 88.67 KB gzip, while the lazy ThoughtForm chunk remains 103.32 KB / 32.67 KB
gzip. Mounted verification confirmed compiled rendering and Markdown hot reload.

Task 047 is complete. The host now lazy-loads the complete ThoughtForm client
behind its product-route mount. The initial client JavaScript fell from 634.42
KB / 199.36 KB gzip to 532.74 KB / 167.80 KB gzip; ThoughtForm now occupies a
separate 103.32 KB / 32.67 KB gzip request. Generated-module inspection confirms
that the editor, Draft panel, and React Aria are absent from the initial chunk.
Mounted internal navigation and owner workspace entry remain functional.

Task 046 is complete. The host client now owns repository-backed Markdown pages
and writing posts intended for Obsidian authoring. Placeholder About and first
post documents render through validated YAML properties and safe Markdown; the
homepage orders posts by explicit creation date and complete posts resolve at
`/writing/:slug`. The product catalogue, ThoughtForm overview, and privacy page
are public, while all workspace routes and API store-backed operations are
owner-only. Final copy and production deployment remain deliberately deferred.

The approved resilient-streaming implementation is complete. Conversation
retention now distinguishes map-only revision
advances from genuine message-history changes: the former receives one cheap
persistence reconciliation without another model call, while the latter still
conflicts. Completed Idea Map analyses are rebased against the latest map with a
bounded optimistic retry. Provider deltas remain canonical but are revealed on
an independent animation-frame cadence targeting 36 characters per second,
reduced-motion support, and rendered-height bottom-follow scrolling that
respects deliberate scroll-up. Structured response decoding now handles
chunk-split and doubly escaped Unicode sequences, including previously retained
assistant text. The full 271-test unit suite, repository typecheck, build,
frozen lockfile check, and all three deterministic Playwright journeys pass.
Mounted owner inspection confirmed zero bottom gap through completion, no
literal escape in new output, and corrected display of twelve previously
retained em dashes. Adam confirmed the revised reveal was much better and chose
a final small reduction from 42 to 36 characters per second.

The planned latency experimentation programme is now concluded. The retained
baseline is Sonnet 5 at medium effort with Claude-structured prompts, explicit
stable-prefix caching, bounded full conversation history plus the Idea Map,
concurrent conversation and map calls, SSE delivery, and paced client reveal.
Further latency work should begin only from new production or product evidence.

The approved plain-text conversation-output experiment is complete and merged.
Three alternating cache-expired FIFA repetitions
compared 30 structured and 30 unconstrained conversation calls at Sonnet 5
medium effort. Plain text changed median useful-text TTFT by only -83 ms
(5.969 versus 6.052 seconds), had a slower 14.743-second worst case, and cost
essentially the same. Quality judgments were tied, while plain text omitted its
metadata envelope on 4/30 calls, including the same sixth turn in every
repetition; structured output had one stricter readiness-contract issue. The
production structured-output default remains unchanged. Because plain text did
not win offline, the conditional mounted variant was correctly skipped. The
subsequent context-size experiment is also complete and retained bounded full
history.

The approved ThoughtForm cold-start latency diagnostic is complete and merged.
Three provider-confirmed FIFA cold-to-warm sequences and
one mounted owner sequence found no evidence that prompt-cache or Anthropic
client reuse alone explains the long first-token tail. Controlled conversation
TTFT ranged from 2.870 to 11.402 seconds (4.469-second median), with the largest
outlier on a warm cache read and reused client. Mounted server/client TTFT fell
from 12.559/13.250 seconds on a cache write to 7.871/8.637 seconds on the third
cache read; persistence and client overhead stayed below one second each. The
diagnostic runner now rejects cache labels not confirmed by provider counters.
No production mitigation was made. The later quality-scored output-contract and
context-size experiments did not justify changing the retained production
baseline, so pre-warming and a longer cache lifetime remain rejected without new
evidence.

The monorepo has been scaffolded with the intended app/package structure. The first minimal ThoughtForm product-domain service, workspace orchestration boundary, API conversation endpoint, product-owned editor UI loop, inspectable idea-map baseline, owner-scoped Prisma persistence and saved-conversation flow, authenticated temporary-workspace lifecycle, hosted-AI immediate safety boundary, Neon dev database setup, host-mounted product app boundary, auth foundation, and LLM-backed product flow exist.

The repo currently has a Vite and React Router client host with the shared public website shell, repository-backed Markdown pages and posts, auth UX, public product information, a development-enabled authenticated temporary workspace, owner-only durable ThoughtForm workspaces, and a public privacy page, a minimal Tailwind styling foundation, static public routes, a basic Hono API shell, a working health route, shared platform contracts, an initial product registry, an extractable ThoughtForm product package shape, host-owned in-memory and Prisma-backed conversation adapters, product-owned ThoughtForm client and API route entrypoints, Better Auth magic-link auth with Prisma tables, a Neon `dev` database branch with committed migrations applied, explicitly selected Anthropic and OpenAI LLM clients supplied by the API host, and a pre-editor privacy acknowledgement. Production non-owner ThoughtForm access remains disabled. Anthropic Sonnet 5 is the current owner-development baseline. A post-migration codebase audit has been completed and accepted fixes have been applied.

The completed pre-036 corrective task makes Anthropic Sonnet 5 and OpenAI GPT-5
Mini explicit ThoughtForm-supported profiles rather than arbitrary generic LLM
implementations. Provider transport schemas are projected by the product
profile, active privacy disclosure is runtime-derived, proposed idea material
requires validated user evidence with one bounded repair attempt, composition
excludes idea-map questions and requests a coherent throughline, pending replies
show an accessible response-forming indicator, and the shared host width is
1440px. Automated validation and a real mounted Sonnet verification pass.

ThoughtForm product model was course-corrected before remaining
product work. It is now documented as a private conversational thinking workspace
that helps a person explore, organise, and express what they think or feel.
Conversation and an inspectable Idea Map can stand alone. Composition remains the
internal activity for creating or developing an optional first-person Draft;
articulation names the outcome and recognition value rather than a third activity
or completion state. Preference learning, product export, and product publishing
have been retired. Later local-Markdown and static public-writing delivery belongs
to the host website after product v1. Decision 059 and the 8 August 2026 refined
direction supersede this historical summary only where it gave stopping before
articulation equal product weight.

Task 030 has been completed. Its implementation preserves the intentional
boundary: discovery can recognise composition readiness and intention while Task
031 performs canonical draft creation.

Task 031 has been implemented and its post-audit corrective pass completed. The product now owns private-draft composition,
manual immutable revisions, history preview and restoration, exact selected
draft context, reviewed passage and whole-draft proposals, amendment, rejection,
stale protection, and exact atomic acceptance. Temporary and Prisma persistence
are host adapters to product-owned ports, and deterministic browser coverage
exercises the complete discovery and drafting flows.

Task 032 has been completed. Changed manual saves and restorations now expose a
bounded exact `DraftChange` derived from adjacent immutable revisions. The user
can explicitly attach that saved edit to Discovery for discussion; the server
revalidates it against the current canonical revision, and discussion alone
does not change the draft, idea map, or any preference evidence.

Task 032's approved manual-testing corrective pass now keeps the desktop editor
within the viewport with independently scrolling, bottom-anchored conversation
and draft surfaces. Canonical writing material is expressed in the user's own
first-person perspective, saved-edit discussion cannot canonise unconfirmed
interpretation or workflow metadata, and draft composition receives only
user-facing writing material rather than assistant assessment or idea-map
scaffolding. Conversational edit requests now direct the user toward the
existing reviewable proposal path without claiming that an implicit mutation
occurred.

The corrective pass makes model-backed draft commands idempotent before model
invocation, preserves exact manual text, serializes durable draft and proposal
updates, normalizes provider failures, loads persistent draft state with the
initial editor workspace, restores real-host responsive styles, and exposes
owner-only saved-conversation navigation. Conversation policy now keeps
ordinary statements in the writing frame and includes a hosted hunger scenario
that fails if practical-advice hypotheses leak into canonical idea material.
Every page caption is now a semantic breadcrumb landmark. Website routes render
host-owned breadcrumbs directly, while ThoughtForm supplies portable route
metadata that the host renders with linked ancestors and a non-linked current
page.
Gated real-Prisma suites cover both conversation and draft adapters. Conversation
coverage exercises concurrent message sequencing, duplicate operations,
transaction rollback, owner-scoped reads, and workspace cascades; ordinary unit
and CI runs skip these database-connected tests unless `DATABASE_URL` is supplied.

Task 033 historically implemented optional Draft Format state, concurrency,
temporary and owner persistence, and editor controls. The later
conversational-thinking course correction found the concept incompatible, and
the approved unnumbered removal task has now deleted that implementation and its
stored fields without changing Draft content or revision behaviour.

Task 033's historical owner verification covered format persistence through the
real host and Neon `dev`. It is superseded by the later removal verification. API
development startup continues to apply committed migrations before launching
when `DATABASE_URL` is configured, while no-database development retains its
in-memory fallback.

Task 034 has been implemented. Every changed manual save or restoration now
returns its exact revision-bounded change before a separate automatic follow-up.
Obvious textual maintenance is suppressed deterministically; meaningful edits
receive one bounded provisional interpretation that is retained as an
assistant-only message. Potential conflicts are inspectable separately from
open questions and are removed only after user-established resolution, with the
user's richer latest wording retained as ordinary idea substance. Interpretation
failure never rolls back the saved revision and instead attaches the exact
current change to ordinary conversation for recovery. The temporary manual
“Discuss this edit” bridge has been removed, while selected-passage discussion
remains unchanged. The later unnumbered removal task deleted the unrelated Draft
Format state.

The complete authenticated flow was verified through the real local client, API,
Neon development adapter, and hosted model: a substantive edit saved immediately,
received an automatic provisional response and potential conflict, and a later
explicit restatement updated the idea and removed the conflict. A trivial edit
produced no assistant response. Automated unit, browser, typecheck, build, diff,
and a focused hosted evaluation also pass.

The unnumbered conversational-thinking course correction was completed. The
canonical brief, architecture, terminology, decisions, roadmap, privacy note,
READMEs, and planned-task boundaries now define exploration, organisation, and
optional first-person expression consistently. `Draft`, compose, and
`Composition` remain accurate implementation concepts; articulation is the
product outcome whose value comes from user recognition. The current Draft
Format implementation has now been removed through product, client, HTTP,
temporary persistence, durable persistence, and database state. The later
8 August 2026 refinement supersedes “optional first-person expression” as a
statement of product importance: articulation is not forced, but it is the
intended culmination and likely value-realisation moment.

The unnumbered conversational-thinking experience alignment has been completed.
Mounted overview, onboarding, editor, empty-state, Draft, readiness, recovery,
privacy, and safety language now present exploration, organisation, and optional
first-person expression without a writing or publishing assumption. Conversation
policy uses a concise reflection-or-distinction plus one question, treats
readiness as advisory, preserves uncertainty and mixed feelings, and includes a
proportionate non-therapy/non-diagnostic/crisis boundary. Draft composition now
requests the minimum coherent first-person shape and cannot silently turn
unresolved material into confidence or resolution.

Deterministic browser coverage exercises personal reflection, mixed feelings, a
practical decision, an argument, early articulation, correction, optional
no-Draft use, and later Draft creation. Bounded hosted evaluations cover the same
conversation shapes and first-person composition. A practical-decision run found
that invalid empty idea material was only logged; the structured-output schema
and evaluation runner now reject it, and the rerun passes. The authenticated
owner workspace was verified through the real client, API, Neon adapter, and
hosted model with the corrected opening, mixed-feeling reflection, Idea Map,
editable Draft, and reviewable proposal surface.

A corrective layout pass fixed a regression left by Draft Format removal: the
Draft panel retained five grid rows for four visible items, so the controls—not
the editor—received the flexible height. The panel now has four rows and the
editor fills the remaining column space. Browser coverage asserts that it uses
more than half the Draft surface; mounted owner verification measured 827px of
a 1,212px surface.

The fourth unnumbered correction renamed the complete product identity to
ThoughtForm. `ThoughtForm`, `thoughtForm`, and `thoughtform` now identify the
public product, code symbols, and slug/path/persistence namespace respectively.
Product and host directories, imports, routes, API mounts, structured-output
names, evaluation commands, tests, documentation, task records, Prisma models,
relations, and tables have been renamed. The old route deliberately returns Not
Found; no compatibility alias remains.

As explicitly approved for this pre-production repository, the disposable Neon
development schema and all authentication/product data were reset. Ten prior
migrations were removed and Prisma generated and applied the single current
schema-first migration `20260804154812_initial`. It creates the Better Auth
schema and eight `thoughtform_*` product tables. A fresh owner login and mounted
workflow created one conversation, hosted reflection, Idea Map, first-person
Draft, direct revision, automatic saved-edit response, and reload-persistent
revision 2 through the renamed client, API, and Prisma adapter.

ThoughtForm now has a canonical terminology reference distinguishing
artifacts, activities, operations, assistant moves, readiness, intention,
commands, events, and lifecycle facts. In particular, a `Draft` is the writing,
composing is work performed on it, and `Composition` is the activity concerned
with that work.

The unnumbered repository-organisation baseline has been implemented without
changing the numbered roadmap. Source paths now express ownership first,
architectural role second, and business capability third. Deployable hosts use
explicit bootstrap, platform, product-mount, and adapter boundaries. Socratic
Draft separates capability rules, cross-capability application operations,
inbound delivery, ports, client surfaces, and distinct forms of test support.
The product registry definition now belongs to `packages/products`, production
code no longer imports test fakes, obsolete empty scaffolds have been removed,
and repository-wide dependency tests enforce the documented ownership graph.

The repository now has deterministic Playwright coverage for the ThoughtForm
discovery flow. It runs against dedicated product-owned test client/API hosts,
an in-memory product store, and a scripted conversation model without involving
the website/API hosts, authentication, Postgres, or OpenAI. GitHub Actions runs
the deterministic test, typecheck, build, and browser suite; an opt-in real-model
contract evaluation remains outside CI.

## Implemented

- Drafting state contains only the optional Draft, immutable revisions, and
  revision proposals; output-format state and controls have been removed.
- Dedicated ThoughtForm Playwright testing hosts and a comprehensive discovery-session browser test covering coherent multi-idea exploration, enrichment, assessments, unresolved questions, every visible idea disposition action, user correction, focus transfer, request state, conversation ordering, and clearing without host infrastructure.
- Product-owned deterministic `TestConversationModel` for unit, integration, and browser scenarios.
- GitHub Actions validation for tests, typecheck, build, and Playwright Chromium.
- Opt-in hosted ThoughtForm contract and product-policy evaluation, excluded from CI.
- ThoughtForm client tests and hosted evaluations are colocated with the product; host and infrastructure packages retain only their mounting and adapter tests.

- Monorepo structure with `apps/client`, `apps/api`, and the intended `packages/*` boundaries.
- Root `pnpm` workspace configuration.
- Root TypeScript configuration.
- Repo-root absolute TypeScript import rule with workspace path resolution.
- `apps/client` Vite and React Router website host.
- Minimal `apps/client` Tailwind styling foundation and small owned site components.
- Accessibility-first UI guidance: semantic HTML first, React Aria Components for future complex interactive UI when genuinely needed.
- Public site accessibility baseline with skip link, semantic landmarks, visible focus states, and documented alt text policy.
- Repository-backed public routes for `/`, `/about`, and `/writing/:slug`, plus
  public product catalogue, overview, and privacy routes.
- Owner-only ThoughtForm workspace routes, including the temporary editor at
  `/products/thoughtform/editor` and saved conversations.
- Product-owned client request helper for the conversation endpoint.
- Host-owned React Router products route at `/products/:productSlug/*` that dispatches into product-owned route handling.
- ThoughtForm-owned client app surface under `packages/products/src/thoughtform/client`.
- ThoughtForm client files organised by responsibility under product pages,
  conversation capabilities, and workspace capabilities, with temporary and
  saved editor pages named explicitly as `TemporaryWorkspacePage` and
  `EditorPage`.
- ThoughtForm-owned API delivery surface under `packages/products/src/thoughtform/server/delivery/http`.
- API host mount for product API routes under `/products`.
- Product route access requirements for authenticated and owner-only ThoughtForm routes.
- Platform-wide `ACCESS_LEVELS` constant as the source of truth for owner and demo access-level values.
- Product roadmap context for ThoughtForm and the future Care Calendar health-tech learning product.
- Client-first host architecture decision: move toward Vite and React Router in staged tasks.
- Initial `apps/client` Vite and React Router scaffold with placeholder routes and dev proxy config.
- Shared public website shell ported into `apps/client`, including skip link, header/nav, footer, prose/layout primitives, and current public route content.
- Better Auth magic-link login, login verification, logout, session-aware header state, and client-side workspace gating ported into `apps/client`.
- Product mounting ported into the Vite client through React Router, with ThoughtForm overview, editor, and conversations routes dispatched from the host into the product-owned route renderer.
- Host-owned functional navigation adapter for product apps, with product-owned link styling preserved inside the product package.
- Security posture for the future client host: client route gates are UX only; API/server authorization is authoritative.
- Vite local API proxy for `/api/*` to the Hono API host.
- Vite local auth proxy for `/auth/*` to the Better Auth route on the Hono API host.
- Basic `apps/api` Hono server.
- `GET /health` API route.
- Better Auth handler mounted at `/auth/*` on the API host.
- `POST /products/thoughtform/conversation/respond` API route mounted by the host and handled by the ThoughtForm product package.
- Minimal magic-link sign-in page at `/sign-in`.
- Owner-only ThoughtForm saved-conversation list at `/products/thoughtform/conversations`, with explicit persistent creation and ID-addressed editors at `/products/thoughtform/conversations/:id/editor`.
- `packages/shared` API response, user/access, writing, usage, and product registry types.
- Product registry containing ThoughtForm, with lookup helpers by id and slug.
- ThoughtForm-owned shared conversation/domain contract types under `packages/products`.
- ThoughtForm interaction contracts separate discovery/composition activity,
  assistant moves, action-specific assistant readiness, and explicit user
  intention without a general conversation-state or lifecycle aggregate.
- ThoughtForm discovery now selects a grounded assistant move rather than
  returning a fixed probe, assesses reflection and composition readiness
  independently, and recognises explicit explore, reflect, and compose intention.
- The provider-neutral conversation schema derives domain enum values from
  product-owned `as const` sources, with one explicit discovery-move subset shared
  by schema generation and semantic validation.
- Pre-draft activity remains server-derived discovery. An early composition
  request remains visible intention even when the assistant reports important
  uncertainty, and `offer_draft` does not claim that a draft already exists.
- Invalid move, readiness, or intention classifications degrade independently to
  safe discovery metadata without corrupting the idea map or exposing structured
  output as conversation text.
- Conversation model context combines the bounded idea-map view with the newest
  coherent retained conversation suffix that fits under the complete-input
  boundary; truncated context never begins with an orphaned assistant reply.
- Conversation steering remains natural language plus explicit idea controls.
  The product has no suggested-reply contract, move buttons, persistent mode
  selector, or readiness meter; important uncertainty is explained in the
  assistant's conversational response.
- Workspace orchestration loads conversation context, invokes the conversation
  capability, retains complete turns through the product-owned store operation,
  and reports retained-turn events only after successful persistence.
- ThoughtForm idea-map baseline identifies and enriches stable ideas with
  concise titles, distilled syntheses, higher-resolution substance, unresolved
  questions, qualitative assistant exploration/importance assessments, parallel
  user interpretation, and user-controlled disposition.
- Idea-map policy currently permits twelve retained ideas, six active or focused
  ideas, and one focused idea; the limits are adjustable product policy rather
  than schema constraints and are marked for evidence-based review.
- The product supports active, focused, satisfied, parked, and dismissed ideas,
  with focus, satisfy, park, dismiss, reopen, and correction operations shared by
  direct UI actions and conversational interpretation.
- Conversation response and idea-map assessment use one structured model result.
  Valid responses degrade safely when proposed idea changes are invalid, and
  bounded model context prioritises focused/active substance without shrinking
  canonical retained substance.
- The product model port supplies a provider-neutral strict output schema, which
  the OpenAI Responses adapter enforces through Structured Outputs before the
  product applies its separate semantic validation.
- Opt-in, cost-gated hosted evaluation commands exercise sustained synthetic
  idea exploration. The Braintrust evaluation runs the complete ten-turn FIFA
  accountability scenario through Claude Sonnet and records native LLM spans,
  complete synthetic inputs and outputs, per-turn Idea Maps, latency, provider
  usage, and nine deterministic behavioural scores. Paid runs remain outside
  the deterministic test suite.
- Runtime-neutral observability contracts and direct Braintrust host assembly
  trace persistent owner conversation phases, provider usage, cache metadata,
  validation/repair, persistence, and correlated client-perceived duration.
  Temporary owner-workspace composition uses a no-op adapter and emits no Braintrust event.
- Meaningful idea-map changes create whole-map revision snapshots. Optimistic
  revision checks reject stale conversational or direct UI mutations, while the
  editor pauses same-tab mutating controls during an in-flight operation. Stale
  direct actions return the authoritative map so the browser can refresh without
  discarding the user's attempted correction.
- Idea-map syntheses and full substance are inspectable in the expandable tracker;
  assistant assessments are presented qualitatively without percentages or
  colour-only meaning, and direct actions provide local acknowledgement without
  another hosted call.
- Canonical idea-map content is restricted to user-expressed or explicitly
  user-adopted material. Assistant hypotheses remain transient conversational
  reasoning, are not displayed in the tracker, and cannot silently enter titles,
  syntheses, substance, or unresolved questions.
- Temporary idea maps share the existing conversation expiry and clearing
  lifecycle. Owner idea-map revisions are stored in owner-scoped Prisma records
  through generated migrations and atomic host adapter operations; every
  revision records both its source type and the originating operation ID.
- Minimal ThoughtForm server conversation service with contract-focused tests and a product-owned conversation model port.
- ThoughtForm conversation endpoint now reads existing conversation messages before calling the product conversation service.
- OpenAI-backed LLM adapter in `packages/ai`, using `OPENAI_API_KEY` and `OPENAI_MODEL`, with `gpt-5-mini` as the default.
- OpenAI Responses API requests explicitly disable optional application-state storage with `store: false`.
- ThoughtForm hosted model calls fail closed unless
  `HOSTED_AI_ENABLED=true` and a non-empty OpenAI API key are configured; the
  wider site and API continue running when the product is disabled.
- Disabled, unconfigured, or unavailable hosted AI never falls back to fake
  product responses; the fake LLM client is retained only as a deterministic
  test adapter.
- ThoughtForm enforces a provider-neutral 32 KiB complete-input boundary over
  system instructions, retained history, and the new message, measured in UTF-8
  bytes before model invocation or persistence changes.
- Every ThoughtForm model request carries a required provisional 1,024-token
  output cap through the product model port and provider-neutral AI client to
  OpenAI `max_output_tokens`.
- Stable hosted-disabled, hosted-unavailable, and input-too-large failures retain
  conversation state, expiry metadata, and rejected editor text for recovery.
- Host-owned `LlmConversationModelAdapter` composition bridge in a generic API adapter module.
- Product-owned affirmative privacy acknowledgement before ThoughtForm editor controls become available in the current browser session.
- One temporary in-memory conversation for the owner using the temporary workspace, with a fixed visible 24-hour deadline, authenticated restoration, immediate clearing, and safe unavailable-conversation recovery.
- Temporary conversation responses expose their fixed deadline without extending it, and atomic turn retention prevents an expired conversation from reporting an unretained model response as successful.
- Structured conversation client failures distinguish unavailable temporary conversations from unrelated request failures.
- Public host `/privacy` page for shared platform processing, with registry-driven links to public product-owned privacy pages.
- ThoughtForm-owned privacy route and lifecycle note covering model processing, conversation retention boundaries, provider behavior, and user choices.
- ThoughtForm overview and acknowledgement links to its product-owned privacy information.
- API host wiring that supplies the OpenAI-backed adapter to the ThoughtForm product conversation port while keeping provider details out of the product package.
- ThoughtForm product-owned `ConversationStore` persistence port.
- Host/API-owned in-memory `ConversationStore` adapter for the conversation endpoint.
- Prisma schema and generated initial SQL migration for ThoughtForm conversations and conversation messages.
- Prisma schema and generated SQL migration for Better Auth users, sessions, accounts, and verifications.
- Prisma-backed ThoughtForm `ConversationStore` adapter in `packages/db`.
- ThoughtForm conversations are associated with the authenticated owner user and all persistent reads are owner-scoped.
- Persistent conversation appends are owner-scoped in the database operation itself and allocate message positions through an atomic per-conversation sequence.
- Signed-in non-owner conversations are isolated in temporary in-memory stores by authenticated user.
- Saved-conversation route changes reset editor state before loading the newly requested conversation.
- ThoughtForm conversation list and detail pages use thin loading orchestrators with focused components for list, item, and state presentation; loading, error, empty, populated, and restored states have rendering regression coverage.
- Owner-only conversation list/detail API routes with not-found behaviour for missing or inaccessible conversation IDs.
- Deterministic saved-conversation labels derived from the first user message and conversations ordered by latest conversation activity.
- Generated owner-association migration applied to the Neon `dev` branch after clearing disposable legacy ThoughtForm development records.
- DB-side ThoughtForm conversation-store resolver that uses Prisma for owner sessions when `DATABASE_URL` is set and uses user-isolated in-memory storage for signed-in non-owner sessions or no-DB local fallback.
- Strict Prisma migration workflow: schema first, generated migrations only, no hand-edited migration files.
- Neon Postgres development database setup with a `dev` branch and applied initial migration.
- Local development docs and `.env.example` for database environment setup.
- Root `pnpm test` command using Vitest.
- Initial `packages/auth` access-level helper.
- Initial `packages/ai` LLM interface and fake LLM client.
- Initial Prisma-backed `packages/db` database client and ThoughtForm repository adapter.
- Initial `packages/products` package boundary.
- Standard product package shape using `shared`, `server`, and `client` boundaries.
- Product dependency boundary: products define required contracts, hosts provide infrastructure adapters.
- `AGENTS.md` repo instructions for future agents.
- Repo-native code quality and testing guidelines.
- `docs/decisions.md` decision log.
- ThoughtForm product planning docs live in `docs/products/thoughtform/`.
- ThoughtForm product architecture documents conceptually rich conversation,
  idea-map, draft, and workspace-orchestration capability boundaries.
- ThoughtForm contracts separate interaction-scoped discovery/composition
  activity, assistant moves, action-specific readiness, explicit user intention,
  and resource-derived lifecycle; the obsolete general conversation-state and
  phase contract has been removed without a catch-all replacement.
- `tasks/README.md` task index.
- `tasks/001-scaffold-repo.md` scaffold/context task record.

## Partially implemented

- Product registry types are platform-wide while the product definitions are owned by `packages/products` and used by the host product catalogue.
- `packages/ai` has provider-neutral streaming across Anthropic and OpenAI plus a separately located test fake, but no automatic provider routing or usage-limit enforcement yet.
- ThoughtForm conversation service is LLM-backed only when the hosted-AI kill switch, an explicit provider, and that provider's credential are configured. Sonnet 5 is the current baseline and GPT-5.6 Terra is the supported OpenAI comparison baseline, while comparative evaluation remains deferred.
- ThoughtForm persistence is selected by operation semantics: each admitted
  temporary workspace uses isolated ephemeral application memory, while owner-only
  ID-addressed conversation operations use Prisma when `DATABASE_URL` is
  configured.

## Not implemented

- Browser-held temporary-workspace persistence; current temporary work is
  ephemeral in API-process memory with best-effort restoration.
- Minimum authenticated portfolio-demo operations visibility and the explicit
  production portfolio-demo release policy/verification task. A future public
  beta or commercial release is a separate project.

## Known gaps / risks

- The retained Claude Sonnet Braintrust baseline completed all ten synthetic
  FIFA turns with no errors or repairs. Eight behavioural scores were 100%; the
  one-question score was 90% because the opening response asked two questions.
  Median turn latency was 28.0 seconds, maximum latency was 202.754 seconds,
  total usage was 79,676 tokens, no prompt-cache tokens were reported, and
  estimated cost was $0.31. Braintrust's non-streaming Anthropic wrapper reports
  `time_to_first_token` at full-response completion, so that field is not a true
  streaming first-token measurement. Mounted runtime time-to-first-token remains
  unavailable until the provider contract streams.
- A controlled Sonnet 5 medium-effort run kept the same FIFA scenario, prompt,
  output schema, and deterministic scorers. All nine behavioural criteria
  passed, including an improvement from 90% to 100% on one-question discipline.
  Compared with the default-high run, median latency fell from 28.0 to 15.463
  seconds, maximum latency from 202.754 to 19.252 seconds, and end-to-end runtime
  from 513.85 to 148.52 seconds. Reasoning tokens fell from 8,087 to 1,311,
  output tokens from 18,816 to 12,973, and estimated cost from $0.31 to $0.25.
  Complete-output inspection found no evident loss of empathy, conceptual
  continuity, or Idea Map quality in this synthetic conversation. Medium is the
  leading production candidate, but production remains unchanged until a
  separately approved adoption task.
- The ThoughtForm conversation prompt now follows a Claude-specific XML
  hierarchy with separately labelled role, interaction, style, safety,
  Discovery, readiness, Idea Map, provenance, saved-change, Draft, conflict,
  output, and dynamic workspace context. The clean medium-effort FIFA run kept
  all nine behavioural scores at 100%, used ten calls with no repairs, and
  produced a faithful, richer final Idea Map. Token use and cost remained close
  to the unstructured medium baseline, while median latency rose from 15.463 to
  17.300 seconds and two provider outliers raised the complete run from 148.52
  to 244.84 seconds. This single run does not establish whether that latency
  difference is prompt-driven; the structured prompt remains the Claude
  quality baseline for the next controlled optimisation.
- Anthropic now caches the stable ThoughtForm conversation instructions through
  one explicit five-minute ephemeral system block while receiving the changing
  workspace context in a separate uncached block. The retained FIFA run wrote a
  4,363-token prefix once and read the same prefix on each of the next nine
  turns, totalling 39,267 cache-read tokens. Estimated cost fell from $0.25 to
  $0.18, median latency from 17.300 to 15.669 seconds, and complete-run duration
  from 244.84 to 161.11 seconds. Eight behavioural scores remained 100%; the
  one-question score was 90% because turn two contained one rhetorical and one
  direct question. The Idea Map remained faithful. Conversation history and
  changing Idea Map state are not cached by this implementation.
- ThoughtForm conversation turns now start separate conversation and Idea Map
  model operations concurrently from the same user message and retained
  workspace. The assistant's structured response streams over a POST-initiated
  SSE response and is retained before the independently analysed Idea Map. The
  map update uses revision-checked replacement, does not consume the concurrent
  assistant response, and can fail without discarding the saved turn. Temporary
  temporary-workspace streaming remains unobserved; persistent owner streaming records content,
  provider usage, server and client first-token timings, response retention, and
  map retention through the existing Braintrust boundary.
- The controlled ten-turn FIFA split evaluation
  (`codex/thoughtform-fifa-split-streaming-20260805-1255`) passed all nine
  behavioural criteria with 20 model calls and no errors. It used 72,152 prompt
  tokens, 37,728 cache-read tokens, 4,192 cache-creation tokens, and 13,297
  completion tokens for 85,449 total tokens and an estimated $0.21. Wall time
  fell from the cached combined baseline's 161.11 seconds to 111.00 seconds
  (about 31%), while total tokens rose about 17% and estimated cost rose from
  $0.18 to $0.21 (about 17%). The split is therefore a perceived-latency
  optimisation with a measured cost trade-off, not a general efficiency win.
  The available dashboard session could not inspect protected per-turn rows, so
  no conclusion is recorded from Braintrust's malformed aggregate first-token
  display; mounted streaming timing is verified separately through owner
  observations.
- The mounted owner runtime now passes Sonnet 5 `medium` effort explicitly and
  records it on both conversation and Idea Map provider spans. Six synthetic
  FIFA turns confirmed a 2.481–33.107 second server first-token range with a
  6.241 second median; client first-token time ranged from 3.448–34.265 seconds
  with a 7.056 second median. The two cold calls were approximately 33 seconds,
  while the final warm call reached a 2.481 second provider and 3.448 second
  client first token. Median assistant retention was 11.489 seconds and median
  complete Idea Map phase time was 13.499 seconds. The six turns used 36,785
  input tokens, including 20,960 cache reads and 4,192 cache writes, plus 6,220
  output tokens and 971 reported reasoning tokens; estimated Sonnet-class cost
  was about $0.15 at standard published token and five-minute cache rates.
- Mounted verification also exposed that `EditorPage` discarded the stream
  callback argument. Provider deltas and Idea Map completion events therefore
  crossed HTTP correctly but were not applied by the persistent React editor.
  The wrapper now forwards those callbacks. A controlled component regression,
  the browser suite, and a post-fix owner turn confirm incremental response
  rendering followed by an independently applied Idea Map event.
- The current homepage is an empty writing collection and should not be treated as the finished public writing system.
- The fake LLM client remains as a deterministic test adapter but is not used by API composition.
- ThoughtForm conversation policy is implemented and hosted-evaluated;
  sustained owner use may still reveal calibration changes.
- Product-owned ports for auth/access and usage have not been introduced yet; they should be added only when a product service genuinely needs those dependencies.
- The Neon dev database is configured locally through `.env.local`, but those secrets are intentionally not committed.
- The in-memory conversation adapter remains the no-DB local fallback and holds temporary user-isolated state for the life of the API process.
- The current ThoughtForm editor UI is product-owned and can restore owner conversations, but remains a minimal interface rather than the final ThoughtForm product experience.
- Temporary owner-workspace writing and lifecycle rules are enforced across the
  client and API boundaries, but broader usage limits still need a later task.
- Auth exists as a minimal foundation, but production cookie/domain settings may need a deployment-specific pass later.
- Database and AI boundaries contain initial real implementation; usage and admin boundaries remain placeholders.
- Calibrated daily usage limits are implemented; production enablement still
  requires explicit budget environment values and the remaining launch tasks.
- Autonomous, user-correctable idea merging and splitting remains required before
  the editor is considered fully functional.
- Idea-count limits and idea-action acknowledgement UX should be reassessed after
  sustained complete-product and browser use; future public-user analytics need
  a distinct privacy policy. Current Langfuse content capture is restricted to
  owner and explicit synthetic-evaluation flows.

## Next recommended task

Implement the approved deterministic first stage of Task 039: representative
product-owned scenarios, mounted host composition, content-free Task 038 ledger
aggregation, and privacy checks. Before any paid Sonnet 5 measurement calls,
present the exact scenario matrix, repetitions, hosted-operation count, and cost
ceiling for separate explicit approval.

## 2026-08-13 — Task 039 hosted-usage measurement

- Defined six product-owned representative ThoughtForm journeys covering the
  approved Discovery, Draft, revision, saved-edit, short/long, and Idea Map
  structure cases. Three repetitions produce 108 expected hosted operations.
- Added a paid-run-gated mounted-host runner and a content-free database reader
  over the existing Task 038 attempt ledger. The default command prints the
  plan and cannot call the provider.
- Completed the separately approved hosted runs and prepared the content-free
  [measurement report](docs/products/thoughtform/usage-measurement-2026-08-13.md)
  with Task 040 calibration recommendations.
- Added a strict autonomous-structure precondition and ran the separately
  approved 12-operation targeted check. It stopped after the first journey's
  six successful attempts because the model proposed no merge or split; no
  second repetition or retry ran, and the investigated failure is recorded in
  the report.

## 2026-08-13 — Care Calendar learning-project foundation

- Added the initial Care Calendar learning, product-definition, safety,
  stakeholder, and care-journey documents under the product-owned boundary.
- Added a [Care Calendar product guide](packages/products/src/care-calendar/README.md)
  as a high-level status and navigation entry point. The linked documents remain
  the sources of truth, and no product implementation has started.

## Historical semantic-editor investigation

A constrained semantic Markdown editor was investigated and prototyped, then
rejected as outside the ThoughtForm product boundary. The canonical Draft
remains normalized plain text; document formatting belongs to the destination
tool. The reasoning and experimental findings are retained in
`docs/products/thoughtform/semantic-editor-investigation.md`.

The prototype was initially reported complete despite failing approved criteria
and repository rules. Its implementation has been reverted, but the engineering
failure is retained in
`docs/products/thoughtform/semantic-editor-implementation-failure.md`.
`AGENTS.md` now requires a requirement-by-requirement completion audit before
any implementation task can be reported complete.
## 2026-08-05 — ThoughtForm conversation-context size evaluation

- Added an evaluation-only comparison of full bounded history, four recent
  completed turns, and two recent completed turns using the synthetic FIFA
  conversation and identical progressive Idea Map snapshots.
- The 90-call Braintrust run found median useful TTFT of 4,847 ms, 4,491 ms, and
  3,987 ms respectively. Four turns also reduced median completion by 633 ms and
  input tokens by 7.5% without an observed quality or contract regression.
- Two turns had the best median but a 40.7-second worst case and is not
  recommended. Four turns warrants a separate mounted owner verification before
  any production adoption; production behavior remains unchanged.

## 2026-08-05 — Mounted four-turn history verification

- Compared full bounded history with four recent turns across two fresh mounted
  owner FIFA conversations using the real client, API, database, Anthropic,
  Braintrust, SSE, and asynchronous Idea Map flow.
- Four turns reduced final-turn input by 14.7% but was slower at median server
  TTFT (9,938 vs 8,380 ms) and provider completion (15,374 vs 14,096 ms). Both
  variants preserved the complete argument and unresolved practical tension.
- Kept full bounded history and removed the development experiment seam. Rapid
  automated submission also exposed a separate workspace-retention race after
  the conversation re-enabled but before Idea Map persistence settled.

## 2026-08-06 — Public launch-surface polish

- Added specific client-rendered titles and descriptions across public routes,
  with private authentication/workspace and not-found routes excluded from
  indexing. Canonical origins, social prerendering, sitemaps, and hosting remain
  intentionally deferred until deployment is selected.
- Removed anonymous login from public navigation while retaining the direct
  owner sign-in route, and changed its copy to describe private product access.
- Added human-readable published dates, routed site-privacy contact requests to
  the About contact section, replaced provisional Products-page copy, and added
  a teal asterisk favicon.
- Full tests, typecheck, build, diff checks, and mounted desktop/mobile route
  inspection passed. Public routes showed no horizontal overflow or browser
  warnings; the independently edited ThoughtForm registry summary was preserved.
