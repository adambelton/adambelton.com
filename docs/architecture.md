# Architecture

This repository is a single monorepo for Adam's personal website and product demos.

The frontend renders the public website, writing, product pages, editor screens, login, and admin UI.

The host website uses a client-first architecture with Vite and React Router. Routing, product mounting, auth state, and API boundaries are explicit while product packages remain portable. The deprecated Next.js host has been removed.

The public website should remain minimal, editorial, image-led where appropriate, and typography-focused. Use semantic HTML first for accessibility. For complex interactive UI, prefer React Aria Components over hand-rolled focus management, keyboard behaviour, ARIA attributes, or screen reader behaviour. Do not use React Aria for ordinary static content or install it speculatively.

The API owns authentication, owner/demo access decisions, product access, usage limits, persistence, AI provider calls, and response streaming.

Client-side route gates are UX affordances only. API/server authorization is the authoritative security boundary for sensitive operations.

Shared package boundaries are created early to keep later implementation small and deliberate.

Product-specific architectures may define domain concepts, capability boundaries,
state ownership, and product flows beneath these host/package rules. The canonical
Socratic Draft product architecture is
`docs/products/socratic-draft/the-socratic-draft-architecture.md`.
