# Product Roadmap

This document records known product directions so architecture decisions can account for both current and likely future use cases.

It is context, not approval to build future product behaviour. Each product still needs its own task proposals before implementation.

## The Socratic Draft

The Socratic Draft is the first product in the repo.

It is a writing tool that helps a person work out what they think before turning those thoughts into public writing. The product should guide a conversational drafting process, identify claims and gaps, ask useful questions, and eventually help turn private working entries into publishable writing.

The product package should remain the source of truth for Socratic Draft concepts, conversation contracts, client screens, server behaviour, and product-specific persistence ports. The host provides infrastructure such as auth, AI services, database adapters, usage limits, and publishing integration.

Current implementation status:

- Product package boundary exists.
- Minimal editor UI exists.
- Conversation endpoint exists with deterministic stub behaviour.
- Owner auth and owner-only persistence foundation exist.
- Real LLM-backed writing behaviour, entry management, demo usage limits, and publishing are not implemented yet.

## Care Calendar

Care Calendar is a future health-tech learning project.

It is intended to be a patient-and-carer care calendar that brings appointments and planned visits from multiple healthcare and social-care services into one accessible interface. It should help people understand what is happening, which organisation owns each appointment or next action, where the information came from, how current it is, and what to do when something appears incorrect or unclear.

Later releases may add carefully bounded interactions with simulated external provider systems, such as correction requests, concerns, acknowledgements, and status updates. The purpose is to demonstrate safe handling of asynchronous workflows, provenance, permissions, communication needs, degraded states, misleading or incomplete information, and explicit limits of confidence.

This product is meant to support learning and portfolio evidence around:

- DTAC-style thinking
- data protection
- accessibility
- the Accessible Information Standard
- security
- interoperability
- DCB0129-style clinical-risk thinking
- safe product design for healthcare and social care contexts

This is not being built now. It is recorded here only because it affects architectural fit: future products may need explicit security boundaries, host-provided infrastructure, product-owned contracts, auditability, provenance, permissions, and safe degraded states.
