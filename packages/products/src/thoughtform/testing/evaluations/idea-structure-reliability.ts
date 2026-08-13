import {
  IDEA_DISPOSITIONS,
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_OPERATION_TYPES,
  type ConversationMessage,
  type Idea,
  type IdeaMap,
  type IdeaStructureOperationType,
} from "packages/products/src/thoughtform/shared";
import {
  applyIdeaStructure,
  IDEA_MAP_UPDATE_STATUSES,
  undoLatestIdeaStructure,
  type ProposedIdeaStructure,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";

export type ExpectedIdeaStructure = IdeaStructureOperationType | "none";

export interface IdeaStructureReliabilityScenario {
  id: string;
  description: string;
  message: string;
  previousMessages: ConversationMessage[];
  ideaMap: IdeaMap;
  expectedStructure: ExpectedIdeaStructure;
  expectedIdeaIds: string[];
  category: "merge" | "split" | "control" | "correction";
}

export interface IdeaStructureReliabilityObservation {
  scenarioId: string;
  repetition: number;
  category: IdeaStructureReliabilityScenario["category"];
  expectedStructure: ExpectedIdeaStructure;
  proposedStructure: ExpectedIdeaStructure;
  hasExpectedReferences: boolean;
  validationStatus: string | null;
}

export interface IdeaStructureReliabilitySummary {
  sampleCount: number;
  expectedChangeCount: number;
  correctChangeCount: number;
  missedChangeCount: number;
  inappropriateChangeCount: number;
  wrongChangeCount: number;
  validationRejectionCount: number;
  correctionSampleCount: number;
  correctionRespectedCount: number;
  observations: IdeaStructureReliabilityObservation[];
}

export const IDEA_STRUCTURE_RELIABILITY_SCENARIOS: readonly IdeaStructureReliabilityScenario[] = [
  mergeScenario("merge-overlapping-accountability", "Public authority must remain answerable.", "Authority loses legitimacy when it avoids being answerable."),
  mergeScenario("merge-overlapping-rest", "Rest protects my ability to think clearly.", "Protecting time to recover lets me think clearly."),
  splitScenario("split-autonomy-and-reliance", "I want freedom to choose my direction. I also want to avoid depending on other people."),
  splitScenario("split-opportunity-and-cost", "The role offers meaningful influence. It would also consume the unstructured time I need to recover."),
  controlScenario("control-related-but-distinct", [
    idea("idea-1", "Autonomy means choosing my own direction."),
    idea("idea-2", "Independence means limiting how much I rely on other people."),
  ], "These ideas interact, but neither one should absorb the other."),
  controlScenario("control-single-coherent-idea", [
    idea("idea-1", "Convenience deserves scrutiny when it merely hides who bears the cost."),
  ], "I want to keep examining the limits of this claim."),
  controlScenario("control-complementary-tension", [
    idea("idea-1", "The opportunity could let me improve important decisions."),
    idea("idea-2", "The role could take away the time I need to recover."),
  ], "Both sides of this trade-off need to remain visible."),
  correctionScenario(),
];

export function observeIdeaStructureReliability(input: {
  scenario: IdeaStructureReliabilityScenario;
  repetition: number;
  proposal: ProposedIdeaStructure | null;
}): IdeaStructureReliabilityObservation {
  const proposedStructure = input.proposal?.type ?? "none";
  const proposedIdeaIds = referencedIdeaIds(input.proposal);
  const hasExpectedReferences = sameValues(proposedIdeaIds, input.scenario.expectedIdeaIds);
  const validationStatus = input.proposal
    ? applyIdeaStructure({
        current: input.scenario.ideaMap,
        request: { ...input.proposal, expectedRevision: input.scenario.ideaMap.revision },
        source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
      }).status
    : null;
  return {
    scenarioId: input.scenario.id,
    repetition: input.repetition,
    category: input.scenario.category,
    expectedStructure: input.scenario.expectedStructure,
    proposedStructure,
    hasExpectedReferences,
    validationStatus,
  };
}

export function summariseIdeaStructureReliability(
  observations: readonly IdeaStructureReliabilityObservation[],
): IdeaStructureReliabilitySummary {
  const expectsChange = (observation: IdeaStructureReliabilityObservation) =>
    observation.expectedStructure !== "none";
  const isCorrectChange = (observation: IdeaStructureReliabilityObservation) =>
    expectsChange(observation) &&
    observation.proposedStructure === observation.expectedStructure &&
    observation.hasExpectedReferences &&
    observation.validationStatus === IDEA_MAP_UPDATE_STATUSES.changed;
  return {
    sampleCount: observations.length,
    expectedChangeCount: observations.filter(expectsChange).length,
    correctChangeCount: observations.filter(isCorrectChange).length,
    missedChangeCount: observations.filter((observation) =>
      expectsChange(observation) && observation.proposedStructure === "none").length,
    inappropriateChangeCount: observations.filter((observation) =>
      !expectsChange(observation) && observation.proposedStructure !== "none").length,
    wrongChangeCount: observations.filter((observation) =>
      expectsChange(observation) && observation.proposedStructure !== "none" && !isCorrectChange(observation)).length,
    validationRejectionCount: observations.filter((observation) =>
      observation.validationStatus !== null &&
      observation.validationStatus !== IDEA_MAP_UPDATE_STATUSES.changed).length,
    correctionSampleCount: observations.filter((observation) => observation.category === "correction").length,
    correctionRespectedCount: observations.filter((observation) =>
      observation.category === "correction" && observation.proposedStructure === "none").length,
    observations: [...observations],
  };
}

function mergeScenario(id: string, first: string, second: string): IdeaStructureReliabilityScenario {
  return {
    id,
    description: "Two established ideas express the same underlying meaning.",
    message: "Being answerable is the part of legitimacy I care about here; the two concerns now feel rooted in that same claim.",
    previousMessages: [],
    ideaMap: map([idea("idea-1", first), idea("idea-2", second)]),
    expectedStructure: IDEA_STRUCTURE_OPERATION_TYPES.merge,
    expectedIdeaIds: ["idea-1", "idea-2"],
    category: "merge",
  };
}

function splitScenario(id: string, substance: string): IdeaStructureReliabilityScenario {
  return {
    id,
    description: "One established idea contains two meanings that should remain independently correctable.",
    message: "The two meanings matter for different reasons, and I want to examine each without treating them as interchangeable.",
    previousMessages: [],
    ideaMap: map([idea("idea-1", substance)]),
    expectedStructure: IDEA_STRUCTURE_OPERATION_TYPES.split,
    expectedIdeaIds: ["idea-1"],
    category: "split",
  };
}

function controlScenario(id: string, ideas: Idea[], message: string): IdeaStructureReliabilityScenario {
  return {
    id,
    description: "Established material should retain its current idea boundaries.",
    message,
    previousMessages: [],
    ideaMap: map(ideas),
    expectedStructure: "none",
    expectedIdeaIds: [],
    category: "control",
  };
}

function correctionScenario(): IdeaStructureReliabilityScenario {
  const original = map([
    idea("idea-1", "Autonomy means choosing my own direction."),
    idea("idea-2", "Independence means limiting reliance on other people."),
  ]);
  const merged = applyIdeaStructure({
    current: original,
    source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
    request: {
      type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
      expectedRevision: original.revision,
      ideaIds: ["idea-1", "idea-2"],
      result: {
        title: "Autonomy and independence",
        synthesis: "I want to direct my life without relying heavily on others.",
        assistantAssessment: assessment(),
      },
      explanation: "The meanings appear related.",
    },
  }).ideaMap;
  const corrected = undoLatestIdeaStructure({
    current: merged,
    expectedRevision: merged.revision,
  }).ideaMap;
  return {
    id: "correction-respects-distinct-ideas",
    description: "A previously rejected merge should not be proposed again without changed source material.",
    message: "Keep autonomy and independence distinct; that correction still reflects what I mean.",
    previousMessages: [],
    ideaMap: corrected,
    expectedStructure: "none",
    expectedIdeaIds: [],
    category: "correction",
  };
}

function map(ideas: Idea[]): IdeaMap {
  return { revision: 1, ideas, potentialConflicts: [] };
}

function idea(id: string, substance: string): Idea {
  return {
    id,
    title: id === "idea-1" ? "First established idea" : "Second established idea",
    synthesis: substance,
    substance,
    unresolvedQuestions: [],
    assistantAssessment: assessment(),
    userInterpretation: null,
    disposition: IDEA_DISPOSITIONS.active,
  };
}

function assessment() {
  return { exploration: "developing" as const, importance: "central" as const };
}

function sameValues(left: readonly string[], right: readonly string[]) {
  return [...left].sort().join("\u0000") === [...right].sort().join("\u0000");
}

function referencedIdeaIds(proposal: ProposedIdeaStructure | null) {
  if (!proposal) return [];
  return proposal.type === IDEA_STRUCTURE_OPERATION_TYPES.merge
    ? proposal.ideaIds
    : [proposal.ideaId];
}
