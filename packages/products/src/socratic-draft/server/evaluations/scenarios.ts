export interface HostedConversationEvaluationScenario {
  id: string;
  description: string;
  turns: string[];
}

export const HOSTED_CONVERSATION_EVALUATION_SCENARIOS = {
  unstructuredTime: {
    id: "unstructured-time",
    description:
      "A sustained exploration that should enrich one central idea without fragmenting it.",
    turns: [
      "I keep protecting unstructured time in my calendar, but whenever I get it I feel guilty for not doing something productive. I want to understand why free time has started to feel like a failure.",
      "The guilt is strange because I consciously believe rest is valuable. The pressure feels inherited rather than chosen.",
      "Part of it comes from freelancing. When time can theoretically become money, unused time starts to look wasteful.",
      "But the feeling existed before freelancing too. School taught me that being conscientious meant always having something useful to show.",
      "The irony is that most of my original thinking happens while walking around or apparently doing nothing.",
      "I might not be arguing for rest exactly. Apparently unproductive time may be part of productive thought.",
      "That still risks defending free time only because it eventually produces useful work, which feels like the same trap in disguise.",
      "Maybe the deeper issue is that time has become valuable only when it produces visible evidence of achievement.",
      "There is also fear involved: without visible output, I cannot prove to myself that I have used the day well.",
      "What has this idea become, and what important tension remains unresolved?",
    ],
  },
} as const satisfies Record<string, HostedConversationEvaluationScenario>;
