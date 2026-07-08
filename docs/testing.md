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
