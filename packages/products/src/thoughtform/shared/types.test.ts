import { describe, expect, it } from "vitest";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES,
  DRAFT_OPERATION_INTERPRETATION_STATUSES,
  IDEA_MAP_ERROR_CODES,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/thoughtform/shared";

describe("ThoughtForm interaction contracts", () => {
  it("keeps activity, assistant technique, readiness, and user intention distinct", () => {
    expect(ACTIVITIES).toEqual({
      composition: "composition",
      discovery: "discovery",
    });
    expect(ASSISTANT_MOVES.clarify).toBe("clarify");
    expect(ASSISTANT_MOVES.offerDraft).toBe("offer_draft");
    expect(READINESS_ACTIONS).toEqual({
      compose: "compose",
      reflect: "reflect",
    });
    expect(READINESS_ASSESSMENTS).toEqual({
      notReady: "not_ready",
      ready: "ready",
      readyWithUncertainty: "ready_with_uncertainty",
    });
    expect(USER_INTENTIONS).toEqual({
      compose: "compose",
      explore: "explore",
      reflect: "reflect",
    });
  });

  it("keeps saved-change interpretation lifecycle values stable", () => {
    expect(DRAFT_OPERATION_INTERPRETATION_STATUSES).toEqual({
      notNeeded: "not_needed",
      responded: "responded",
      failed: "failed",
    });
    expect(DRAFT_OPERATION_INTERPRETATION_FAILURE_STAGES).toEqual({
      workspace: "workspace",
      generation: "generation",
      interpretation: "interpretation",
      retention: "retention",
    });
  });

  it("keeps Idea Map failure codes stable", () => {
    expect(IDEA_MAP_ERROR_CODES).toEqual({
      conflict: "idea_map_conflict",
      invalidAction: "invalid_idea_action",
      unavailable: "idea_map_unavailable",
    });
  });
});
