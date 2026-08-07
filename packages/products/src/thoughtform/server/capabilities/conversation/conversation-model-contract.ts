import {
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/thoughtform/shared";
import { DISCOVERY_ASSISTANT_MOVES } from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-model-response";
const READINESS_ACTION_VALUES = Object.values(READINESS_ACTIONS);
const READINESS_ASSESSMENT_VALUES = Object.values(READINESS_ASSESSMENTS);
const USER_INTENTION_VALUES = Object.values(USER_INTENTIONS);

export const CONVERSATION_MODEL_OUTPUT_FORMAT = {
  name: "thoughtform_conversation",
  schema: {
    type: "object",
    properties: {
      response: { type: "string" },
      move: {
        type: "string",
        enum: DISCOVERY_ASSISTANT_MOVES,
      },
      assistantReadiness: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: {
          type: "object",
          properties: {
            action: { type: "string", enum: READINESS_ACTION_VALUES },
            assessment: {
              type: "string",
              enum: READINESS_ASSESSMENT_VALUES,
            },
            explanation: { type: ["string", "null"] },
          },
          required: ["action", "assessment", "explanation"],
          additionalProperties: false,
        },
      },
      userIntention: {
        type: ["string", "null"],
        enum: [...USER_INTENTION_VALUES, null],
      },
    },
    required: [
      "response",
      "move",
      "assistantReadiness",
      "userIntention",
    ],
    additionalProperties: false,
  },
} as const;
