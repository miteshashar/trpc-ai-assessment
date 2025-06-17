import schema from "./schema";
import trpc from "./trpc";

import { Content } from "@google-cloud/vertexai";
import prompts, { runPrompt } from "./prompts";
import { getMarkdownFromPdfFile, sha256 } from "./utils";

export const appRouter = trpc.router({
  evaluate: trpc.procedure
    .input(schema.evaluateSchema)
    .mutation(async (opts) => {
      const data = opts.input;
      const jobDescription = await getMarkdownFromPdfFile(data.jobDescription);
      const history: Content[] = [];
      const jdEvaluationResponse = await runPrompt(
        prompts.evaluateJobDescription,
        history,
        { jobDescription },
        undefined,
        await sha256(jobDescription),
      );
      const cv = await getMarkdownFromPdfFile(data.cv);
      const jdEvaluation = jdEvaluationResponse.parts[0].text
        ? JSON.parse(jdEvaluationResponse.parts[0].text)
        : {};
      const candidateEvaluationResponse = await runPrompt(
        prompts.evaluateCandidate,
        history,
        {
          cv,
          skills: jdEvaluation.skills || [],
        },
        { skills: jdEvaluation.skills || [] },
      );
      const candidateEvaluation = candidateEvaluationResponse.parts[0].text
        ? JSON.parse(candidateEvaluationResponse.parts[0].text)
        : {};
      return {
        jobDescriptionEvaluation: jdEvaluation,
        candidateEvaluation,
      };
    }),
});

export type AppRouter = typeof appRouter;
