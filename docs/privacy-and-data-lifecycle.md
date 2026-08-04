# Platform privacy and data lifecycle

Last reviewed: 1 August 2026.

This note records the shared privacy boundary for the personal site and product
demo platform. Product-specific processing belongs in each product's own
documentation. This is a proportionate engineering risk note, not a claim of
complete legal or regulatory compliance.

## Authentication

- A visitor supplies an email address for passwordless access.
- Resend processes the address and magic-link email content for delivery.
- The site stores user, session, account, and verification records in its
  Neon-hosted Postgres database through Better Auth.
- Authentication records are retained while access is needed or until a verified
  deletion request can be completed, subject to necessary security or legal
  retention. There is currently no application-defined automatic deletion
  schedule for these records.

## Product privacy information

Each product owns the explanation of the information it processes, the purpose,
product-specific providers, retention behavior, and user controls. A product may
publish that explanation through a product-owned privacy route registered in the
shared product registry.

The host privacy page tells visitors that product privacy pages may exist,
encourages review before using any demo, and renders available links from product
registry metadata. The host does not duplicate product concepts or lifecycle
details.

Current product notes:

- `docs/products/thoughtform/privacy-and-data-lifecycle.md`

## Shared third parties

The current shared platform flow is expected to involve:

- Resend for magic-link email delivery.
- Neon, now part of Databricks, for hosted Postgres storage.

Product-specific providers are documented by the relevant product. Provider
policies, subprocessors, retention practices, and processing locations may
change; summaries must be rechecked before a material launch or provider change.

## Logging boundary

Application code does not intentionally log product-submitted content or
generated content. Deployment-level access and request logging must be checked
separately before public launch.

## Primary risks and mitigations

### Host disclosure becomes coupled to product behavior

Risk: platform copy can become stale or violate product boundaries when it
duplicates a product's processing lifecycle.

Mitigations: keep product details in product-owned pages and documentation; use
the registry only to make those pages discoverable from the host.

### Provider policy drift

Risk: a dated summary becomes inaccurate after a provider changes its terms or
technical behavior.

Mitigations: date summaries, link official sources, avoid guarantees about
third-party behavior, and review before launches or provider changes.

### Logs capture submitted content

Risk: application or deployment logging records information entered into a
product.

Mitigations: application code does not log request or response bodies. Hosting and
proxy logging remain a pre-launch operational check.

## When to revisit

Review this note before public launch and whenever the site changes its
authentication, email provider, database host, deployment architecture, logging,
analytics, product registry privacy metadata, or privacy contact process.
