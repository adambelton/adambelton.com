# Polish ThoughtForm conversation streaming

## Goal

Make rapid ThoughtForm turns reliable and make streamed assistant responses feel
continuous and remain visible without delaying the next user message for the
Idea Map.

## Why this task is next

Mounted testing confirmed that assistant streaming and the asynchronous Idea Map
update work, but also exposed three connected problems: a later turn can collide
with the preceding map-only write, provider chunks appear as large visual jumps,
and a growing response can leave the visible conversation viewport.

## Scope

- Reconcile an assistant-turn retention conflict when the conversation messages
  are unchanged and only the Idea Map revision advanced.
- Preserve a genuine conflict when the conversation itself changed.
- Rebase a completed Idea Map analysis onto the latest safely reloadable map
  instead of overwriting a newer revision.
- Keep the composer available as soon as the assistant turn is retained; do not
  wait for Idea Map completion.
- Buffer canonical provider deltas and reveal them with a
  `requestAnimationFrame`-driven, backlog-aware typewriter effect inspired by
  Blackout's Matchroom.
- Preserve the exact canonical assistant text, flush safely at lifecycle
  boundaries, honour reduced-motion preferences, and avoid per-character live
  announcements.
- Follow response growth while the reader is at the bottom, stop following when
  they deliberately scroll upward, and resume near the bottom or when they send
  a new message.
- Add focused server, client, and browser regression coverage.

## Out of scope

- Blocking the next user message until the Idea Map settles.
- Serialising the two LLM calls or retrying a paid provider generation.
- Durable background jobs or cross-process work queues.
- Prompt, model, schema, context-window, cache, or reasoning-effort changes.
- Unicode-output normalisation; the observed unusual characters remain a
  separate follow-up.
- A broader workspace layout redesign.

## Expected files to create or modify

- ThoughtForm streaming workspace application coordination and focused tests.
- ThoughtForm conversation presentation components and focused tests.
- ThoughtForm browser scenarios where the mounted interaction needs coverage.
- The ThoughtForm README if its documented flow changes.
- `progress.md` and this task record.
- `docs/decisions.md` only if implementation establishes a new durable
  concurrency contract.

## Definition of done

- A following message is accepted after the prior assistant is retained even if
  the prior Idea Map write completes in between load and retention.
- Real concurrent conversation changes still return a conflict and no turn is
  duplicated or reordered.
- A completed map analysis is applied against a current safe revision and never
  silently overwrites a newer map.
- The composer becomes usable at assistant completion, independently of the map.
- Large and irregular SSE chunks render as a smooth visual stream while the
  eventual displayed and retained text exactly matches the canonical response.
- Reduced-motion users receive the canonical text without the typewriter effect.
- Incoming text stays visible only while the reader is following the bottom;
  deliberate upward scrolling is respected and sending resumes following.
- Existing provider and client latency observations retain their meanings.
- Focused tests, full tests, typecheck, build, frozen lockfile validation,
  Playwright, mounted browser verification, and diff checks pass.

## Validation commands

```txt
pnpm exec vitest run <focused streaming application and client tests>
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
pnpm test:e2e
git diff --check
```

## Risks / questions

- Optimistic map rebasing must distinguish a harmless map-only advance from a
  newer conversation turn and must not turn a stale analysis into an overwrite.
- A visual buffer must not redefine response-completion timing or retain text
  different from the provider's canonical completion.
- Automatic scrolling must account for content growth, not only appended list
  items, while remaining stable in browser and test environments.
- The animation must remain subtle for short responses and catch up quickly
  enough that it does not replace network latency with presentation latency.

## Approval record

- **Approved:** 5 August 2026 by Adam after mounted testing of split streaming.
- **Intentional boundaries:** the next message remains available immediately
  after assistant retention; reconciliation belongs on the server; SSE remains
  the transport; Matchroom supplies the visual principle rather than an
  audio-timed implementation.
- **Important deferrals:** Unicode normalisation, model and prompt work, durable
  jobs, cross-process sequencing, and broader layout changes.
- **Implementation decisions:** exact optimistic retry bounds, animation pacing,
  and the focused product-owned presentation abstraction may be settled during
  implementation while preserving the approved observable behaviour.
