# Strengthen ThoughtForm's provider boundary and first-session experience

## Status

Completed.

## Goal

Make provider switching operationally safe, preserve ThoughtForm's product meaning across explicitly supported AI providers, prevent ungrounded assistant language from entering the idea map, improve draft coherence, and address pending-response feedback and site width before Task 036.

## Why this task is next

The initial Anthropic integration exposed that privacy presentation was coupled to runtime provider selection, the generic LLM contract obscured provider differences, provider schema compatibility could silently weaken product constraints, and observed idea-map, draft, and workspace behaviour needed correction before further model tuning.

## Scope

1. Centralise public AI-provider disclosure metadata, expose the active disclosure safely through host composition, render it dynamically, keep durable privacy language provider-neutral, and version acknowledgement only for material privacy changes.
2. Make ThoughtForm explicitly support Anthropic and OpenAI AI profiles. ThoughtForm owns supported profile semantics, prompts, structured-output projections, and evaluation expectations; the host selects and configures one supported profile backed by platform provider clients. Unknown providers and incompatible configurations fail closed.
3. Keep one authoritative product result contract while allowing each supported profile to use an explicit provider-compatible transport schema. Never silently weaken product meaning; reject unsupported schema use, validate product semantics after generation, permit at most one bounded repair attempt, and normalise refusal, truncation, schema incompatibility, invalid output, and transient failures.
4. Require proposed idea changes to cite valid conversation evidence. User-authored material is authoritative; assistant-originated wording may enter established material only when a user message explicitly accepts or restates it. Add the observed dog-loss regression.
5. Exclude unresolved questions from draft input, prevent resolved questions reappearing as draft questions, and compose multiple ideas around a coherent throughline rather than concatenating substances.
6. Keep the send control recognisable as Send while presenting an accessible, reduced-motion-aware animated response-forming indicator.
7. Set the host site's shared content maximum width to 1440px, preserving responsive gutters and mobile behaviour across representative host and ThoughtForm pages.
8. Update owning documentation, decisions, progress, task index, and requirement-by-requirement completion evidence.
9. Apply concise filenames to the ThoughtForm product brief, architecture, and historical implementation overview—without an initial `the-`—and update every repository reference.

## Out of scope

- Formal comparative model evaluation.
- Broad Sonnet prompt tuning beyond the identified provenance and composition defects.
- Streaming partial responses.
- Browser controls for provider or model selection.
- Unsupported arbitrary LLM providers.
- Database migrations unless trustworthy provenance cannot be represented without one; such a need must be reported before proceeding.
- Other Task 036 behaviour not named above.

## Expected files

- `packages/ai/src/contracts/`, `packages/ai/src/providers/`, and a role-specific public provider-metadata boundary.
- `apps/api/src/products/thoughtform/` host composition and adapters.
- ThoughtForm conversation, idea-map, drafting, shared contract, client privacy, workspace, testing, and evaluation owners.
- `apps/client` shared layout or style owner.
- `.env.example`, relevant READMEs, `docs/decisions.md`, `progress.md`, and `tasks/README.md`.

Exact placement must follow existing ownership and architectural roles; this task does not approve a new architectural pattern.

## Definition of done

- Changing `AI_PROVIDER` changes the displayed active provider without editing privacy React copy; changing a model within one provider requires no privacy-copy change.
- ThoughtForm accepts only its explicitly supported Anthropic and OpenAI profiles; unknown providers fail configuration clearly and no arbitrary `LlmClient` is treated as automatically compatible.
- Provider-specific prompts and transport schemas are visible and testable, with one common authoritative product result contract.
- No adapter silently weakens product meaning. Invalid semantic output receives at most one repair attempt and then fails explicitly.
- The dog-loss regression does not persist assistant-originated descriptions such as low-energy, flat, or indifferent unless the user adopts them; invalid evidence prevents an idea change.
- Draft input excludes unresolved questions and the multi-idea regression produces an intentionally structured draft rather than concatenated substances.
- Pending responses show an accessible animated indicator while the button remains Send, including reduced-motion behaviour.
- The host content container expands to but never exceeds 1440px across representative pages.
- The configured Anthropic flow works through the real mounted host.
- The product brief, architecture, and historical implementation overview use concise `thoughtform-*.md` filenames and no stale repository references remain.
- Relevant tests, typecheck, build, browser validation, documentation, branch-diff audit, and completion audit pass.

