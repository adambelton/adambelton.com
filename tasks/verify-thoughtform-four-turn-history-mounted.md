# Verify ThoughtForm four-turn history in the mounted owner flow

## Goal

Verify whether retaining four recent completed conversation turns improves the
real owner experience without noticeable loss of continuity.

## Why this task is next

The controlled context-size evaluation found that four turns modestly improved
median useful TTFT, completion time, and input usage without an observed quality
or contract regression. Mounted verification is required before adoption.

## Scope

- Add a development-only host configuration for full or four-turn conversation
  history, with full history remaining the default.
- Apply the policy only to the owner conversation service; do not change the
  Idea Map analyser's history.
- Run two fresh owner conversations through the real client, API, database,
  Anthropic adapter, Braintrust observation, SSE stream, and asynchronous Idea
  Map update using the same ten-turn FIFA fixture.
- Compare latency, streaming, usage, Idea Map completion, reliability, and
  continuity, with particular attention to later turns.
- Produce a recommendation without changing the production default.

## Out of scope

- Two-turn history, summaries, provider-managed state, personal content, prompt,
  schema, model, effort, cache, Idea Map context, or production deployment.

## Expected files to create or modify

- Product-owned conversation context selection and focused tests.
- Host development configuration and mount tests.
- `.env.example`, local-development documentation, `progress.md`, and this task.

## Definition of done

- Full and four-turn FIFA conversations complete through the mounted owner flow.
- Braintrust traces and visible UI behavior verify streaming and Idea Map updates.
- Timing, usage, reliability, and qualitative differences are recorded.
- Full history remains the production default.
- Focused tests, full tests, typecheck, build, Playwright, frozen lockfile check,
  mounted verification, and branch-diff audit pass.

## Validation commands

```txt
pnpm exec vitest run packages/products/src/thoughtform/server/capabilities/conversation/conversation-service.test.ts apps/api/src/products/thoughtform/mount.test.ts
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm install --lockfile-only --offline --frozen-lockfile
git diff --check
```

## Risks / questions

- Two live sequences cannot remove provider variance.
- One FIFA conversation cannot prove safety for every correction or Draft flow.
- Stochastic Idea Map differences may affect later responses.
- Four turns should be judged on credible continuity and a surviving latency
  benefit, not a single raw timing win.

## Status

Complete and merged through PR #18.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** compare full and four-turn owner conversation
  history in the real mounted flow while leaving Idea Map history unchanged.
- **Important deferrals:** two turns, summaries, broader fixtures, production
  adoption, and every provider or prompt change.
- **Implementation decisions:** expose the smallest product-owned history policy
  through development-only host configuration; use fresh FIFA conversations and
  Braintrust traces; inspect later-turn continuity and asynchronous Idea Map UI.
- **Do not reopen without new evidence:** full history remains the production
  default, and this task does not adopt or deploy four-turn history.

## Mounted results

Two fresh owner conversations ran through the real client, API, Neon-backed
persistence, Anthropic adapter, Braintrust observation, SSE delivery, and
asynchronous Idea Map update:

- Full history: `17cc1fbd-8304-4a0e-b7e8-dd6ca19ff5f6`
- Four turns: `2880954c-ea80-4aae-a448-6677d5f0b6a3`

| Metric | Full history | Four turns |
| --- | ---: | ---: |
| Retained conversation turns | 10/10 | 10/10 |
| Provider calls experienced | 10 | 11 |
| Median server TTFT | 8,380 ms | 9,938 ms |
| TTFT range | 3,727–17,503 ms | 6,897–14,196 ms |
| Median provider completion | 14,096 ms | 15,374 ms |
| Final-turn input tokens | 5,203 | 4,440 |
| Final-turn input bytes | 16,574 | 13,470 |
| Provider errors | 0 | 0 |

The four-turn request reduced final-turn input by 763 tokens (14.7%) and 3,104
bytes (18.7%), but the mounted sequence was slower at both median TTFT and
completion. Provider variance dominates the saving at this conversation length.

Both final responses accurately reconstructed the complete argument and named
the same unresolved practical hinge: how diffuse withdrawal of football's
legitimacy becomes coordinated association action when associations have
short-term incentives to remain quiet or divided. The four-turn response relied
on the current Idea Map to retain established material outside its verbatim
history and showed no visible continuity loss.

The four-turn run produced one additional successful provider response that was
not retained. Automated input submitted the next user turn as soon as the
conversation textbox re-enabled, before asynchronous Idea Map persistence had
settled, and the UI reported: “The conversation changed while the response was
being retained.” Retrying after the Idea Map update succeeded. This race is not
caused by the four-turn context policy, but it is real mounted evidence that
conversation input can become available before the complete workspace update is
safe for another immediate submission.

## Recommendation

Keep full bounded history. The mounted run confirms that four turns can preserve
continuity when the Idea Map is rich, but it does not reproduce the offline
latency benefit. A 14.7% final-turn token reduction is not sufficient reason to
discard verbatim history without broader quality coverage or a clearer cost
constraint. The development-only history seam was therefore removed; production
and development defaults remain unchanged.

Treat the observed post-response workspace race as a separate reliability
finding. It should be proposed independently rather than folded into context
optimisation.

## Completion audit

- Both FIFA sequences used fresh persisted owner conversations and the same ten
  user messages through the real mounted host.
- Braintrust retained server TTFT, provider duration, input size, token, cache,
  output, and complete content data. The table uses exact samples and medians.
- The browser verified retained transcripts, final synthesis, Idea Map presence,
  successful SSE completion, and the visible workspace-conflict state.
- The four-turn implementation was development-only during verification and has
  been removed because it did not justify retention. No production behavior,
  default, prompt, schema, or Idea Map history changed.
- Focused tests passed (34 before the experimental seam was removed). The final
  repository suite passed 259 tests with 5 skipped; typecheck, build, frozen
  offline lockfile validation, all 3 Playwright scenarios, and
  `git diff --check` passed.
- The complete final branch diff contains only this product task record and the
  repository progress entry. The experimental product and host code, tests,
  environment entry, and local-development documentation were removed. There is
  no ownership violation, product behavior in a host, migration, duplicated
  decision, unsupported mounted claim, or production change. The unrelated
  pre-existing edit in `tasks/036-complete-demo-session.md` remains user-owned
  and outside this task.
