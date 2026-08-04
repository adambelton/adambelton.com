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
  practicalDecision: {
    id: "practical-decision",
    description:
      "A practical decision should be clarified without unsolicited advice or assumptions about a written output.",
    turns: [
      "I'm hungry.",
      "I'm trying to avoid eating. I'm planning on being up late tonight, and if I eat now, I'll be hungry again when I'm trying to fall asleep.",
    ],
  },
  personalReflection: {
    id: "personal-reflection",
    description:
      "A personal reflection should receive a grounded observation and one question without therapeutic interpretation.",
    turns: [
      "I felt unexpectedly relieved when a long friendship ended, and I want to understand why that relief matters to me.",
      "I think I had been performing closeness long after I stopped feeling safe enough to be honest.",
    ],
  },
  mixedUnresolvedFeelings: {
    id: "mixed-unresolved-feelings",
    description:
      "Mixed feelings and an unresolved question should remain visible rather than being forced into resolution.",
    turns: [
      "I am proud that I accepted the new role, but I also resent what it will take from my life. I do not know which feeling is more truthful.",
      "Both are truthful: I want the opportunity and I am grieving the freedom I am giving up. I am not ready to reconcile those feelings.",
    ],
  },
  ideaOrArgument: {
    id: "idea-or-argument",
    description:
      "An abstract argument should be organised in the user's perspective without inventing audience or publication requirements.",
    turns: [
      "I think convenience is often a way of hiding who bears a cost, but I am not sure how broad that claim should be.",
      "My claim is not that convenience is bad. It is that convenience deserves scrutiny when the effort merely becomes invisible to the beneficiary.",
    ],
  },
  earlyArticulation: {
    id: "early-articulation",
    description:
      "An explicit early request for articulation should be honoured without readiness becoming a gate.",
    turns: [
      "I only know that I want to leave, and I feel guilty about wanting it. Help me articulate that now, even though it is unresolved.",
    ],
  },
  correction: {
    id: "correction",
    description:
      "The user's correction should replace a tempting but inaccurate interpretation.",
    turns: [
      "I am frustrated that the project is late, but the delay itself is not the real issue.",
      "No—the issue is not that I need more control. The issue is that nobody will name the trade-off we deliberately chose.",
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
