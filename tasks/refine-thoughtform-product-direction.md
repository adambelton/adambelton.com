# Refine ThoughtForm product direction

## Goal

Update the codebase documentation so ThoughtForm is consistently described as
a conversational thinking workspace whose intended culmination is a coherent
first-person articulation, while recording AI-assisted cathartic journaling and
the open-source/hosted model as positioning and commercialisation concepts rather
than current clinical claims, functionality, or company strategy.

## Approval record

Approved by Adam on 2026-08-08, with the following intentional boundaries:

- Articulation is the intended culmination of the experience and probably the
  moment where ThoughtForm proves its value. It is where the expected recognition
  and potential cathartic benefit principally live.
- Articulation is not mechanically required. A user may stop earlier or leave
  matters unresolved, but no-Draft use must not be presented as an equivalent
  intended endpoint.
- The earlier claim that the absence of a universal completion state settled
  articulation's product importance was incorrect and must not be preserved.
- Existing product and implementation terminology remains stable unless a term
  clearly cannot accommodate the refined positioning.
- Any proposed terminology rename, addition, or removal requires Adam's explicit
  approval before it is made. Explanatory definitions may be corrected without
  renaming their concepts.
- User-facing product-page and interface copy is intentionally deferred to a
  separate pass.
- The open-source, free-prompt, hosted-service, and non-expiring-credit model is
  conceptual. It is not launched functionality or current company strategy.
- “Cathartic journaling” is accessible category positioning, not a claim of a
  validated therapeutic outcome.

There are no approved terminology changes. There are no implementation decisions
left open unless the audit finds a term that clearly does not fit; work must pause
for approval before making such a change.

## Why this task is next

The previous conversational-thinking correction removed much of the old writing-
tool framing, but it understated articulation's product importance and predates
the refined category, philosophy, and possible business model. Authoritative
documentation should carry the current direction before more product work is
planned or assessed against it.

## Scope

- Audit authoritative and supporting ThoughtForm documentation for conflicting
  product-purpose claims.
- Align the product journey around Explore, Inspect, and Articulate without
  inventing rigid runtime phases or renaming current domain concepts.
- Record “something is bothering you, but you cannot put your finger on why” as
  the accessible gateway use case rather than the whole product scope.
- Present articulation as the intended culmination and principal value-
  realisation moment while allowing a user to stop earlier.
- Make user authority, inspectability, uncertainty, mixed feelings, unresolved
  tensions, agency, and non-dependency explicit product principles.
- Document AI-assisted cathartic journaling as accessible non-clinical category
  positioning.
- Distinguish implemented behaviour, current portfolio/demo intent, and future
  commercialisation concepts.
- Document the conceptual open-source core, freely available conversational
  prompt, craft-led hosted service, and non-expiring usage-credit model.
- Identify implementation surfaces that retain older writing-tool assumptions
  without changing runtime behaviour.
- Update progress and decision records with the refined direction.

## Out of scope

- Product-page, interface, privacy-page, or other user-facing copy.
- Runtime behaviour, prompts, evaluations, tests, API contracts, schema, or
  migrations.
- Renaming `Draft`, drafting, compose, Composition, Discovery, Idea Map,
  conversation, workspace, or another current term without separate approval.
- Launching open-source distribution, publishing the standalone prompt, adding
  billing, or implementing a hosted commercial service.
- Claims of validated therapeutic, wellbeing, or mental-health outcomes.
- Rewriting historical completed-task records except for a clear status note
  needed to prevent historical direction being mistaken for current authority.

## Expected files to create or modify

- `README.md`
- `packages/products/src/thoughtform/README.md`
- `docs/products/thoughtform/thoughtform-product-brief.md`
- `docs/products/thoughtform/terminology.md` for explanatory alignment only
- `docs/products/thoughtform/thoughtform-architecture.md`
- `docs/products/thoughtform/privacy-and-data-lifecycle.md`
- `docs/product-roadmap.md`
- `docs/decisions.md`
- `tasks/README.md`
- this task record
- `progress.md`

Other documentation or source comments may change only if the audit finds a
current, misleading product-purpose claim. User-facing content under
`apps/client/src/content` and product UI components remains unchanged.

## Definition of done

- Authoritative documentation consistently presents ThoughtForm as
  conversational reflective sense-making rather than AI writing.
- Explore, Inspect, and Articulate are explained as the product flow without
  becoming stored phases or renamed implementation concepts.
- Articulation is the intended culmination and likely value-realisation moment;
  stopping earlier remains valid but is not described as an equivalent intended
  endpoint.
- “Cathartic journaling” is clearly category positioning rather than a
  therapeutic claim.
- Reflective technology making the user more capable, not replacing judgement,
  is a central principle supported by concrete authority and inspectability
  rules.
