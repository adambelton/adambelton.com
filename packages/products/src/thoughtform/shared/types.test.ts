import { describe, expect, it } from "vitest";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
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
});
