# Task 034 — Add calibrated usage limits and cost protection

## Goal

Protect hosted AI with atomic per-user and global budgets, product-aware usage
records, and limits calibrated to permit a complete demo session.

## Why this task is next

The complete demo can now be measured, so budgets can represent the product's
real interaction pattern rather than an arbitrary number of chat turns.

## Scope

Implements the usage portions of **Workspace orchestration**, **Conversation
turn**, **Concurrency and consistency**, and **Privacy and data minimisation**
from the product architecture.

- Add a product-owned usage authorization port around model-backed actions.
- Persist privacy-limited, product-aware request outcomes and provider-neutral
  token metadata through host adapters.
- Enforce atomic per-user demo and global UTC daily request limits.
- Enforce bounded post-usage token guards with documented overshoot semantics.
- Retain the kill switch and refine input/output limits by action where useful.
- Return stable failure codes, reset information, and remaining demo allowance.
- Preserve the current workspace when a limit is reached.
- Validate configuration once at composition and fail closed for hosted AI.

## Settled constraints

- Usage authorization and accounting are host-owned operational concerns. The
  product defines narrow product-language authorization and completion operations
  and must not import database, auth, provider, or configuration implementations.
- A request allowance is reserved atomically immediately before model invocation,
  after product input validation and bounded context preparation.
- Every admitted hosted attempt is completed exactly once with its observable,
  content-free outcome, including when generation succeeds but later product
  persistence fails. Completion and retries must be idempotent.
- A provider failure counts once an admitted attempt may have incurred cost.
- Atomic enforcement must work across concurrent application processes; an
  in-memory check is insufficient for configured durable budgets.
- Per-user demo and global windows use UTC daily boundaries. A rejected request
  makes no provider call and does not mutate the workspace.
- Token guards use provider-neutral usage metadata and explicitly documented
  reservation/overshoot semantics. Internal global budget totals are not exposed
  to clients.
- Stable product failures include the user-relevant reset time and remaining demo
  allowance where safe, while preserving current conversation, idea, draft, and
  rejected local input.
- Usage records may contain user/account reference, product/action, model
  identifier, timestamps, provider-neutral token counts, and operational outcome.
  They must not contain prompts, messages, drafts, ideas, generated prose, IP
  addresses, user-agent strings, or behavioral profiles.
- Product/action input and output limits remain product policy. Provider adapters
  receive and enforce supplied bounds but do not choose them.
- Hosted configuration is parsed and validated once in `apps/api`; product and AI
  packages do not read environment variables directly. Missing or invalid safety
  configuration fails closed while unrelated website behavior remains available.
- The existing explicit hosted-AI kill switch remains independent of credentials
  and all budget controls.

## Out of scope

- Billing reconciliation, invasive abuse analytics, research budgets, or admin
  dashboards.

## Expected files to create or modify

- product usage port and model-backed orchestration
- `packages/ai` usage metadata contracts
- API configuration/composition
- `packages/db` usage budgets/events, repositories, and generated migration
- client limit presentation, privacy docs, environment docs, tests, and progress

## Definition of done

- Concurrent requests cannot exceed reserved request allowances.
- Token guards, global safety, owner/demo differences, and UTC reset work as
  documented.
- Every admitted hosted attempt records a content-free final outcome.
- A legitimate measured demo session fits within the configured default budget.
- Limit rejection occurs before provider invocation and preserves recoverable
  workspace and editor state.
- Usage records contain no private workspace content.
- Tests, typecheck, build, database validation, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Cumulative context may dominate visible output usage.
- Reservations must be atomic and completion idempotent.
- Provider failures count once a hosted attempt may have incurred cost.

## Values required before approval

Task 033's committed measurements must be used to add concrete values and
rationale here before implementation approval:

- demo UTC-daily request allowance;
- demo UTC-daily token allowance or guard;
- owner allowance or exemption policy;
- global request, token, or spend-equivalent safety threshold;
- per-action input and output limits;
- permitted token overshoot and reservation algorithm;
- configuration variable names, defaults, and invalid-value behavior.

## Decisions this task must settle

- The reservation record, admitted-attempt lifecycle, final outcomes, and
  idempotency mechanism.
- Whether global safety is enforced with request, token, cost-estimate, or a
  documented combination of guards.
- How provider usage is handled when metadata is missing or partial.
- Which reset and remaining-allowance fields are safe and useful in the product
  response.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Status

Proposed. Awaiting approval.