## Validation commands

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
git diff --check
```

Focused validation must also cover provider profiles and schemas, provenance and composition regressions, bounded repair and normalised failures, accessible status and reduced motion, multiple viewport widths, and a synthetic mounted Sonnet conversation.

## Risks and implementation questions

- Evidence validation proves that support exists but cannot alone prove semantic faithfulness; conservative rules, product validation, and regression evaluation are also required.
- Ambiguous agreement does not count as acceptance of assistant wording.
- The single repair attempt adds latency and cost only after invalid output and must remain observable.
- Centralised provider policy metadata still needs periodic review.
- Model-family compatibility must be strict enough to protect tuned behaviour without hard-coding a single model slug unnecessarily.

## Approval record

- **Approved:** 4 August 2026.
- **Intentional boundaries:** ThoughtForm explicitly supports Anthropic and OpenAI profiles; the host selects only from that list. The semantic product contract remains common, while prompting and transport schemas may be provider-specific. The whole host site, not only ThoughtForm, uses the shared 1440px maximum width.
- **Important deferrals:** formal provider/model evaluation, broad prompt tuning, streaming, browser provider selection, and remaining Task 036 work.
- **Open implementation decisions:** the precise role-specific paths for profile and disclosure contracts; conservative model-family compatibility; whether validated evidence remains proposal-only or warrants persisted provenance without a migration.
- **Do not reopen without new evidence:** arbitrary provider support, a forced lowest-common-denominator transport schema, product-only width ownership, or coupling privacy acknowledgement versions to model changes.

## Completion audit

- **Runtime disclosure:** `packages/ai/src/disclosure/provider-disclosures.ts`, the host `/ai-disclosure` endpoint, and the product disclosure loader make the selected provider dynamic without exposing configuration. The real mounted host displayed Anthropic and both supported subprocessors.
- **Supported profiles:** `hosted-ai-profile.ts` accepts only Anthropic Sonnet 5 and OpenAI GPT-5 Mini. Mount tests prove unknown model slugs fail closed. Provider transport projection now occurs in the ThoughtForm adapter; the generic Anthropic client sends the supplied schema unchanged.
- **Structured validation and repair:** conversation output remains product-validated, proposed idea failures receive at most one repair request, and provider stop reasons remain explicit at the platform adapter boundary. Profile and provider tests pass.
- **Provenance:** proposed ideas require exact user-message evidence. The dog-loss regression rejects the observed unaccepted assistant framing. A mounted Sonnet turn retained the exact user-established substance, while keeping the assistant's richer reflection only in conversation history.
- **Composition:** draft material no longer includes `unresolvedQuestions`; composition explicitly requests a coherent throughline without adding connective meaning. Unit and browser drafting flows pass. A two-idea Sonnet sample produced one integrated paragraph preserving autonomy and security as unresolved concerns rather than concatenated summaries.
- **Response feedback:** the send button remains Send, the motion-safe indicator is exposed as a live status, and the real mounted Sonnet request displayed it until completion.
- **Width:** the shared host `Container` owns `max-w-[1440px]`; its focused test proves the shared class and the production build includes it. Responsive product browser scenarios pass at their configured viewport.
- **Acknowledgement recovery:** mounted testing found and fixed a pre-existing transient-editor race by entering restoring state before acknowledgement changes the page.
- **Document names:** the product brief, architecture, and historical overview use concise `thoughtform-*.md` filenames; repository search found no stale `the-thoughtform-*` references.
- **Validation:** `pnpm test` passed 215 tests with 5 skipped; `pnpm typecheck`, `pnpm build`, `pnpm test:e2e` (3 scenarios), and `git diff --check` passed. Real mounted Anthropic disclosure, response-forming status, conversation response, and grounded idea substance were inspected through the authenticated host. The synthetic temporary conversation was removed when the isolated in-memory API host stopped.
- **Branch audit:** no database migration was introduced. Product profile meaning remains in `packages/products`; provider mechanisms and disclosure facts remain in `packages/ai`; active selection remains in the API host; shared width remains in the client host. Pre-existing Task 036 edits were preserved.

## Known follow-up

The bounded multi-idea sample was coherent but still used minor connective phrasing beyond the exact supplied sentences. The strengthened prompt prohibits new connective meaning, but comparative evaluation and systematic faithfulness scoring remain deliberately deferred rather than being overstated by this task.
