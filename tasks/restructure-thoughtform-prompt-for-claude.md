# Restructure the ThoughtForm prompt for Claude

## Goal

Restructure the ThoughtForm conversation system prompt according to Anthropic's
current Claude and Sonnet 5 prompting guidance, then compare the unchanged
medium-effort FIFA evaluation with the retained medium-effort baseline.

## Why this task is next

The current prompt is a long array joined into one unlabelled paragraph and
mixes role, conversational behaviour, product contracts, provenance rules, and
dynamic workspace context. Clear XML sections and explicit context boundaries
are worthwhile for Claude instruction-following and create a sound basis for a
later, separately measured caching experiment.

## Scope

- Map every existing prompt requirement before replacing the prompt.
- Organise stable instructions into descriptive XML sections following
  Anthropic guidance.
- Separate dynamic Draft and Idea Map context from stable instructions.
- Prefer positive, direct instructions where that preserves the intended rule.
- Consolidate genuinely duplicated instructions without weakening safety,
  provenance, readiness, Draft, conflict, or user-direction constraints.
- Structure the provenance-repair instruction consistently.
- Keep Claude Sonnet 5 fixed at medium effort.
- Run the unchanged ten-turn FIFA evaluation and retain a distinct Braintrust
  experiment.
- Compare complete responses, Idea Map evolution, behavioural scores, latency,
  and provider usage with the retained medium-effort experiment.

## Out of scope

- OpenAI compatibility or prompt optimisation.
- A provider-neutral or hybrid prompt design.
- Changing the output schema, FIFA scenario, or scoring rules.
- Few-shot examples.
- Prompt caching or provider content-block changes.
- Streaming, delta output, or splitting conversation and Idea Map calls.
- Production effort changes.

## Expected files to create or modify

- `packages/products/src/thoughtform/server/capabilities/conversation/conversation-service.ts`.
- Focused conversation-service tests.
- `progress.md` and task records.

## Definition of done

- Stable instructions have explicit, readable XML sections.
- Dynamic workspace context is clearly delimited and safely encoded.
- Every prior prompt requirement maps to an equivalent retained instruction or
  an explicitly identified unchanged schema/server validation responsibility.
- The output schema, FIFA inputs, scorers, model, and medium effort are unchanged.
- The ten-turn hosted run completes and its qualitative and quantitative
  comparison is recorded.
- Tests, typecheck, build, frozen lockfile validation, and diff checks pass.

## Validation commands

```txt
pnpm vitest run packages/products/src/thoughtform/server/capabilities/conversation/conversation-service.test.ts
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
git diff --check
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform-braintrust
```

## Risks / questions

- Consolidation can accidentally remove a semantic distinction even when two
  instructions appear repetitive; the requirement mapping mitigates this.
- XML and whitespace may increase prompt characters even if instruction prose
  becomes shorter.
- Better structure may improve quality without improving latency.
- The hosted comparison requires another paid ten-call Claude run.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** optimise specifically for Claude using Anthropic's
  guidance; keep Sonnet 5 medium effort and all evaluation variables fixed; do
  not compromise the structure for hypothetical OpenAI compatibility.
- **Important deferrals:** OpenAI evaluation and provider-specific prompt
  selection, caching, content blocks, streaming, delta output, architectural
  separation, and schema changes.
- **Implementation decision:** use descriptive XML sections and safely encoded
  dynamic context while retaining product semantics and server-side validation.
- **Do not reopen without new evidence:** a provider-neutral hybrid prompt is not
  the objective of this task; it can only be evaluated after provider-optimised
  baselines exist.

## Status

Complete.

## Completion record

- **Clean experiment:**
  `codex/thoughtform-fifa-claude-structured-prompt-v2-20260805-1132`
- **Experiment ID:** `e2cbb469-e260-4381-965e-90bb6a66a38a`
- **Braintrust project:** `ThoughtForm`
  (`9c56aca1-7e54-4e73-ace3-914d7d82fdc3`)
