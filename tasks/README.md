# Tasks

## Proposal review

Proposal reviews distinguish blockers, clarifications, implementation decisions,
and previously settled decisions using the authority order in `AGENTS.md`.

After approval, the task records a concise `Approval record` containing:

- the approval date;
- intentional scope boundaries and important deferrals;
- implementation decisions the task is expected to settle;
- decisions that were reviewed and should not be reopened without a cited
  authoritative conflict or genuinely new evidence.

The approval record preserves review reasoning across conversations. It does not
change the proposal or grant approval for a later task.

## Planned

- 036 — Complete temporary workspace lifecycle and recovery
- 038 — Content-free hosted-attempt lifecycle and accounting
- 039 — Representative hosted-usage measurement
- 040 — Calibrated atomic usage enforcement

The unnumbered correction tasks must be completed before the remaining planned
product work is reviewed or resumed. Task 036 will require a fresh dependency
and language review after the corrections; preference learning must no longer be
a prerequisite.

Tasks 035 and 041 are retired from the active roadmap. Potentially useful ideas
from them—explicit current guidance, user correction, inspectability, narrow
scope, and current instructions taking precedence—will be retained as deferred
design considerations by the course-correction task. Output-format guidance,
inferred profiles, and cross-work preference learning are not planned product
capabilities.

Task 037 is retired because export is outside the ThoughtForm product
boundary. Tasks 042 and 043 are removed from the active product sequence. Public
writing remains valid later host-website delivery work after ThoughtForm v1
is ready for release, expected to begin with local Markdown content and static
site pages rather than a product publishing capability.

## In progress

- Instrument ThoughtForm latency (unnumbered)
- 044 — Admin visibility
- 045 — Dedicated Neon test-database workflow

## Completed

- Cache Claude's stable ThoughtForm prompt (unnumbered)
- Restructure the ThoughtForm prompt for Claude (unnumbered)
- Evaluate Sonnet 5 medium effort (unnumbered)
- Complete the Braintrust FIFA baseline (unnumbered)
- Adopt GPT-5.6 Terra as the OpenAI comparison baseline (unnumbered)
- Strengthen ThoughtForm's provider boundary and first-session experience (unnumbered)
- Add Anthropic provider support and adopt Sonnet 5 (unnumbered)
- Rename the product to ThoughtForm (unnumbered)
- ThoughtForm conversational-thinking course correction (unnumbered)
- Remove ThoughtForm Format (unnumbered)
- Align the ThoughtForm conversational-thinking experience (unnumbered)
- 034 — Conservative substantive-edit interpretation
- 033 — Optional Draft Format
- Repository organisation baseline (unnumbered maintenance task)
- 032 — Saved draft-change context and user-directed discussion
- 031 — Private drafts, revision history, approved proposals, and corrective audit pass
- 030 — Meaningful discovery and composition readiness
- 029 — Discovery and composition terminology correction
- 028 — Idea-map baseline
- 027 — Workspace and capability foundations
- 026 — Hosted-AI immediate safety boundaries
- 025 — Demo ephemeral mode
- 024 — Pre-launch privacy hygiene
- 001 — Scaffold repo architecture and context files
- 002 — Shared types and product registry
- 003 — Minimal styling foundation
- 004 — Static site routes with empty writing collection
- 005 — Adopt code quality and testing guidelines
- 006 — ThoughtForm product boundary and conversation service
- 007 — Product dependency boundary
- 008 — Conversation endpoint with in-memory host adapter
- 009 — Public site accessibility baseline
- 010 — Editor UI wired to fake conversation endpoint
- 011 — Prisma database schema and ThoughtForm repository
- 012 — Neon development database setup
- 013 — Mountable product app boundary
- 014 — Owner auth
- 015 — Client-first host architecture decision
- 016 — Prepare client app scaffold
- 017 — Port shared website shell
- 018 — Port auth UX to Vite client
- 019 — Port product mounting to React Router
- 020 — Remove Next app
- 021 — Full-codebase audit fixes
- 022 — Real LLM client
- 023 — Owner persistent conversations
