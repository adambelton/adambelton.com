import {
  HOSTED_ATTEMPT_ACTIONS,
  type HostedAttemptAction,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

export const USAGE_MEASUREMENT_MODEL_PROFILE = {
  provider: "anthropic",
  model: "claude-sonnet-5",
  effort: "medium",
} as const;

export type UsageMeasurementJourneyAction =
  | { type: "conversation_turn"; message: string }
  | { type: "compose_draft"; instruction: string }
  | { type: "propose_and_accept_revision"; instruction: string }
  | { type: "save_and_interpret_change"; replacement: string }
  | { type: "apply_user_structural_correction"; operation: "merge" | "split" };

export interface UsageMeasurementScenario {
  id: string;
  description: string;
  form: "short" | "long";
  actions: readonly UsageMeasurementJourneyAction[];
}

export const USAGE_MEASUREMENT_SCENARIOS = [
  {
    id: "guided-vague-discovery",
    description: "Guided Discovery from a deliberately vague opening without composing a Draft.",
    form: "short",
    actions: [
      { type: "conversation_turn", message: "Something about my work has been bothering me, but I cannot yet name it." },
      { type: "conversation_turn", message: "I think the tension is between being useful and being honest about what I can sustain." },
      { type: "conversation_turn", message: "I want to understand that tension rather than solve it immediately." },
    ],
  },
  {
    id: "strong-view-early-draft",
    description: "User-led Discovery from a strong initial view followed by early Draft composition.",
    form: "short",
    actions: [
      { type: "conversation_turn", message: "Convenience is not neutral when somebody else's effort is hidden from the beneficiary." },
      { type: "compose_draft", instruction: "Compose a concise articulation of the view as it stands." },
    ],
  },
  {
    id: "long-discovery-later-draft",
    description: "Long-form Discovery followed by later Draft composition.",
    form: "long",
    actions: [
      { type: "conversation_turn", message: "I am deciding whether to take a role that offers influence but less freedom." },
      { type: "conversation_turn", message: "The influence matters because I could improve decisions that currently frustrate me." },
      { type: "conversation_turn", message: "The lost freedom matters because unstructured time is how I recover and think." },
      { type: "conversation_turn", message: "I do not want ambition to make that cost invisible." },
      { type: "conversation_turn", message: "Perhaps the real question is what conditions would make the trade worthwhile." },
      { type: "conversation_turn", message: "I can now state the opportunity, the cost, and the conditions without pretending certainty." },
      { type: "compose_draft", instruction: "Compose the current understanding, preserving the unresolved decision." },
    ],
  },
  {
    id: "revision-proposal-acceptance",
    description: "Draft revision proposal generation followed by non-hosted acceptance.",
    form: "short",
    actions: [
      { type: "conversation_turn", message: "I want to explain why preserving authorship matters when an assistant helps with wording." },
      { type: "compose_draft", instruction: "Compose a short first-person Draft." },
      { type: "propose_and_accept_revision", instruction: "Clarify the distinction between assistance and authorship." },
    ],
  },
  {
    id: "meaningful-saved-change",
    description: "Meaningful direct Draft edit followed by saved-change interpretation.",
    form: "short",
    actions: [
      { type: "conversation_turn", message: "I want to leave, and I feel guilty about wanting it." },
      { type: "compose_draft", instruction: "Compose the tension without resolving it." },
      { type: "save_and_interpret_change", replacement: "I want to leave, and the guilt may be grief rather than evidence that leaving is wrong." },
    ],
  },
  {
    id: "idea-structure-correction",
    description: "Autonomous Idea Map structural interpretation followed by a user correction.",
    form: "long",
    actions: [
      { type: "conversation_turn", message: "I keep treating autonomy and independence as one concern, but they may not be the same." },
      { type: "conversation_turn", message: "Autonomy is choosing my direction; independence is avoiding reliance on other people." },
      { type: "conversation_turn", message: "Those ideas should remain distinct even though they interact." },
      { type: "apply_user_structural_correction", operation: "split" },
    ],
  },
] as const satisfies readonly UsageMeasurementScenario[];

export const DEFAULT_USAGE_MEASUREMENT_REPETITIONS = 3;

export function expectedHostedActionsForScenario(
  scenario: UsageMeasurementScenario,
): HostedAttemptAction[] {
  return scenario.actions.flatMap((action) => {
    switch (action.type) {
      case "conversation_turn":
        return [
          HOSTED_ATTEMPT_ACTIONS.conversationResponse,
          HOSTED_ATTEMPT_ACTIONS.ideaMapAnalysis,
        ];
      case "compose_draft":
        return [HOSTED_ATTEMPT_ACTIONS.draftComposition];
      case "propose_and_accept_revision":
        return [HOSTED_ATTEMPT_ACTIONS.revisionProposal];
      case "save_and_interpret_change":
        return [HOSTED_ATTEMPT_ACTIONS.savedChangeInterpretation];
      case "apply_user_structural_correction":
        return [];
    }
  });
}

export function countExpectedHostedOperations(
  repetitions = DEFAULT_USAGE_MEASUREMENT_REPETITIONS,
) {
  return USAGE_MEASUREMENT_SCENARIOS.reduce(
    (total, scenario) => total + expectedHostedActionsForScenario(scenario).length * repetitions,
    0,
  );
}
