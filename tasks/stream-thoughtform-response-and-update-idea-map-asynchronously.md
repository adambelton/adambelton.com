# Stream ThoughtForm responses and update the Idea Map asynchronously

## Goal

Reduce the oppressive wait between conversation messages by streaming the
assistant's conversational response over SSE while generating the Idea Map
update in a separate concurrent model call.

## Why this task is next

Prompt caching reduced the controlled FIFA run's estimated cost by about 28%,
but median completion latency remained 15.669 seconds. The remaining synchronous
operation combines user-facing conversation generation with Idea Map analysis,
so the user cannot begin reading until both responsibilities are complete.

## Scope

- Split the current combined model operation into product-owned contracts for
  conversational response generation and Idea Map analysis.
- Give each operation a Claude-specific prompt and output schema appropriate to
  its responsibility.
- Start both model calls from the same user message and workspace state.
- Add provider-neutral streaming support for conversational text.
- Expose the mounted conversation operation as an SSE response initiated by
  `POST`.
- Define typed SSE events for request acceptance, assistant text deltas,
  completed assistant response, completed Idea Map update, recoverable Idea Map
  failure, and terminal conversation failure.
- Retain the completed user/assistant turn without waiting for Idea Map analysis.
- Apply and retain the Idea Map independently with revision protection.
- Update the client incrementally, keep the composer unavailable until the
  conversation turn is safely retained, and allow the Idea Map to finish after
  the assistant response is visible.
- Instrument request acceptance, server and client time to first response token,
  conversation completion and retention, and Idea Map completion and retention
  through the existing owner-only observability boundary.
- Run a controlled FIFA evaluation comparing the split calls with the current
  combined baseline for behaviour, latency, tokens, caching, and cost.
- Update product architecture, progress, and task records.

## Out of scope

- WebSockets or a durable external job queue.
- Continuing Idea Map work after server termination or deployment interruption.
- Conversation-history summarisation or caching.
- Omitting the current Idea Map from model input.
- One-hour prompt caching or cache prewarming.
- Changing the production model or reasoning effort.
- Streaming draft composition.
- Instrumenting temporary demo users.
- Prompt changes unrelated to separating the two responsibilities.

## Expected files to create or modify

- `packages/ai` streaming contracts and concrete provider adapters.
- ThoughtForm conversation and Idea Map capability contracts, prompts, schemas,
  application coordination, HTTP delivery, shared SSE contracts, and tests.
- ThoughtForm workspace client action, presentation state, and tests.
- Host AI, persistence, and owner-observability adapters and tests.
- Product browser scenarios and hosted FIFA evaluations.
- The ThoughtForm README, `progress.md`, and task records.
- Database adapter/schema files only if existing persistence cannot safely retain
  the two results independently.

## Definition of done

- The mounted owner conversation displays streamed assistant text before Idea
  Map generation finishes.
- The assistant turn is retained exactly once.
- The Idea Map is updated independently and never silently overwrites a newer
  revision.
- Idea Map failure does not discard a successfully retained assistant response.
- Conversation failure is represented unambiguously to the client.
- Temporary and persistent flows work correctly while only the owner flow emits
  Braintrust observations.
- OpenAI remains functionally compatible through provider-neutral contracts.
- Braintrust records server and client time to first token separately from total
  completion time.
- The controlled FIFA evaluation preserves acceptable conversation and Idea Map
  quality and reports latency, usage, caching, and cost.
- Focused tests, full tests, typecheck, build, frozen lockfile validation, and
  mounted browser verification pass.
- Documentation and the requirement-by-requirement completion audit are complete.

## Validation commands

```txt
pnpm exec vitest run <focused provider, product, adapter, delivery, and client tests>
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
pnpm test:e2e
git diff --check
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform-braintrust
```

## Risks / questions

- A POST SSE response requires a fetch-stream parser rather than browser
  `EventSource`.
- The current persistence contract retains the assistant response and Idea Map
  atomically; separating it must not introduce duplicate turns or stale writes.
- Without a durable queue, Idea Map work is asynchronous relative to the visible
  response but remains tied to the HTTP request lifetime.
- Parallel calls may cost more if their context substantially overlaps; the FIFA
  evaluation must quantify this before the split is described as an overall
  optimisation.
- If the evaluation shows material quality regression, excessive cost, or no
  useful first-token improvement, the task remains incomplete rather than
  silently adopting weaker behaviour.

## Approval record

- **Approved:** 5 August 2026 by Adam, after the preceding prompt-optimisation
  branch was merged separately.
- **Intentional boundaries:** REST plus SSE; separate concurrent conversation and
  Idea Map model responsibilities; preserve capable models and existing
  owner-only observability.
- **Important deferrals:** WebSockets, durable background jobs, additional cache
  strategies, model changes, draft streaming, and demo instrumentation.
- **Implementation decisions:** settle the product-language split contracts,
  revision-safe independent retention, typed event order, and provider-neutral
  streaming projection inside this task.
