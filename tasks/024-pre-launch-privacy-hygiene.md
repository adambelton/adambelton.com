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
- Rename the host-owned `LlmConversationModel` bridge to `LlmConversationModelAdapter` so its role as composition glue between the ThoughtForm `ConversationModel` port and the platform `LlmClient` is explicit.
- Move that adapter out of the product route module into a generically named host composition file such as `apps/api/src/adapters.ts`; do not introduce ThoughtForm-named files inside the host app.
- Add a concise, product-owned acknowledgement screen before any ThoughtForm editor controls can submit writing.
- Explain that messages are sent through the application server to OpenAI to generate responses.
- Explain that non-owner conversations are held temporarily in application memory and are not saved durably, while owner conversations may be stored in the site's database.
- State that the demo is not a confidential professional, medical, legal, or therapeutic service and advise users not to submit unnecessary identifying, confidential, or highly sensitive information about themselves or other people.
- Require an affirmative acknowledgement for the current browser session before opening the editor; do not preselect or infer acknowledgement from authentication.
- Provide a clear way to leave without entering the editor. Leaving must not send writing to the API or LLM.
- Add a concise public privacy page covering authentication data, conversation processing, current retention behaviour, relevant third parties, user choices, and a contact route for privacy or deletion requests.
- Keep the host privacy page product-agnostic: shared platform processing belongs on `/privacy`, while product-specific processing belongs on a public product-owned privacy route. The host must explain that product privacy pages may exist, encourage review before using a demo, and discover available notices through product registry metadata.
- Link the acknowledgement to the privacy page and to the current official privacy/data-policy pages for relevant third-party services.
- Date descriptions of third-party policies and make clear that they are summaries of current published terms, may change, and should be checked directly with the provider.
- Avoid promising that third-party policies, retention periods, training practices, subprocessors, or data locations will remain unchanged.
- Allow each authenticated non-owner user to have at most one temporary conversation in application memory at a time; owner users retain the existing durable multiple-conversation model.
- Give each temporary conversation a fixed 24-hour maximum lifetime measured from its creation time. Returning to or continuing a conversation must not extend that deadline.
- Enforce expiry whenever temporary conversations are resolved, read, or changed, and add lightweight cleanup so expired content is released even when its user does not return.
- Scope every in-memory conversation to the authenticated user and use an unguessable conversation identifier so one visitor cannot access another visitor's temporary conversation.
- Restore an authenticated non-owner user's current unexpired temporary conversation when they reload the editor or navigate away and return.
- Treat restoration as best effort: process restarts, deployment changes, or requests reaching a different application instance may remove a temporary conversation before its 24-hour deadline and must result in a safe empty-editor state.
- Add an authenticated clear-conversation operation and an intentional editor action that lets a non-owner immediately delete their temporary conversation and start over.
- Ensure application logs do not include conversation message bodies or generated writing.
- Add a small repo-owned data-lifecycle and risk note recording what is processed, where it goes, what is retained, the chosen retention periods, primary risks, and mitigations.
- Add behaviour-focused tests for the acknowledgement gate, OpenAI storage configuration, temporary-session isolation, expiry, clearing, and public privacy route.
- Update `progress.md`, `tasks/README.md`, and `docs/decisions.md` only if an architectural decision changes.

## Out of scope

- A claim or guarantee of complete legal or regulatory compliance.
- Formal legal advice or definitive selection of GDPR lawful bases.
- A full consent ledger, privacy dashboard, or automated data-subject-request system.
- Visitor database persistence or cross-device conversation continuity.
- Guaranteed recovery of temporary conversations across process restarts, deployments, or multiple application instances.
- Enterprise OpenAI Zero Data Retention, regional processing, or procurement work.
- Automated monitoring of third-party policy changes.
- Publishing, public writing, usage limits, or admin analytics.
- General-purpose retention infrastructure for future products that do not yet exist.
- A large formal DPIA; the repo note should record a proportionate risk assessment and when it should be revisited.

## Expected files to create or modify

The exact split may change during implementation if a smaller, clearer structure emerges, but the expected surfaces are:

- `packages/ai/src/openai-llm-client.ts`
- `packages/ai/src/openai-llm-client.test.ts`
- `apps/api/src/adapters.ts`
- `apps/api/src/routes/products.ts`
- `packages/db/src/thoughtform/in-memory-conversation-store.ts`
- `packages/db/src/thoughtform/in-memory-conversation-store.test.ts`
- `packages/db/src/thoughtform/conversation-store-resolver.ts` and related tests
- product-owned temporary-conversation contracts and HTTP routes under `packages/products/src/thoughtform/server/`
- product-owned acknowledgement UI and tests under `packages/products/src/thoughtform/client/`
- the host/product composition boundary needed to provide the current persistence mode
- `packages/products/src/thoughtform/client/app/routes.tsx` and route tests
- a public privacy page and route under `apps/client/src/`
- a public product-owned privacy page under `packages/products/src/thoughtform/client/`
- optional product privacy-path metadata in `packages/shared/src/products/`
- navigation or footer links needed to make the privacy page discoverable
- `docs/privacy-and-data-lifecycle.md`
- `tasks/README.md`
- `progress.md`
- `docs/decisions.md` only if a decision changes

## Definition of done

- Every OpenAI Responses API request explicitly sets `store: false`, covered by an automated test.
- The host bridge from the ThoughtForm `ConversationModel` port to `LlmClient` is named as an adapter, lives outside the route module, and does not require a ThoughtForm-named host file.
- No user writing is sent to the application API or OpenAI before affirmative acknowledgement.
- The acknowledgement accurately distinguishes owner database persistence, non-owner temporary application memory, and OpenAI processing.
- The acknowledgement and privacy page link users to official third-party policies, identify the summaries as dated/current information, and encourage direct verification because provider policies can change.
- The site does not guarantee third-party behaviour beyond the provider's current published policy and the application's own configuration.
- Each authenticated non-owner has at most one temporary conversation, isolated from every other user and identified by an unguessable conversation ID.
- Temporary conversations expire 24 hours after creation without activity extending the deadline, and expired content is removed without requiring that user to return.
- Reloading the editor or navigating away and returning restores the current unexpired temporary conversation when it remains available in the current application process.
- Process restarts, deployments, or application-instance changes safely fall back to an empty editor and are not represented as durable recovery.
- An authenticated non-owner can explicitly clear their temporary conversation and immediately start over; the clear operation cannot affect another user's conversation.
- Tests prove one authenticated user cannot read or continue another user's temporary conversation.
- Conversation and generated-writing bodies are not written to application logs by code in scope.
- The public privacy page explains the relevant lifecycle, retention boundaries, third parties, and privacy contact route in clear language.
- The host privacy page contains no ThoughtForm lifecycle details and directs users to review available product privacy pages before using a demo.
- The public ThoughtForm privacy route owns its conversation, OpenAI, retention, restoration, clearing, and sensitivity disclosures.
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
- **Expiry mechanism:** use an injectable clock for deterministic boundary tests and the smallest cleanup mechanism that releases expired content even when its user never returns. Avoid making test timing depend on real 24-hour waits.
- **Recovery boundary:** temporary conversation restoration is only best effort while the relevant application memory exists. A multi-instance deployment would need sticky routing or a shared ephemeral store for consistent recovery, neither of which is introduced by this task.
- **Deployment logs:** repository code can prevent intentional body logging, but infrastructure-level request logging must also be checked before public deployment.
- **Third-party scope:** the privacy page should cover only providers actually used in the deployed flow and should link directly to their official current policies.

## Status

Completed.
