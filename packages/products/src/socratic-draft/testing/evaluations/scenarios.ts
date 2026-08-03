export interface HostedConversationEvaluationScenario {
  id: string;
  description: string;
  turns: string[];
}

export const HOSTED_CONVERSATION_EVALUATION_SCENARIOS = {
  firstPersonIdeaMaterial: {
    id: "first-person-idea-material",
    description:
      "Idea-map material must remain first-person writing material rather than assistant-facing evidence notes about the user.",
    turns: [
      "My dog is really annoying today.",
      "He's barking at squirrels and birds in the garden, and it makes me angry.",
      "I know it is his nature and not his fault, but I also feel responsible because I have not trained him properly.",
    ],
  },
  hungerAsWritingMaterial: {
    id: "hunger-as-writing-material",
    description:
      "A regression scenario that must remain writing-oriented and keep assistant-generated practical hypotheses out of canonical idea material.",
    turns: [
      "I'm hungry.",
      "I'm trying to avoid eating. I'm planning on being up late tonight, and if I eat now, I'll be hungry again when I'm trying to fall asleep.",
    ],
  },
  fifaAccountability: {
    id: "fifa-accountability",
    description:
      "A sustained exploration of condemning Infantino's leadership and how football can reclaim FIFA.",
    turns: [
      "I condemn Gianni Infantino's leadership of FIFA, but I want to understand how football itself can save FIFA from him.",
      "He presents expansions of his power as service to the game while meaningful scrutiny seems to recede.",
      "The damage to legitimacy matters because FIFA acts as if it owns football, even though the game belongs to everyone who plays and cares for it.",
      "Football exists in players, supporters, clubs, associations, traditions, and shared memory. FIFA administers part of it but did not create its meaning.",
      "Supporters can refuse FIFA's claim to speak for our loyalty and can pressure sponsors and national associations.",
      "Public pressure alone is not enough. Member associations hold formal power and need to coordinate rather than complain individually.",
      "A replacement president would not solve the underlying problem unless transparent decisions and independent scrutiny outlast that person.",
      "So accountability may be the link: FIFA borrows legitimacy from football and should answer to the people and institutions that create it.",
      "Football can withdraw unearned legitimacy while associations translate that pressure into enforceable limits on leadership.",
      "What has this argument become, and what important practical tension remains unresolved?",
    ],
  },
} as const satisfies Record<string, HostedConversationEvaluationScenario>;
