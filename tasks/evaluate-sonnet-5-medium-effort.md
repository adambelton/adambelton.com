# Evaluate Sonnet 5 medium effort

## Goal

Run the complete synthetic FIFA accountability conversation with Claude Sonnet
5 at medium effort and compare response quality, Idea Map behaviour, latency,
reasoning usage, total usage, and cost with the retained default-high baseline.

## Why this task is next

The default-high baseline used 8,087 reasoning tokens and had 202.754-second
and 114.536-second latency outliers. Effort is the smallest isolated provider
change likely to affect both latency and cost, and the retained FIFA content
makes its qualitative tradeoff directly inspectable turn by turn.

## Scope

- Add optional Anthropic effort configuration at the concrete provider boundary.
- Preserve existing production behaviour whenever effort is not configured.
- Configure medium effort only in the Braintrust FIFA evaluation.
- Run the unchanged ten-turn FIFA conversation and retain a distinct experiment.
- Compare complete responses, evolving and final Idea Maps, deterministic scores,
  reasoning and output usage, cost, and aggregate and per-turn latency.
- Record an evidence-based recommendation after inspecting the results.

## Out of scope

- Production effort changes.
- Prompt, scenario, schema, or scorer changes.
- Prompt caching, streaming, or prompt restructuring.
- Splitting conversation and Idea Map calls.
- Delta-based Idea Map output.
- Testing low, high, xhigh, max, or another model in this task.

## Expected files to create or modify

- `packages/ai/src/providers/anthropic-llm-client.ts` and its focused tests.
- `packages/products/src/thoughtform/testing/evaluations/braintrust-hosted-contract.ts`.
- `progress.md` and task records.

## Definition of done

- Braintrust records `output_config.effort` as `medium` on the Claude calls.
- Exactly ten FIFA turns complete, with repair calls separately accounted for.
- Every evaluation input remains synthetic FIFA content.
- Existing behavioural criteria run unchanged and their results are recorded.
- High-versus-medium qualitative and quantitative evidence is recorded.
- Production requests retain their existing effort behaviour by default.
- Tests, typecheck, build, frozen lockfile validation, and diff checks pass.

## Validation commands

```txt
pnpm vitest run packages/ai/src/providers/anthropic-llm-client.test.ts
pnpm vitest run packages/products/src/thoughtform/testing/evaluations/braintrust-fifa-scores.test.ts packages/products/src/thoughtform/testing/evaluations/hosted-conversation-evaluation.test.ts
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
git diff --check
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform-braintrust
```

## Risks / questions

- The hosted run makes ten paid Claude calls and may make repair calls.
- A single run exposes a meaningful quality tradeoff but cannot establish a
  stable latency distribution when provider latency is variable.
- Medium effort may reduce nuance or map quality despite retaining the same
  model, prompt, and schema; the complete outputs must therefore be inspected.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** test medium effort first; hold model, prompt,
  schema, FIFA messages, and scoring constant; keep the setting evaluation-only;
  judge quality turn by turn as well as through aggregate scores.
- **Important deferrals:** every caching and payload-reduction change, streaming,
  architectural separation, delta output, and other effort levels.
- **Implementation decision:** represent effort as optional configuration owned
  by the concrete Anthropic adapter rather than adding provider-specific meaning
  to the platform-neutral LLM request.
- **Do not reopen without new evidence:** do not substitute personal evaluation
  content for the approved synthetic FIFA conversation.

## Status

Complete.

## Completion record

- **Experiment:**
  `codex/thoughtform-fifa-sonnet-5-medium-effort-20260805-1109`
- **Experiment ID:** `dce9ba8c-ec6c-4e86-82a0-3f8dba1a6f77`
- **Braintrust project:** `ThoughtForm`
  (`9c56aca1-7e54-4e73-ace3-914d7d82fdc3`)
- **Experiment URL:**
  `https://www.braintrust.dev/app/AdamBelton.com/p/ThoughtForm/experiments/codex%2Fthoughtform-fifa-sonnet-5-medium-effort-20260805-1109`
- **Behaviour:** all nine deterministic criteria scored 100%. One-question
  discipline improved from the high-effort baseline's 90% to 100%; no repairs
  or model errors occurred.
- **Latency:** median turn latency fell from 28.0 to 15.463 seconds (44.8%),
  maximum latency from 202.754 to 19.252 seconds (90.5%), and complete-run
  duration from 513.85 to 148.52 seconds (71.1%).
- **Usage:** input tokens fell from 60,860 to 60,130; output tokens from 18,816
  to 12,973 (31.1%); provider-reported reasoning tokens from 8,087 to 1,311
  (83.8%); total tokens from 79,676 to 73,103 (8.2%). Neither run used cache.
- **Cost:** Braintrust estimated $0.25 versus $0.31 for default high, a reduction
  of approximately $0.06 or 19%.
- **Complete-output inspection:** medium preserved the distinction between FIFA and
  football, the movement from diffuse legitimacy to formal association power,
  structural rather than personnel accountability, and the unresolved problem
  of association coordination. Responses remained warm and reflective while
  becoming more concise. The final map retained one continuous active idea,
  reached revision 10, and preserved the unresolved practical tension.
- **Recommendation:** treat medium as the leading production candidate. Do not
  change production within this experiment; adoption needs separate approval.

## Completion audit

- **Isolated variable:** the evaluator alone supplies `medium`; the model,
  prompt, structured-output schema, ten FIFA messages, and scorers are unchanged.
- **Production isolation:** effort is optional concrete Anthropic-client
  configuration. Existing host construction supplies no value and therefore
  retains Sonnet 5's provider default.
- **Provider evidence:** the retained Claude spans record
  `output_config.effort: "medium"`; experiment metadata also records the effort.
- **Complete run:** Braintrust retained exactly ten successful LLM calls for ten
  turns, with no repair calls or errors.
- **Synthetic content:** the evaluator continues to select only the repository's
  `fifaAccountability` scenario; no personal fixture was added.
- **Quality evidence:** unchanged deterministic scores all passed, and complete
  response and Idea Map outputs were compared manually with the retained high
  baseline rather than relying only on aggregate scores.
- **Automated validation:** 228 tests passed with 5 hosted/browser tests skipped;
  typecheck, build, and frozen offline lockfile validation passed.
- **Architecture:** provider-specific effort remains in `packages/ai`; the
  product evaluation supplies adapter configuration without adding Anthropic
  semantics to product or platform-neutral request contracts.
