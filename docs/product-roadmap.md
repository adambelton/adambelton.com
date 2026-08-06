# Product Roadmap

This document records known product directions so architecture decisions can account for both current and likely future use cases.

It is context, not approval to build future product behaviour. Each product still needs its own task proposals before implementation.

## ThoughtForm

ThoughtForm is the first product in the repo.

It is a private conversational thinking workspace that helps a person explore,
organise, and express what they think or feel. Conversation and the idea map
support Discovery and may remain useful without any Draft. When bringing the
material together would help, Composition creates an optional user-owned Draft
containing a first-person articulation of the user's current understanding.
Reviewing and correcting that whole expression creates the product's
characteristic recognition value, but there is no completion state or required
artifact.

Conversation messages preserve the exploration history. The idea map maintains
ideas, distilled syntheses, richer substance, contextual importance, exploration,
and potentially differing user and assistant assessments. A draft is separate,
mutable, and authoritative when directly edited by the user. Assistant changes
require explicit approval.

The product is divided conceptually into conversation and inquiry, idea mapping,
drafting and revision, and workspace orchestration. These
capabilities should have narrow contracts and be developed through working
end-to-end slices. The product brief and product architecture describe both baseline
behaviour and longer-term direction for each capability.

The product package should remain the source of truth for ThoughtForm
concepts, conversation contracts, client screens, server behaviour, and
product-specific persistence ports. The host provides infrastructure such as
auth, AI services, database adapters, and usage limits.

Current implementation status:

- Product package boundary exists.
- Minimal editor UI exists.
- Conversation endpoint exists with real LLM-backed responses and deterministic
  fake-model test/development behaviour.
- Owner auth and owner-only persistence foundation exist.
- Conversation, Idea Map, private Draft, revision history, reviewable proposals,
  and conservative manual-edit interpretation are implemented.
- Sonnet 5 medium effort, Claude-structured prompts, stable-prefix caching,
  bounded full history, concurrent conversation and Idea Map calls, POST SSE,
  resilient asynchronous retention, and paced response presentation are the
  settled baseline. The planned latency experiments are complete; further
  latency work requires new evidence.
- Draft Format has been removed from product, client, temporary persistence,
  durable persistence, and database state.
- Complete demo lifecycle hardening, calibrated usage limits, autonomous
  user-correctable idea merge/split behaviour, release readiness, and admin
  visibility remain planned.
- Preference learning, product-owned export, and product publishing are not in
  the ThoughtForm roadmap.
- Autonomous, user-correctable Idea Map merge/split behaviour remains required
  before the editor is fully functional but still needs a bounded proposal.

## Public website writing

Public writing is a host-website capability deliberately separate from the
product. The owner workflow uses repository-backed Markdown authored through
Obsidian. The host owns page/post ingestion, metadata validation, creation-date
ordering, routing, and static client rendering. Initial placeholder documents
establish the pipeline before final content and production deployment.

ThoughtForm is not responsible for export, publication, CMS behaviour, or the
public-content lifecycle.

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
