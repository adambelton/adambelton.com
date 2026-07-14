# Architecture

This repository is a single monorepo for Adam's personal website and product demos.

The frontend renders the public website, writing, product pages, editor screens, login, and admin UI.

The public website should remain minimal, editorial, image-led where appropriate, and typography-focused. Use semantic HTML first for accessibility. For complex interactive UI, prefer React Aria Components over hand-rolled focus management, keyboard behaviour, ARIA attributes, or screen reader behaviour. Do not use React Aria for ordinary static content or install it speculatively.

The API owns authentication, owner/demo access decisions, product access, usage limits, persistence, AI provider calls, and response streaming.

Shared package boundaries are created early to keep later implementation small and deliberate.
