# ThoughtForm hosted-usage measurement — 13 August 2026

## Purpose and privacy boundary

This report records content-free Task 039 measurements for representative
ThoughtForm beta journeys. It contains operation identifiers, counts, outcomes,
models, and quantitative provider usage only. It contains no fixture text,
prompts, conversation messages, Idea Map content, Drafts, revision content, or
model-generated prose.

Measurements came exclusively from the Task 038 hosted-attempt ledger. They do
not use temporary-user Langfuse tracing or a second accounting mechanism.

## Hosted profile and runs

- Provider: Anthropic
- Model: `claude-sonnet-5`
- Effort: `medium`
- Report-capture run: `task-039-2026-08-13-report`
- Run date: 13 August 2026
- Scenarios: 6
- Repetitions: 2
- Expected and admitted operations: 72
- Outcomes: 72 succeeded
- The original runner displayed a $0.7592 USD estimate, but a subsequent code
  audit found that it priced cache and reasoning categories twice. That monetary
  estimate is withdrawn; the provider token measurements remain unchanged.

A separately approved targeted verification run,
`task-039-2026-08-13-structure`, was capped at two repetitions, 12 hosted
operations, and $0.30 USD. It stopped after the first repetition's six
successful hosted operations because none of the three Idea Map analyses
proposed an autonomous merge or split. The user-directed correction was not
applied after that failed precondition, the second repetition did not run, and
no retry was authorized. This is an investigated product-behaviour observation,
not a harness or accounting failure.

An earlier three-repetition run supplied useful operation-wide corroboration:
107 attempts succeeded, with one later-Draft composition rejected before model
admission because that generated journey contained no active idea. Its ranges
were consistent with the report-capture run: conversation input 2,186–3,408,
conversation output 180–541, Idea Map input 3,583–4,803, Idea Map output
109–990, Draft input 1,097–1,483, and Draft output 27–177 tokens. That run cost
an originally displayed estimate of $1.1146 that is likewise withdrawn because
of the pricing defect. The complete per-scenario tables below were captured
from the 72-attempt report run before its synthetic user and cascading ledger
rows were deliberately removed.

## Operation-wide ranges

`Input` is Anthropic's complete input total and already includes cache reads and
writes. `Reasoning` is part of provider output and must not be added to output a
second time when enforcing a total-token budget.

| Hosted operation | Samples | Input | Output | Reasoning | Cache read | Cache write | Missing metadata |
|---|---:|---:|---:|---:|---:|---:|---|
| Conversation response | 30 | 2,186–3,408 | 227–541 | unavailable | 2,083 | 0 | reasoning: 30 |
| Idea Map analysis | 30 | 3,583–4,803 | 151–990 | 0–293 | 3,483 | 0 | none |
| Draft composition | 8 | 1,097–1,483 | 27–169 | 0 | 0 | 0 | none |
| Revision proposal | 2 | 675–695 | 204–209 | 0 | 0 | 0 | none |
| Saved-change interpretation | 2 | 1,356–1,368 | 114–222 | 0–120 | 0 | 0 | none |

All values are complete-operation ledger totals. If a structured-output repair
had occurred, its usage would have been aggregated into the same attempt. The
ledger intentionally does not expose individual provider-call or repair-call
counts, so this run does not claim a repair rate. The current mounted profile
does not expose a separate product/provider repair operation that could be
selected as a deterministic measurement scenario.

## Per-scenario ranges

All listed attempts succeeded. Cache reads were 2,083 for every conversation
response and 3,483 for every Idea Map analysis; all other cache reads and every
cache write were zero.

