# Activate Langfuse prompt review automation

## Goal

Activate and prove the complete reviewed-prompt lifecycle from a Langfuse
`review` label through a GitHub fallback pull request to exact production-label
promotion.

## Why this task is next

The repository-owned updater, pull-request workflow, validation, and production
promotion are merged and the three Langfuse GitHub Actions secrets are
configured. The remaining gap is external activation: Langfuse does not yet
dispatch reviewed prompt versions to GitHub, so the lifecycle has only been
verified in local simulations and separate workflow stages rather than as one
complete event-driven operation.

This task closes that operational gap before ordinary prompt iteration relies
on the automation.

## Scope

- Create a dedicated GitHub credential limited to
  `adambelton/adambelton.com` and only the permission required to send the
  repository-dispatch event.
- Store that credential only in the Langfuse automation configuration; do not
  add it to application runtime configuration or the repository.
- Configure a Langfuse automation that reacts to an exact prompt version
  receiving the `review` label and sends a `langfuse-prompt-review`
  `repository_dispatch` event containing the prompt name and immutable version.
- Create one content-identical development prompt version for a catalogued
  ThoughtForm prompt, assign `review`, and use it as a non-behaviour-changing
  lifecycle probe.
- Verify that the dispatch starts the merged fallback-sync workflow, which
  validates the exact version and opens a pull request without pushing to
  `main`.
- Approve the generated PR workflow run if GitHub requires approval for a PR
  created by the built-in workflow token.
- Verify generated changes are limited to the one capability-owned fallback
  and the host-owned version/fingerprint ledger.
- Require CI and human review, merge the generated PR, and verify that the
  promotion workflow moves `production` to that exact immutable version.
- Re-resolve the prompt by `production` and confirm it is hosted rather than a
  repository fallback.
- Update operational documentation and progress with the proven configuration,
  credential ownership, renewal procedure, and evidence links.

## Out of scope

- Changing any ThoughtForm prompt content or product behaviour.
- Changing response schemas, parsers, evaluation criteria, fixtures, or scores.
- Adding a repository-stored long-lived prompt-sync token.
- Changing the existing GitHub fallback updater or promotion rules unless the
  complete live probe exposes a concrete defect.
- Renaming disabled hosted-AI adapters.
- Running paid behavioural evaluation suites.
- Adding general-purpose webhook infrastructure to the application.

## Expected files to create or modify

The task is primarily external configuration and verification. Expected
repository changes are limited to:

- `docs/local-development.md`
- `docs/deployment.md`
- `progress.md`
- this task record

The automation-generated proof PR is expected to modify exactly:

- one prompt file beneath its owning ThoughtForm capability's `prompts/`
  directory, if byte-level formatting requires an update;
- `apps/api/src/products/thoughtform/adapters/prompts/automation/prompt-fallback-versions.json`.

Any production-code or workflow change requires a documented defect discovered
by the live probe and a fresh scope review before implementation.

## Definition of done

- A dedicated expiring credential can dispatch events only to the intended
  repository and is stored in Langfuse rather than application configuration.
- Assigning `review` to the chosen immutable Langfuse version automatically
  starts the GitHub fallback-sync workflow with its exact name and version.
- The workflow rejects no established safety rule and creates a branch and PR;
  it does not write directly to `main`.
- The generated diff contains no prompt-content change and records only the
  probe version and matching SHA-256 fingerprint, apart from byte-level source
  normalization if demonstrated and reviewed.
- PR CI passes and the generated PR receives human review before merge.
- The post-merge promotion workflow succeeds and assigns `production` to the
  exact reviewed version.
- A live production-label lookup returns that exact version with
  `isFallback: false`.
- Existing production prompt content remains byte-identical throughout the
  probe.
- Documentation records setup, credential scope, expiration/rotation, manual
  CI approval behaviour, diagnosis, and recovery.
- The requirement-by-requirement completion audit records GitHub workflow, PR,
  merge, promotion, and Langfuse resolution evidence.

## Validation commands

```txt
pnpm validate:thoughtform-prompts
pnpm validate:langfuse-workflows
pnpm test
pnpm typecheck
pnpm build
git diff --check
gh run list --repo adambelton/adambelton.com
gh pr checks <generated-pr> --repo adambelton/adambelton.com
```

Read-only Langfuse CLI or SDK queries must additionally verify the immutable
review version, byte-identical content, final labels, and non-fallback
production resolution without printing credentials or prompt content.

## Risks / questions

- The credential must be narrow enough to limit a Langfuse compromise to
  dispatching this repository's workflow; it must not grant branch, pull
  request, administration, or application-runtime access.
- GitHub's exact fine-grained permission for `repository_dispatch` must be
  confirmed from the current official API documentation during implementation.
- GitHub may hold CI for a pull request created by `GITHUB_TOKEN` until Adam
  approves the workflow run; this is an intentional safety boundary, not a
  reason to add a broader token.
- The Langfuse automation payload fields must be verified against a captured
  real event rather than assumed from documentation examples.
- The content-identical probe intentionally creates and promotes a new
  immutable version. Its version number is implementation evidence, not a
  semantic prompt revision.

## Approval record

Approved by Adam on 7 August 2026.

- **Intentional boundaries:** activate and prove only the existing reviewed
  prompt lifecycle; keep prompt content, product behaviour, response contracts,
  evaluations, and application runtime credentials unchanged.
- **Important deferrals:** disabled hosted-AI adapter naming remains a separate
  maintenance task; paid behavioural evaluations are not required.
- **Implementation decisions left open:** the exact current GitHub permission,
  credential expiration, Langfuse automation fields, and content-identical
  catalogued probe prompt must be settled from current documentation and live
  configuration evidence.
- **Do not reopen:** generated prompt changes require CI and human review,
  production promotion remains downstream of merged fingerprint metadata, the
  GitHub workflow uses its temporary built-in token, and no automation may
  commit directly to `main`.

### Approved scope amendment

Approved by Adam on 7 August 2026 after the live Langfuse automation UI showed
that prompt filters support names but not labels.

- Filter Langfuse `updated` events to names beginning with `thoughtform/`.
- Make the GitHub workflow skip dispatched updates without `review` while
  preserving every existing immutable-version, catalog, structure, fingerprint,
  pull-request, and promotion safeguard.
- Preserve manual workflow dispatch as a diagnostic and recovery path.
- Adam intentionally selected no expiration for the repository-restricted
  credential. Superseded credentials must be revoked immediately and the active
  credential rotated manually when required.

### Approved live-probe amendment

Approved by Adam on 7 August 2026 after the first live reviewed dispatch fetched
the exact prompt version but failed the repository test suite because the sync
job had not generated the Prisma client.

- Add the same `pnpm db:generate` prerequisite used by the normal CI workflow.
- Do not change the schema or commit generated Prisma output.
- Publish and merge the workflow correction through review before retriggering
  the immutable probe.