- **Do not reopen without new evidence:** waiting for the Idea Map before
  enabling Send is not acceptable; provider chunk boundaries should not dictate
  visual cadence; deliberate manual scrolling must be respected.

### Corrective amendment

- **Approved:** 5 August 2026 by Adam after the first mounted reveal pass.
- **New evidence:** backlog-proportional pacing drained most responses in about
  200 ms and felt too fast; locally revealed text after provider completion did
  not keep the final line visible; a literal `\u2014` escape appeared in visible
  assistant text.
- **Approved correction:** use a target character rate with bounded catch-up,
  follow rendered-height growth while bottom-follow is active, and harden the
  structured response-field decoder so chunked and doubly escaped Unicode
  sequences converge on the same canonical display text.
- **Boundary retained:** this is response-field decoding, not general text or
  repository-wide Unicode normalisation.

## Status

Completed on 5 August 2026.

## Completion audit

### Scope

- **Map-only conversation reconciliation:** turn retention checks the expected
  message count as well as the map revision. One persistence-only retry reuses
  the generated response when messages are unchanged; focused tests prove a
  genuine concurrent turn still conflicts without duplication or reordering.
- **Safe Idea Map rebasing:** completed analysis is reapplied to the latest map
  with one bounded optimistic retry. Updates to ideas or conflicts that changed
  since the analysis began are filtered rather than overwritten; unrelated new
  material is preserved.
- **Independent interaction:** the existing `assistant_completed` client
  boundary remains unchanged, so Send becomes available without awaiting the
  Idea Map. No paid provider call is retried.
- **Smooth reveal:** canonical assistant text is buffered on animation frames at
  36 characters per second. Catch-up begins only beyond a 300-character backlog
  and is capped at 70 characters per second. A completed response still enters
  the buffer when provider delta and completion events arrive in one render
  batch. Reduced-motion users receive the complete text immediately.
- **Viewport following:** a content `ResizeObserver` follows rendered-height
  growth while the reader is at the bottom. Manual scroll-up disables following
  until the reader returns near the bottom or submits another message.
- **Structured-text decoding:** chunk-split and doubly escaped Unicode sequences
  are decoded within ThoughtForm conversation text. New canonical responses and
  previously retained assistant messages display consistently; user-authored
  text is not transformed.
- **Observability:** existing provider first-token, client first-token, response,
  application, and persistence observation names and boundaries are preserved.

### Definition of done

- **Concurrency:** application tests cover map-only reconciliation, genuine
  message-history conflict, map rebase, stale-analysis protection, exactly-once
  retention, and recoverable map failure.
- **Presentation:** component tests cover the 36-character target rate,
  reduced-motion behavior, provider-chunk independence, rendered-height
  following, manual scroll-up, Send-triggered resumption, and historical escape
  decoding.
- **Canonical text:** decoder and conversation-service tests cover arbitrary
  chunks, quotes, newlines, split Unicode escapes, double escaping, and equality
  between streamed and completed text.
- **Mounted verification:** the real Vite/API/Prisma/Anthropic owner flow ran
  with no pending migrations. Inspection measured a zero-pixel bottom gap at
  completion, no literal escape in new output, and corrected display of twelve
  historical em dashes. Adam assessed the adjusted reveal as much better and
  requested the final incremental slowdown to 36 characters per second.
- **Validation:** 271 tests passed with 5 intentional skips; recursive
  typecheck, production build, frozen offline lockfile validation,
  `git diff --check`, and all 3 Playwright journeys passed after the final pace.

### Complete branch-diff audit

- Product concurrency and presentation meaning remain in `packages/products`;
  host and database changes are limited to contract fixtures.
- Delivery routes remain thin, provider and persistence adapters do not recreate
  product behavior, and no schema or migration change was introduced.
- The expected-message-count contract is supplied by every production caller;
  map reconciliation is bounded and does not serialize or repeat model calls.
- The shared conversation-text decoder is used by server canonicalization and
  client display rather than duplicated across roles.
- Documentation distinguishes automated, mounted browser, and user visual
  evidence. The unrelated existing edit to
  `tasks/036-complete-demo-session.md` was not modified or included.
