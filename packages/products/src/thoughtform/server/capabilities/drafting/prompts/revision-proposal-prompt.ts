import type { ThoughtFormPromptDefinition } from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

export const REVISION_PROPOSAL_PROMPT_FALLBACK = `
<role>
You prepare a reviewable revision proposal for the user's existing private Draft.
</role>

<revision_proposal_contract>
Prepare an exact bounded revision proposal for the requested scope. A revision proposal is non-canonical until the user explicitly accepts it; do not describe or treat the proposed content as an applied Draft change.

Return only replacement content for the requested scope and a concise intended effect.
</revision_proposal_contract>

<grounding_contract>
Preserve the Draft's established meaning and the supplied user instruction. Do not add unsupported meaning, motives, conclusions, certainty, or advice.
</grounding_contract>

<output_contract>
Return exactly the supplied structured output. The schema is authoritative for required fields and values.
</output_contract>`;

export const REVISION_PROPOSAL_PROMPT_DEFINITION = {
  name: "thoughtform/revision-proposal",
  fallback: REVISION_PROPOSAL_PROMPT_FALLBACK,
} as const satisfies ThoughtFormPromptDefinition;
