# Product Roadmap

This document records known product directions so architecture decisions can account for both current and likely future use cases.

It is context, not approval to build future product behaviour. Each product still needs its own task proposals before implementation.

## The Socratic Draft

The Socratic Draft is the first product in the repo.

It is a shared inquiry and articulation workspace that helps a person work out
what they think and express it in their own voice. Conversation supports discovery
and articulation, an inspectable idea map makes the assistant's interpretation
visible and negotiable, and a user-owned draft contains the current expression of
selected ideas. The user and assistant may move back and forth between discovery
and articulation as writing exposes further questions.

Conversation messages preserve the exploration history. The idea map maintains
ideas, summaries, contextual importance, exploration, and potentially differing
user and assistant assessments. A draft is separate, mutable, and authoritative
when directly edited by the user. Assistant changes require explicit approval.
Publishing later creates site-level public writing from the private draft.

The product is divided conceptually into conversation and inquiry, idea mapping,
drafting and revision, preference learning, and workspace orchestration. These
capabilities should have narrow contracts and be developed through working
end-to-end slices. The product brief and product architecture describe both baseline
behaviour and longer-term direction for each capability.

The product package should remain the source of truth for Socratic Draft concepts, conversation contracts, client screens, server behaviour, and product-specific persistence ports. The host provides infrastructure such as auth, AI services, database adapters, usage limits, and publishing integration.

Current implementation status:

- Product package boundary exists.
- Minimal editor UI exists.
- Conversation endpoint exists with real LLM-backed responses and deterministic
  fake-model test/development behaviour.
- Owner auth and owner-only persistence foundation exist.
- Conversation policy remains minimal and does not yet drive meaningful moves,
  ideas, readiness, discovery, or articulation state.
- Idea mapping, private drafts, revision proposals, preference learning, complete
  demo export, calibrated usage limits, publishing, and admin are not implemented.

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
