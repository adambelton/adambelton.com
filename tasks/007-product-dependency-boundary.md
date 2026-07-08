# Task 007 — Product Dependency Boundary

## Status

Complete.

## Goal

Document that product packages define the contracts they need to function, and host applications/packages provide adapters that fulfill those contracts.

## Scope

- Update `AGENTS.md`.
- Add a decision to `docs/decisions.md`.
- Update `progress.md`.
- Update `tasks/README.md`.
- Clarify that products should not directly depend on concrete host infrastructure packages for AI, auth, DB, or usage.
- Clarify that products own required ports/contracts, while hosts own implementations/adapters.

## Out Of Scope

- Product behaviour.
- API routes.
- Persistence interfaces.
- DB/auth/AI adapters.
- Refactors of existing service code.

## Definition Of Done

- Product packages are documented as infrastructure-agnostic.
- Product code is documented as owning business logic and required capability contracts.
- Hosts are documented as owning AI/auth/database/usage implementations.
- Persistence mechanism belongs to the host.
- Persistence meaning and required operations belong to the product.
- Future endpoint, persistence, and AI tasks have clear boundary guidance.

## Validation

```txt
git diff --stat
```