| Scenario | Hosted operation | Samples | Input | Output | Reasoning |
|---|---|---:|---:|---:|---:|
| Guided vague Discovery | Conversation response | 6 | 2,189–2,733 | 227–347 | unavailable |
| Guided vague Discovery | Idea Map analysis | 6 | 3,586–4,128 | 151–631 | 31–206 |
| Strong view, early Draft | Conversation response | 2 | 2,196 | 382–525 | unavailable |
| Strong view, early Draft | Idea Map analysis | 2 | 3,593 | 482–592 | 151–280 |
| Strong view, early Draft | Draft composition | 2 | 1,153–1,166 | 58–114 | 0 |
| Long Discovery, later Draft | Conversation response | 12 | 2,189–3,408 | 272–541 | unavailable |
| Long Discovery, later Draft | Idea Map analysis | 12 | 3,586–4,803 | 312–990 | 0–293 |
| Long Discovery, later Draft | Draft composition | 2 | 1,465–1,483 | 168–169 | 0 |
| Revision and acceptance | Conversation response | 2 | 2,192 | 323–387 | unavailable |
| Revision and acceptance | Idea Map analysis | 2 | 3,589 | 293–352 | 21–90 |
| Revision and acceptance | Draft composition | 2 | 1,119–1,120 | 74–84 | 0 |
| Revision and acceptance | Revision proposal | 2 | 675–695 | 204–209 | 0 |
| Meaningful saved change | Conversation response | 2 | 2,186 | 293–346 | unavailable |
| Meaningful saved change | Idea Map analysis | 2 | 3,583 | 275–444 | 38–201 |
| Meaningful saved change | Draft composition | 2 | 1,097–1,104 | 27 | 0 |
| Meaningful saved change | Saved-change interpretation | 2 | 1,356–1,368 | 114–222 | 0–120 |
| Idea Map structure correction | Conversation response | 6 | 2,192–2,804 | 325–401 | unavailable |
| Idea Map structure correction | Idea Map analysis | 6 | 3,589–4,199 | 339–526 | 39–95 |

Revision acceptance and the user-directed Idea Map correction added no hosted
attempt. Conversation response and Idea Map analysis remained independent,
concurrent attempts for every conversation turn.

## Findings and outliers

- The largest measured operation was an Idea Map analysis with 4,803 input and
  990 output tokens.
- The long journey was the largest journey shape: twelve concurrent turn
  attempts plus one Draft composition per repetition.
- Conversation reasoning metadata was absent in every sample. Total output was
  still supplied, so accounting can use input plus output without inventing a
  reasoning value.
- No cache writes were reported. Stable prompt cache reads were present on
  every conversation and Idea Map operation.
- One earlier later-Draft journey generated no active idea and was rejected
  before Draft admission. This is evidence for retaining request headroom and
  treating pre-admission product rejection separately from hosted failure.
- Two samples per scenario establish observed ranges, not statistical
  guarantees. Task 040 values therefore use rounded conservative headroom.
- The report-capture structure journeys exercised the user correction endpoint,
  but did not originally assert that an assistant-originated structural change
  preceded it. The stricter targeted verification found no autonomous merge or
  split in its first repetition and stopped. Task 040 does not depend on such a
  proposal occurring, but future claims about the reliability of autonomous
  structure evolution require a separately approved evaluation.

## Task 040 calibration recommendation

These values are proposed for review; they do not implement enforcement.

### Requests

- Temporary user: **30 admitted hosted attempts per UTC day**. This fits the
  largest measured 13-attempt journey plus Draft revision and saved-edit work,
  with headroom for continued Discovery or one failed/retried operation.
- Global: **300 admitted hosted attempts per UTC day**, including owner usage.
  This is an operational assumption equivalent to ten fully used temporary
  allowances, not a fact derived from journey measurements.
- Owner: exempt from the 30-attempt personal allowance, but included in the
  global emergency safeguard. The hosted-AI kill switch remains independent.

### Tokens

- Temporary user completed-usage allowance: **120,000 total tokens per UTC
  day**, where total means `inputTokens + outputTokens`. Cache tokens and
  reasoning remain recorded categories but are already included in those
  provider totals and must not be double-counted.
- Global completed-usage allowance: **1,200,000 total tokens per UTC day**,
  including owner usage. As with the global request count, this is a capacity
  assumption requiring explicit approval rather than a measured user fact.
