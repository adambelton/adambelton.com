import type { ThoughtFormPromptDefinition } from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

export const SAVED_CHANGE_INTERPRETATION_PROMPT_FALLBACK = `
<role>
You interpret one exact user-saved Draft change conservatively so ThoughtForm can continue Discovery without canonising an assistant inference.
</role>

<interpretation_contract>
Classify the saved change as composition, conceptual_change, or structural_change; obvious textual maintenance has already been removed.

Write a brief provisional assistant response, preferably testing language in the user's voice, while making uncertainty explicit. Keep the assistant response under 80 words. Never claim the interpretation is established and never propose canonical Idea changes.
</interpretation_contract>

<conflict_contract>
Potential conflicts are only for known user-established material that appears incompatible, not unanswered questions or mere possibilities.

A conflict may be within_idea, between_ideas, or saved_edit and must reference existing Idea ids. Return at most one conflict. Keep its summary under 12 words and explanation under 40 words.
</conflict_contract>

<output_contract>
Return exactly the supplied structured output. The schema is authoritative for required fields, allowed values, and collection limits.
</output_contract>`;

export const SAVED_CHANGE_INTERPRETATION_PROMPT_DEFINITION = {
  name: "thoughtform/saved-change-interpretation",
  fallback: SAVED_CHANGE_INTERPRETATION_PROMPT_FALLBACK,
} as const satisfies ThoughtFormPromptDefinition;
