import { LangfuseClient } from "@langfuse/client";

type EvaluationScore = {
  name: string;
  score: number | boolean;
};

export async function runLangfuseEvaluation<Input, Expected, Output>(config: {
  data: Array<{ input: Input; expected?: Expected }>;
  experimentName?: string;
  metadata?: Record<string, unknown>;
  task(input: Input): Promise<Output>;
  scores: Array<(input: {
    input: Input;
    output: Output;
    expected?: Expected;
  }) => EvaluationScore | Promise<EvaluationScore>>;
  maxConcurrency?: number;
}) {
  const client = new LangfuseClient();
  const result = await client.experiment.run({
    name: config.experimentName ?? "thoughtform-evaluation",
    metadata: config.metadata,
    data: config.data.map((item) => ({
      input: item.input,
      expectedOutput: item.expected,
    })),
    task: ({ input }) => config.task(input as Input),
    evaluators: config.scores.map((score) => async ({
      input,
      output,
      expectedOutput,
    }) => {
      const evaluated = await score({
        input: input as Input,
        output: output as Output,
        expected: expectedOutput as Expected | undefined,
      });
      return {
        name: evaluated.name,
        value: typeof evaluated.score === "boolean"
          ? evaluated.score ? 1 : 0
          : evaluated.score,
      };
    }),
    maxConcurrency: config.maxConcurrency,
  });
  console.log(await result.format({ includeItemResults: true }));
  return result;
}
