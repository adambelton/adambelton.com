# Architecture

This repository is a single monorepo for Adam's personal website and product demos.

The frontend renders the public website, writing, product pages, editor screens, login, and admin UI.

The host website uses a client-first architecture with Vite and React Router. Routing, product mounting, auth state, and API boundaries are explicit while product packages remain portable. The deprecated Next.js host has been removed.

The public website should remain minimal, editorial, image-led where appropriate, and typography-focused. Use semantic HTML first for accessibility. For complex interactive UI, prefer React Aria Components over hand-rolled focus management, keyboard behaviour, ARIA attributes, or screen reader behaviour. Do not use React Aria for ordinary static content or install it speculatively.

Public pages and writing posts are host-owned Markdown committed beneath
`apps/client/src/content`. A narrowly scoped host Vite plugin parses, validates,
sanitizes, orders, and compiles the complete collection into a browser-safe
generated module during development and production builds. Files are authored
through Obsidian-compatible standard Markdown and YAML properties; authoring
parsers remain build-only, and this content pipeline remains independent of
ThoughtForm. The authoring contract lives in `docs/content-authoring.md`.

The API owns authentication, owner/demo access decisions, product access, usage limits, persistence, AI provider calls, and response streaming.

Client-side route gates are UX affordances only. API/server authorization is the authoritative security boundary for sensitive operations. Product catalogue and overview information may be public while an incomplete product workspace and every operation behind it remain owner-only.

Shared package boundaries are created early to keep later implementation small and deliberate.

## Organisation system

Repository structure communicates architecture. Every directory level is
organised by ownership first, architectural role second, and business capability
third. The repository-wide tree and plain-language vocabulary are documented in
the root `README.md`. Each product owns its detailed tree, integration guide,
and diagnostic map in a README at the product root. Both levels are part of
this architecture.

This order exists to optimise for diagnosis and safe change. Ownership identifies
who is authoritative about meaning. Architectural role separates rules,
coordination, delivery, and mechanisms. Capability keeps related product
decisions together. File responsibility limits the reasons one implementation
unit changes. A path should therefore answer progressively more specific
questions rather than mixing unrelated classification systems at one level.

The organisation is governed by these principles:

- **Paths are operational maps.** A contributor should be able to route a bug
  report from user-visible behaviour to its likely owner without reconstructing
  the repository's history.
- **Policy is independent from mechanism.** Product and platform capabilities
  own meaning; hosts and infrastructure supply provider, protocol, persistence,
  and deployment mechanics through ports and adapters.
- **Dependencies flow inward toward meaning.** Composition roots know concrete
  implementations. Product capabilities know only their own contracts.
- **Coordination does not absorb capability rules.** Application operations
  sequence work but do not become alternative domain modules.
- **Verification follows ownership.** Tests remain beside the behaviour or
  boundary they prove, while different kinds of reusable test support are named
  and separated explicitly.
- **Abstractions require evidence.** New layers, folders, ports, or shared code
  are introduced only for an implemented responsibility, not anticipated use.
- **One vocabulary applies everywhere.** The same terms mean the same thing in
  apps, packages, products, documentation, and tests.

- `apps` are deployable hosts. Their `bootstrap` code starts the runtime and
  assembles dependencies; `platform` contains host-wide capabilities; `products`
  mounts individual products and supplies their adapters.
- `packages` are reusable ownership boundaries. `shared` contains only
  platform-wide contracts; `products` owns product definitions and behaviour;
  `auth`, `ai`, `observability`, and `db` own their named platform or
  infrastructure concerns. `observability` contains runtime-neutral contracts
  shared by browser and server; deployable hosts own concrete telemetry SDKs,
  credentials, export policy, and access-aware adapter selection.
- A product's server separates `capabilities`, cross-capability `application`
  operations, and inbound `delivery`. Required external operations are explicit
  product-owned `ports` inside the capability that needs them.
- Concrete adapters live with the host or infrastructure owner that implements
  the mechanism, never in the product capability that describes the need.
- Colocated tests protect neighbouring behaviour. Reusable fakes, fixtures,
  browser journeys, and hosted evaluations use their explicit `testing`
  subdirectories. Repository-wide dependency checks live under
  `tests/architecture`.

Generic technical categories must not hide ownership. Empty speculative
directories and catch-all `helpers`, `utilities`, or `services` folders are not
part of this architecture. A new role or exception requires an explicit
decision before code adopts it.

Product-specific architectures may define domain concepts, capability boundaries,
state ownership, and product flows beneath these host/package rules. The canonical
ThoughtForm product architecture is
`docs/products/thoughtform/thoughtform-architecture.md`; its concise,
self-contained navigation guide is `packages/products/src/thoughtform/README.md`.
