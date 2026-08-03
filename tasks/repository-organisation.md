# Repository organisation baseline

## Goal

Establish one explicit repository-wide organisation system and align the
existing scaffold with it without changing user-visible behaviour.

## Approval record

Approved on 2026-08-03 as an unnumbered task that does not change the numbering
or priority of Tasks 033–044.

- The work is behaviour-preserving and must not add product capabilities,
  database migrations, API contract changes, or visual redesign.
- Repository ownership is organised first, architectural role second, and
  business capability third.
- The README must give a new reader an immediately useful structural diagram,
  vocabulary, navigation rules, and bug-location guide.
- `AGENTS.md` must require future work to follow the implemented structure.
- Product capabilities, cross-capability coordination, delivery mechanisms,
  ports, adapters, and test support must be distinguishable from their paths.
- Colocated behaviour tests remain colocated; reusable fakes, fixtures, browser
  journeys, evaluations, and infrastructure integration tests remain distinct.
- Empty speculative scaffold directories should not be preserved.
- Current numbered tasks must not be renamed or renumbered.

## Scope

- Document and enforce the repository organisation vocabulary.
- Reorganise the client host, API host, platform packages, and Socratic Draft
  package around explicit architectural roles.
- Move product registry data to the product package while retaining platform
  registry types in the shared package.
- Split only those mixed-responsibility files whose separation is necessary to
  make the new organisation truthful.
- Add executable dependency and production/test boundary checks.
- Update architecture, code-quality, testing, decisions, and progress records.

## Out of scope

- New product behaviour, intended draft form, preference learning, database
  schema changes, API contract changes, visual redesign, or new dependencies.

## Definition of done

- Every source directory has one documented architectural role.
- The implemented tree matches the README and canonical architecture.
- A reported bug can be routed using product language without first decoding
  implementation terminology.
- Existing observable behaviour and contracts remain unchanged.
- Full deterministic validation passes.

## Validation

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

Run database-connected adapter integration tests when credentials are available.

## Status

Completed on 2026-08-03.

## Completion report

### Summary

Established and applied the repository-wide ownership → architectural role →
capability → responsibility organisation system without changing product
behaviour or the numbered roadmap.

### Files changed

- Root README, agent instructions, architecture, quality, testing, decisions,
  progress, and this approval record.
- Client and API host source trees.
- AI, auth, database, shared, and products package source trees and entry points.
- Socratic Draft client, server, ports, delivery, persistence adapters, and test
  support paths.
- Repository-wide architecture tests and product-registry ownership coverage.

The documentation records both the implemented tree and the principles behind
it: paths as diagnostic maps, separation of meaning from mechanism, inward
dependency direction, capability ownership, verification ownership, and
evidence-driven rather than speculative structure. Repository-wide guidance
lives in the root README, while the Socratic Draft owns a self-contained README
for its detailed structure, flow, integration boundary, and diagnostic map.

### Commands run

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
pnpm vitest run packages/db/src/adapters/socratic-draft/conversation-persistence.integration.test.ts packages/db/src/adapters/socratic-draft/draft-persistence.integration.test.ts
PORT=8790 pnpm dev:api
git diff --check
```

### What works end to end

- The public client and API build from their explicit bootstrap locations.
- Socratic Draft mounts through the reorganised host adapters and retains the
  same HTTP paths, product contracts, demo behaviour, owner persistence, and
  complete browser journeys.
- Product definitions resolve from their product-owned registry.
- Production source is automatically checked against the documented package
  dependency graph and cannot import test support.

### Not implemented

- No new product capability, schema, API contract, visual design, dependency,
  intended-form behaviour, or preference behaviour was introduced.
- Large services were not decomposed solely to reduce line counts; the new
  paths and ports establish ownership, while later behavioural work may extract
  coherent responsibilities when they need to change independently.

### Risks / follow-ups

- Future work must update the README when it introduces an approved new
  architectural role or ownership boundary.
- The dependency test recognises static repo-root imports; TypeScript and the
  existing extractability test remain complementary safeguards.

### Suggested next task

Resume the unchanged numbered roadmap with Task 033: optional intended draft
form.