- **Do not reopen without new evidence:** the Idea Map updates on the user's
  message rather than the assistant's response; prompt caching alone is not
  expected to meet the perceived-latency goal; temporary demo content remains
  outside Braintrust.

## Status

Completed on 5 August 2026.

## Completion audit

### Scope

- **Separate product contracts:** conversation generation now owns only the
  user-facing response, move, readiness, and intention; Idea Map analysis owns
  proposed ideas, actions, and conflict resolution through its own port,
  service, prompt, and schema.
- **Concurrent calls from one workspace:** both JSON compatibility coordination
  and the streaming operation start conversation and Idea Map analysis from the
  same retained messages, map revision, and latest user message. The Idea Map
  prompt explicitly excludes the concurrent assistant response.
- **Provider-neutral streaming:** `packages/ai` exposes text-delta and completed
  events implemented and tested for Anthropic Messages and OpenAI Responses.
- **POST plus SSE delivery:** temporary and persistent response routes expose
  typed accepted, assistant delta/completion, Idea Map completion/failure,
  terminal failure, and completed events with no-buffer response headers.
- **Independent retention:** the user/assistant turn is appended exactly once
  before the map result is awaited. The map is replaced separately against the
  original expected revision. Tests cover successful ordering, analysis
  failure, and revision conflict without overwriting the current map.
- **Client behavior:** the editor renders partial assistant text, becomes
  interactive after assistant retention, applies a later map, and exposes a
  recoverable map-failure status without removing the retained response.
- **Owner-only instrumentation:** persistent flows correlate client
  first-token/response observations with server provider streaming, workspace
  loading, acceptance, assistant retention, map application, and map retention.
  Temporary flows receive no-op observability and client tests verify that they
  emit no observation requests.
- **Controlled FIFA evaluation:** Braintrust experiment
  `codex/thoughtform-fifa-split-streaming-20260805-1255` passed all nine
  behavioral scores with 20 calls and no errors. It recorded 72,152 prompt,
  37,728 cache-read, 4,192 cache-creation, and 13,297 completion tokens; 85,449
  total tokens; $0.21 estimated cost; and 111.00 seconds wall time. Compared
  with the cached combined baseline, wall time improved about 31%, while tokens
  and estimated cost increased about 17%.
- **Documentation:** the product README and `progress.md` describe the split
  capability flow, observability boundary, measured benefit, and cost/long-tail
  risks. No database files changed because the existing revision-checked
  `replaceIdeaMap` operation safely supports independent retention.

### Definition of done

- **Mounted owner behavior:** the real Vite/API/Prisma/Anthropic composition was
  exercised with a synthetic FIFA message after the development migration
  check reported no pending migrations. The retained assistant response was
  visible and the composer was usable while the UI still reported `Updating the
  Idea Map`; a later reload showed the independently retained Idea Map entry.
- **Exactly-once and revision safety:** application tests assert one turn append
  and a recoverable `idea_map_conflict` when replacement loses its revision
  race.
- **Failure contracts:** application, route, parser, and component tests cover
  terminal conversation failure and recoverable map failure after assistant
  retention.
- **Temporary/persistent and provider compatibility:** route tests cover both
  lifecycles; client tests cover owner-only telemetry; Anthropic and OpenAI
  provider streaming tests pass.
- **First-token measurements:** the server records
  `server_time_to_first_token_ms` on the first provider delta and the persistent
  client records `conversation_first_token` separately from
  `conversation_response`, both under the correlation ID accepted by the owner
  observation route.
- **Validation:** focused tests passed; full Vitest passed with 244 tests and 5
  skips; recursive typecheck and build passed; the frozen
  offline lockfile check passed; Playwright passed 3/3 scenarios; and
  `git diff --check` passed.

### Complete branch-diff audit

- Product meaning remains in `packages/products`; provider and Braintrust
  mechanisms remain in `packages/ai`, `packages/observability`, and the API host.
- Delivery routes validate input and delegate to the workspace operation; they
  do not recreate conversation or Idea Map rules.
- Persistent storage remains behind the product conversation-store contract;
  no schema or migration change was needed or claimed.
- Temporary and owner flows share product behavior while host assembly supplies
  distinct no-op and Braintrust adapters; no production behavior is duplicated
  in the deterministic browser host beyond its scripted external model fake.
- Open implementation choices in the approval record are settled by typed SSE
  ordering, one append plus revision-checked map replacement, and separate
  product-language model ports.
- Documentation claims distinguish automated tests, the real mounted browser
  inspection, and hosted evaluation evidence. No assistive-technology testing
  is claimed.
- The unrelated pre-existing edit to `tasks/036-complete-demo-session.md` is not
  part of this task and was neither modified nor used as completion evidence.

## Known result and follow-up

The split substantially shortens aggregate wall time and removes Idea Map
generation from the assistant-retention critical path, but it does not guarantee
a sub-five-second first token. In the mounted verification the response was
retained while the map remained pending, and that map call became a provider
long-tail outlier exceeding 100 seconds before eventually retaining. The next
latency task should use the new phase measurements to address pre-first-token
reasoning and Idea Map long-tail behavior without weakening the selected model.
