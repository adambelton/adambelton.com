# Task 005 — Adopt Code Quality And Testing Guidelines

## Status

Complete.

## Goal

Translate the global code quality pillars into project-owned, tool-agnostic docs so humans and agents share the same engineering and testing standards.

## Scope

- Add repo-native code quality guidance.
- Add repo-native testing guidance.
- Point `AGENTS.md` at those docs.
- Record the decision that repo docs are the canonical project rules.
- Update progress and task tracking.

## Out Of Scope

- Product behaviour.
- Test runner setup.
- Socratic Draft service code.
- Tool-specific adapter files.

## Definition Of Done

- Code quality pillars are documented in the repo.
- Testing guidance prioritises contracts and observable behaviour over implementation details.
- `AGENTS.md` points contributors and agents to the new docs.
- Progress and task files reflect the completed docs task.
- No runtime behaviour changes are introduced.

## Validation

```txt
git diff --stat
```
