# Architecture

This repository is a single monorepo for Adam's personal website and product demos.

The frontend renders the public website, writing, product pages, editor screens, login, and admin UI.

The API owns authentication, owner/demo access decisions, product access, usage limits, persistence, AI provider calls, and response streaming.

Shared package boundaries are created early to keep later implementation small and deliberate.