- Current implementation, portfolio/demo intent, and conceptual
  commercialisation are clearly distinguished.
- Open source, the reusable prompt, hosted service, and usage-credit pricing are
  not described as launched.
- Accurate technical terminology remains unchanged.
- Remaining implementation mismatches are documented rather than silently
  changed.
- Documentation search, tests, typecheck, build, and diff checks pass.

## Validation commands

```sh
rg -n -i "AI writing|writing tool|cathart|therap|wellbeing|commercial|open.source|subscription|usage credit|articulat|completion|publishing|audience|format" README.md docs tasks progress.md packages/products/src/thoughtform
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

Every retained search result must be current, deliberately historical, or an
ordinary technical use whose meaning remains accurate. The complete branch diff
must also be audited against the approved scope and definition of done.

## Risks / questions

- Earlier documents conflate “not mechanically required” with “optional in
  product importance”; the correction must preserve flexibility without
  diminishing articulation.
- Commercialisation concepts must not contradict the current portfolio/demo
  operating intent.
- Open source must remain an intended model unless repository licensing and
  release evidence establish otherwise.
- Accurate Draft and Composition language can sound writing-oriented in
  isolation; explanatory context should resolve that without destabilising
  implemented contracts or migration history.

## Status

Completed on 2026-08-08.

## Completion audit

### Scope and definition-of-done evidence

- **Conversational reflective sense-making:** the root and product READMEs,
  canonical product brief, architecture, roadmap, and Decision 059 use Explore,
  Inspect, and Articulate and explicitly reject the AI-writing-tool model.
- **Articulation hierarchy:** the brief's core journey and principles,
  architecture goals and invariant 14, terminology explanation, roadmap, and
  Decision 059 define articulation as the intended culmination and likely value-
  realisation moment. They allow earlier stopping without presenting it as an
  equivalent intended endpoint or adding a stored completion state.
- **Cathartic-journaling boundary:** the brief, product privacy note, roadmap,
  and Decision 059 present the phrase as accessible possible positioning and
  explicitly reject promised, therapeutic, clinical, diagnostic, crisis, or
  scientifically validated outcomes.
- **User capability and authority:** the brief makes capability rather than
  judgement replacement the central principle and records inspectability,
  correctability, uncertainty preservation, and anti-dependency rules. The
  architecture and Decision 059 preserve these as durable constraints.
- **Operating-model distinctions:** the brief's product context and conceptual
  commercialisation section, roadmap, Decision 059, and progress record separate
  implemented behaviour and portfolio intent from possible future open-source,
  prompt, hosted-service, and usage-credit models.
- **No launched-model claims:** the brief and Decision 059 explicitly defer
  licensing, distribution, self-hosting support, prompt publication, hosted
  operation, billing, and pricing to separately approved work.
- **Terminology stability:** no product or implementation concept was renamed,
  added, or removed. The terminology reference changes only the explanatory
  importance of articulation and workspace cardinality. `Draft`, drafting,
  compose, Composition, Discovery, Idea Map, conversation, and workspace remain.
- **Implementation mismatch reporting:** `progress.md` records the mounted
  overview's “when it is useful” hierarchy and the discovery prompt's “optional
  articulation” policy as separately proposed follow-up work. Neither user-facing
  copy nor runtime behaviour changed. Existing no-Draft evaluation coverage is
  retained as non-coercion evidence rather than an equal-endpoint claim.
- **Historical material:** the explicitly historical implementation overview
  now warns that its “Socratic writing tool” example is superseded. Earlier ADR
  and progress wording remains as historical evidence with Decision 059 and the
  current progress record identifying the precise supersession.

### Complete branch-diff audit

- The complete diff from `main` contains documentation and task records only;
  no application source, prompt, interface copy, evaluation implementation,
  contract, schema, migration, adapter, or product behaviour changed.
- Product meaning remains in the canonical ThoughtForm documentation and product
  guide; host/product ownership and dependency direction are unchanged.
- No product presentation or behaviour moved into a host, and no production or
  test implementation was duplicated.
- Decision 059 settles the approved conceptual corrections without reopening or
  renaming existing domain concepts.
- `progress.md`, the roadmap, READMEs, privacy guidance, and Decision 059 qualify
  current versus conceptual claims and do not claim launched open-source,
  commercial, pricing, therapeutic, or clinical status.
- No migration was required or created.

### Validation evidence

- Documentation audit search completed with every retained match treated as
  current, explicitly superseded/historical, or accurate technical language.
- `pnpm test`: 91 files passed and 2 skipped; 325 tests passed and 5 skipped.
- `pnpm typecheck`: passed for all workspace projects.
- `pnpm build`: passed, including the Vite production client build.
- `git diff --check`: passed.
