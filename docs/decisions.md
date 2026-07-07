# Decisions

## 001 — Single Personal-Site Repo

This repo is the single repo for Adam's personal website, public writing, product pages, product demos, shared API/server, auth, database, AI infrastructure, usage tracking, and admin.

The Socratic Draft is the first product inside this system, not the whole app.

## 002 — Final-Shaped Package Scaffold From Day One

The repo should include the intended long-term package boundaries from the beginning:

- `apps/web`
- `apps/api`
- `packages/shared`
- `packages/db`
- `packages/auth`
- `packages/ai`
- `packages/products`

Even if some packages are initially thin, implementation should happen in the correct place from the start.

## 003 — Shared Types First

Types that cross package boundaries belong in `packages/shared`.

Do not create ad hoc duplicate types inside apps or feature folders.

## 004 — Product-Specific Logic Belongs in packages/products

The Socratic Draft conversation policy, prompts, moves, phases, readiness logic, thread handling, claim handling, and composition behaviour belong in `packages/products`.

## 005 — API Routes Stay Thin

`apps/api` should expose routes and controllers, but domain behaviour belongs in packages.

## 006 — Frontend Does Not Choose Socratic Draft Assistant Moves

For The Socratic Draft, the frontend should send ordinary user messages. The backend conversation service chooses the assistant move.

The frontend should not send explicit actions like `challenge`, `reflect`, or `compose_private` as the core interaction model.

## 007 — Demo Writing Is Ephemeral

Demo users may authenticate and use hosted AI within limits, but their writing/conversation content must not be persisted server-side.

Owner writing may be persisted.

## 008 — Published Writing Is Site-Level

Published writing belongs to the personal website's writing system.

The Socratic Draft can create private entries and later publish into the site-wide writing system, but public writing should not be tightly coupled to one product.
