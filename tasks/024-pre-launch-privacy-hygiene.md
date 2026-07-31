# Task 024 — Pre-launch privacy hygiene

## Goal

Establish a proportionate privacy baseline before the public website allows visitors to use real-LLM product demos.

Minimise avoidable third-party retention immediately, explain the actual data lifecycle in plain language, and ensure temporary demo data is isolated and genuinely temporary without presenting the portfolio site as a regulated commercial service.

## Why this task is next

Task 022 introduced real OpenAI API calls. The current client does not disclose that processing before a user submits writing, the Responses API request does not explicitly disable provider application-state storage, and the shared in-memory conversation adapter is not safely scoped for public multi-user access.

These are pre-launch safeguards. They should be completed before the real-LLM demo becomes publicly available, independently of the longer product roadmap.

## Scope

- Set `store: false` explicitly on OpenAI Responses API requests to minimise provider-side application-state retention.
- Add a focused adapter test proving that OpenAI requests disable storage rather than relying on provider defaults.
- Add a concise, product-owned acknowledgement screen before any Socratic Draft editor controls can submit writing.
- Explain that messages are sent through the application server to OpenAI to generate responses.
- Explain that non-owner conversations are held temporarily in application memory and are not saved durably, while owner conversations may be stored in the site's database.
- State that the demo is not a confidential professional, medical, legal, or therapeutic service and advise users not to submit unnecessary identifying, confidential, or highly sensitive information about themselves or other people.
- Require an affirmative acknowledgement for the current browser session before opening the editor; do not preselect or infer acknowledgement from authentication.
- Provide a clear way to leave without entering the editor. Leaving must not send writing to the API or LLM.
- Add a concise public privacy page covering authentication data, conversation processing, current retention behaviour, relevant third parties, user choices, and a contact route for privacy or deletion requests.
- Link the acknowledgement to the privacy page and to the current official privacy/data-policy pages for relevant third-party services.
- Date descriptions of third-party policies and make clear that they are summaries of current published terms, may change, and should be checked directly with the provider.
- Avoid promising that third-party policies, retention periods, training practices, subprocessors, or data locations will remain unchanged.
- Define and document the temporary conversation lifecycle, including an inactivity expiry, an absolute maximum lifetime, and explicit clearing.
- Scope every in-memory conversation to the authenticated user and use unguessable entry identifiers so one visitor cannot access another visitor's temporary conversation.
- Ensure application logs do not include conversation message bodies or generated writing.
- Add a small repo-owned data-lifecycle and risk note recording what is processed, where it goes, what is retained, the chosen retention periods, primary risks, and mitigations.
- Add behaviour-focused tests for the acknowledgement gate, OpenAI storage configuration, temporary-session isolation, expiry, clearing, and public privacy route.
- Update `progress.md`, `tasks/README.md`, and `docs/decisions.md` only if an architectural decision changes.

## Out of scope

- A claim or guarantee of complete legal or regulatory compliance.
- Formal legal advice or definitive selection of GDPR lawful bases.
- A full consent ledger, privacy dashboard, or automated data-subject-request system.
- Visitor database persistence or cross-device conversation continuity.
- Enterprise OpenAI Zero Data Retention, regional processing, or procurement work.
- Automated monitoring of third-party policy changes.
- Publishing, public writing, usage limits, or admin analytics.
- General-purpose retention infrastructure for future products that do not yet exist.
- A large formal DPIA; the repo note should record a proportionate risk assessment and when it should be revisited.

## Expected files to create or modify

The exact split may change during implementation if a smaller, clearer structure emerges, but the expected surfaces are:

- `packages/ai/src/openai-llm-client.ts`
- `packages/ai/src/openai-llm-client.test.ts`
- `packages/db/src/socratic-draft/in-memory-conversation-store.ts`
- `packages/db/src/socratic-draft/in-memory-conversation-store.test.ts`
- `packages/db/src/socratic-draft/conversation-store-resolver.ts` and related tests
- product-owned acknowledgement UI and tests under `packages/products/src/socratic-draft/client/`
- the host/product composition boundary needed to provide the current persistence mode
- `packages/products/src/socratic-draft/client/app/routes.tsx` and route tests
- a public privacy page and route under `apps/client/src/`
- navigation or footer links needed to make the privacy page discoverable
- `docs/privacy-and-data-lifecycle.md`
- `tasks/README.md`
- `progress.md`
- `docs/decisions.md` only if a decision changes

## Definition of done

- Every OpenAI Responses API request explicitly sets `store: false`, covered by an automated test.
- No user writing is sent to the application API or OpenAI before affirmative acknowledgement.
- The acknowledgement accurately distinguishes owner database persistence, non-owner temporary application memory, and OpenAI processing.
- The acknowledgement and privacy page link users to official third-party policies, identify the summaries as dated/current information, and encourage direct verification because provider policies can change.
- The site does not guarantee third-party behaviour beyond the provider's current published policy and the application's own configuration.
- Temporary conversations are isolated by authenticated user, use unguessable identifiers, expire according to a documented policy, and can be explicitly cleared.
- Tests prove one authenticated user cannot read or continue another user's temporary conversation.
- Conversation and generated-writing bodies are not written to application logs by code in scope.
- The public privacy page explains the relevant lifecycle, retention boundaries, third parties, and privacy contact route in clear language.
- A concise repo-owned data-lifecycle and risk note documents the implementation and its known limitations.
- Relevant tests, typecheck, build, and diff whitespace validation pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- **Provider policy drift:** dated summaries and direct links reduce the risk of stale claims but do not remove the need to review disclosures before material launches or provider changes.
- **OpenAI retention boundary:** `store: false` disables Responses API application-state storage but does not itself guarantee zero retention for abuse monitoring or other provider obligations. Wording must preserve that distinction.
- **Acknowledgement versus consent:** this task implements proportionate disclosure and affirmative acknowledgement. It must not claim to settle every possible lawful-basis or special-category-data question without legal advice.
- **Expiry mechanism:** an in-process store can expire data opportunistically on access without adding a background worker. The implementation should choose the simplest deterministic mechanism that is testable and does not retain expired content indefinitely.
- **Deployment logs:** repository code can prevent intentional body logging, but infrastructure-level request logging must also be checked before public deployment.
- **Third-party scope:** the privacy page should cover only providers actually used in the deployed flow and should link directly to their official current policies.

## Status

Proposed. Awaiting approval.