- Reservation by operation:
  - conversation response: **5,000 tokens**;
  - Idea Map analysis: **7,000 tokens**;
  - Draft composition: **2,500 tokens**;
  - revision proposal: **1,500 tokens**;
  - saved-change interpretation: **2,500 tokens**.
- Completion replaces the reservation with actual `inputTokens + outputTokens`.
  Permit at most one operation to overshoot the remaining allowance, then deny
  further admission until reset. The maximum planned reservation overshoot is
  therefore **7,000 tokens**.
- Missing complete input or output usage fails closed: retain the full
  reservation instead of refunding an unknown amount. Partial diagnostic
  categories do not make complete usage known.

### Per-operation bounds

- Retain the existing **32 KiB complete conversation/Idea Map input bound**;
  the long journey stayed below it and does not justify reducing it.
- Proposed output caps:
  - conversation response: **1,024 tokens**;
  - Idea Map analysis: **1,536 tokens**;
  - Draft composition: **512 tokens**;
  - revision proposal: **512 tokens**;
  - saved-change interpretation: **512 tokens**.
- Add a **16 KiB serialized input bound** for each Draft composition, revision
  proposal, and saved-change interpretation request. This is a conservative
  policy proposal inferred from the low provider-input token ranges, not a
  directly measured byte limit. Task 040 must measure the serialized request
  fixtures and validate the bound before adopting it; larger private content
  should then fail before provider invocation.

### Disclosure and reset

- Reset all daily budgets at the next UTC midnight.
- Disclose only the authenticated user's remaining request allowance and reset
  time. Do not disclose token budgets, global remaining capacity, other users'
  activity, model failures, or internal cost estimates.

## Limitations

- Results apply to the named model, effort, prompts, product implementation,
  and synthetic scenarios on the run date.
- The run does not establish future pricing, public demand, commercial
  capacity, or a repair/failure rate.
- A material model, prompt, context, or output-bound change should trigger
  targeted remeasurement rather than silent reuse of these values.
- The reliability matrix provides directional evidence from clear synthetic
  cases, not a production-wide probability or a guarantee that every ordinary
  conversation will expose a structural opportunity clearly enough.

## Idea Map structure reliability amendment

The first approved reliability run used eight scenarios with three repetitions
each against the same hosted profile. It completed 24 calls at an estimated
$0.1126 USD:

- 12 of 12 explicitly requested merge/split changes used the expected operation
  and idea references and passed product validation;
- 0 of 9 no-change controls produced an inappropriate structural proposal;
- 3 of 3 previous-correction cases avoided repeating the rejected merge;
- no proposal was missed, wrong, or rejected by product validation.

These results establish reliable response to explicit natural-language
structure requests and useful no-change/correction safety evidence. They do not
establish autonomous detection because the positive scenario messages told the
assistant to bring ideas together or separate them. That distinction was found
during the post-run completion audit. The positive messages have since been
revised to express the underlying overlap or distinction without requesting a
structural operation. The separately approved targeted run completed 12 calls
at an estimated $0.0905 USD:

- all six implicit merge samples produced the expected merge with the correct
  references and passed product validation;
- all six implicit split samples proposed the expected split against the
  correct source idea;
- five splits passed product validation and one was rejected safely;
- there were no missed detections, wrong operation types, or wrong references.

The corrected positive result is therefore 11 valid autonomous changes from 12
clear synthetic opportunities (91.7%). Combined with the first run's controls,
the matrix observed no inappropriate change in nine no-change samples and
respected all three previous corrections. This exceeds the pre-run directional
threshold of 9 valid changes from 12 opportunities. It is evidence that the
current profile responds reliably when synthetic material makes the structural
relationship clear; it is not a statistical production guarantee or evidence
that ordinary conversation will always make that relationship salient. The
earlier natural journey that produced no autonomous change remains relevant
counter-evidence to any broader claim.
