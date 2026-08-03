# Task 033 — Add optional intended draft form

## Goal

Let a user optionally establish, change, or clear the intended form of their
private draft at any point, so Discovery and Composition can use that guidance
without turning it into a mode, a publishing decision, or a prerequisite.

## Depends on

Task 032, including its approved corrective pass.

## Why this task is next

Manual testing showed that composition quality depends on a clean distinction
between user-established writing material and internal workspace metadata. The
same distinction is needed before later edit interpretation and preference work:
an intended form is explicit guidance about the current piece, not an inferred
preference and not public visibility.

Establishing this contract now lets later capabilities consume it consistently
and corrects the product brief's current assumption that form matters only after
publication intent.

## Scope

- Define a product-owned optional **intended draft form** for one workspace.
- Let the user set free-text form guidance, change it, or clear it before or
  after a draft exists.
- Provide an explicit accessible control without requiring a mode selector or a
  fixed taxonomy.
- Recognise an unambiguous form explicitly stated in conversation and require
  confirmation when the statement is ambiguous rather than inferring silently.
- Supply the current intended form as bounded guidance to conversation and
  composition context.
- Let intended form subtly contextualise useful Discovery framing and what
  material may be worth uncovering, while preserving the same Discovery policy
  and effectiveness when no form is known.
- Persist the value for the workspace lifetime through product-owned ports:
  temporary for demo workspaces and durable for owner workspaces.
- Keep intended form distinct from audience, visibility, publishing intent,
  voice preferences, structure, readiness, activity, and user intention.
- Update the product brief, architecture, terminology, decisions, and roadmap to
  move intended form out of the publishing-only concept.

## Settled constraints

- Intended form is optional. Absence must never block, weaken, or repeatedly
  interrupt Discovery or Composition.
- It is guidance, not a persistent workspace mode or lifecycle phase.
- A form such as journal entry, blog post, personal essay, case study, project
  write-up, opinion piece, or private note does not imply publication.
- Forms are user-extensible records or bounded descriptions, not a hardcoded
  enum. Examples may be offered without limiting what the user can specify.
- The assistant must not ask for a form merely because it is absent.
- Form guidance may shape framing but must not make the assistant impose a
  template, prematurely ask composition questions, or replace inquiry into what
  the user thinks.
- Current explicit user direction always overrides form guidance.
- Product code remains independent of host database, auth, AI-provider, and
  publishing infrastructure.

## Out of scope

- Publishing, audience selection, public metadata, reusable form templates,
  form-specific questionnaires, automatic form inference, recommended forms,
  general preference learning, voice profiles, or multiple simultaneous drafts.

## Expected files to create or modify

- product intended-form shared/server/client modules
- workspace loading, persistence ports, and HTTP contracts
- temporary and owner database adapters plus generated migration
- conversation and composition context assembly
- editor controls and conversational confirmation handling
- deterministic product, adapter, browser, and hosted evaluation scenarios
- product brief, architecture, terminology, decisions, progress, and task index

## Definition of done

- A user can set, inspect, change, and clear a free-text intended form at any
  point in a temporary or owner workspace.
- The value survives reload for the applicable workspace lifetime and remains
  private unless a later explicit publishing operation uses it.
- Conversation and composition receive the same validated intended-form guidance.
- A known form can improve relevant framing without forcing a template or
  entering canonical idea material as though it were part of the idea itself.
- With no intended form, the existing complete Discovery and Composition flows
  remain effective and do not nag the user for one.
- Form, audience, visibility, publishing intent, preferences, and draft content
  remain observably distinct.
- Equivalent explicit UI and conversational commands produce the same state;
  ambiguous model output cannot silently change it.
- Product, HTTP, temporary persistence, Prisma persistence, client, browser, and
  model-policy regressions are covered.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

Run focused hosted evaluations for form-aware and no-form Discovery when
credentials are available; they remain non-CI checks.

## Risks / implementation decisions

- Settle the smallest validated free-text representation and length bound.
- Settle whether conversation recognition shares the existing structured model
  response or uses a narrower command interpretation boundary.
- Ensure durable storage belongs to workspace persistence without turning form
  into draft content or host publishing metadata.
- Evaluate whether form-aware framing is genuinely useful and subtle rather than
  simply adding genre-shaped leading questions.

## Blast radius

Medium to high: new product state and commands, temporary and Prisma persistence,
conversation and composition context, editor controls, model policy, and
canonical documentation. It requires separate review and explicit approval.

## Status

Proposed on 2026-08-03. Awaiting review after Task 032's corrective pass.