- **Experiment URL:**
  `https://www.braintrust.dev/app/AdamBelton.com/p/ThoughtForm/experiments/codex%2Fthoughtform-fifa-claude-structured-prompt-v2-20260805-1132`
- **Diagnostic experiment:** the first structured run
  (`4cefd855-518b-4641-a4b6-efa2b596dab2`) exposed that Anthropic's projected
  structured-output schema did not enforce `maxItems: 3`. Turns 3 and 8 returned
  four unresolved questions, causing two repair calls and a 90% structured-output
  score. Restoring the explicit prose limit produced the clean run.
- **Behaviour:** all nine unchanged deterministic criteria scored 100%. The
  clean run made exactly ten calls, with no repairs or model errors.
- **Quality:** complete-output inspection found the responses warm, concise,
  and conceptually faithful. The final Idea Map retained one continuous active
  idea, preserved the two-part legitimacy and formal-power mechanism, and kept
  the practical coordination tension unresolved. Final substance increased
  from 1,847 to 2,098 characters while the final reflection became more concise.
- **Usage:** input tokens changed from 60,130 to 60,692, output tokens from
  12,973 to 12,799, reasoning tokens from 1,311 to 1,650, and total tokens from
  73,103 to 73,491. Neither run used caching; estimated cost remained $0.25.
- **Latency:** median turn latency changed from 15.463 to 17.300 seconds. Two
  outliers of 76.085 and 45.669 seconds raised maximum latency from 19.252 to
  76.085 seconds and complete-run duration from 148.52 to 244.84 seconds. A
  single run cannot distinguish prompt effect from provider variance.

## Requirement mapping

- Original role and outcome assumptions map to `role` and `interaction_policy`.
- Advice, uncertainty, question discipline, and tone map to
  `interaction_policy` and `conversation_style`.
- Crisis and clinical boundaries map to `safety_policy`.
- Discovery, move, and intention distinctions map to `discovery_contract`.
- Reflect and compose advisory rules map to `readiness_contract`.
- Identity, disposition, actions, continuity, and the explicit three-question
  limit map to `idea_map_contract`.
- First-person canonical material, excluded assistant hypotheses, and exact
  user evidence map to `provenance_contract`.
- Attached saved-edit interpretation rules map to `saved_change_contract`.
- Conversation-versus-Draft revision boundaries map to `draft_contract`.
- Conflict recognition, resolution, and richer-current-language rules map to
  `conflict_contract`.
- Mechanical output shape remains in the unchanged schema and is referenced by
  `output_contract`; the provider-projection finding demonstrates that limits
  not reliably enforced by the projected schema must remain explicit prose.
- Draft state and safely XML-escaped Idea Map JSON map to `workspace_context`.

## Completion audit

- **Claude-specific structure:** the production prompt uses descriptive XML
  sections following Anthropic guidance, without OpenAI-specific compromise.
- **Stable versus dynamic context:** all stable contracts precede one separately
  delimited `workspace_context`; Draft text and Idea Map JSON are XML-escaped.
- **Semantic preservation:** the requirement mapping above accounts for every
  previous instruction group; focused tests assert the most important contracts
  and every dynamic Draft-state form.
- **Controlled comparison:** Sonnet 5, medium effort, the output schema, FIFA
  messages, and all scorers were unchanged.
- **Hosted evidence:** the retained clean experiment contains ten complete turns,
  ten LLM calls, no repairs, all scores, raw output, Idea Maps, and provider usage.
- **Synthetic-only evaluation:** the evaluator remains fixed to the repository's
  FIFA scenario and adds no personal content.
- **Automated validation:** 228 tests passed with 5 hosted/browser tests skipped;
  typecheck, build, and frozen offline lockfile validation passed.
- **Architecture:** the change remains within the product-owned conversation
  capability and introduces no provider dependency, persistence change, host
  behaviour duplication, or migration.
