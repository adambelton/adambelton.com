# Testing

Testing in this repo should focus on contracts and observable behaviour, not implementation details.

## Priorities

1. Shared contracts
2. Product domain behaviour
3. API route behaviour
4. UI behaviour at user-observable boundaries

Prefer small, meaningful tests that make regressions obvious.

## What To Test

- Shared type guards, registries, and contract helpers that other packages rely on.
- Product services through their public APIs.
- API handlers by request and response shape.
- UI components through rendered output and user interactions.
- Boundary wiring where one package composes another.

## What To Avoid

- Tests that depend on private helper names or internal call order.
- Snapshot tests for broad UI trees unless the snapshot is intentionally small and stable.
- Duplicating TypeScript's job by testing simple type declarations at runtime.
- Testing framework mechanics instead of project behaviour.

## Contract Testing Guidance

When adding or changing shared contracts:

- Test the exported surface that consumers use.
- Assert stable identifiers, slugs, response shapes, and lookup behaviour.
- Keep fixtures minimal and domain-meaningful.
- Prefer failures that describe which contract changed.

When adding product logic:

- Test through the product service or public function.
- Assert the conversation state, returned messages, and documented side effects.
- Do not assert the exact private helper that produced the result.

## Validation Expectations

For implementation tasks, run the validation commands proposed and approved for the task.

Most code changes should include at least:

```txt
pnpm typecheck
```

When tests exist for the changed surface, run the relevant test command as well.

Docs-only tasks may validate with:

```txt
git diff --stat
```

## Browser End-To-End Tests

Playwright verifies user-observable product flows across a real browser, the
product client, the product HTTP route, and product orchestration. Socratic
Draft's browser suite runs against dedicated testing hosts in
`packages/products/src/socratic-draft/testing`. Those hosts provide a
deterministic conversation model and a product-language in-memory store.

The suite deliberately does not start `apps/client` or `apps/api`. It does not
test host authentication, database adapters, deployment configuration, or the
behaviour of a hosted model. Those boundaries need their own focused tests.

## Hosted Model Evaluations

Real-model checks verify that the configured provider still satisfies the
conversation contract and behaves within important product-policy bounds. They
are opt-in because they are non-deterministic, require secrets, and incur cost.
They do not run in CI and do not replace deterministic tests.

## Test Location

Tests and evaluations of product-owned behaviour are colocated within that
product package. Socratic Draft client tests live beside its pages and
components, while its browser fixtures and hosted evaluations live under
`packages/products/src/socratic-draft/testing`.

Host applications retain only tests of host responsibilities such as mounting
product routes and supplying adapters. Infrastructure packages retain tests of
their concrete product adapters, such as the Socratic Draft Prisma store. A
test-only product evaluation may compose a concrete provider as a development
fixture; that does not make the provider part of the product runtime boundary.
