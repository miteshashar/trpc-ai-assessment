import schema from "./schema";
import trpc from "./trpc";

import { Content } from "@google-cloud/vertexai";
import {
  ICandidateEvaluation,
  IEvaluateInput,
  IEvaluationOutput,
  IJobDescriptionEvaluation,
  ISkill,
} from "../types";
import prompts, { runPrompt } from "./prompts";
import { getMarkdownFromPdfFile, sha256 } from "./utils";

export const appRouter = trpc.router({
  evaluate: trpc.procedure
    .input(schema.evaluateSchema)
    .mutation(async (opts) => {
      const data = opts.input as IEvaluateInput;
      const jobDescription = await getMarkdownFromPdfFile(data.jobDescription);
      const history: Content[] = [];
      const jdEvaluationResponse = await runPrompt(
        prompts.evaluateJobDescription,
        history,
        { jobDescription },
        await sha256(jobDescription),
      );
      const cv = await getMarkdownFromPdfFile(data.cv);
      const jdEvaluation: IJobDescriptionEvaluation = JSON.parse(
        jdEvaluationResponse.parts[0].text!,
      );
      const candidateEvaluationResponse = await runPrompt(
        prompts.evaluateCandidate,
        history,
        {
          cv,
          skills: (jdEvaluation.skills || []) as ISkill[],
        },
        await sha256(cv + JSON.stringify(jdEvaluation.skills)),
      );
      const candidateEvaluation: ICandidateEvaluation = JSON.parse(
        candidateEvaluationResponse.parts[0].text!,
      );
      const response: IEvaluationOutput = {
        jobDescriptionEvaluation: jdEvaluation,
        candidateEvaluation,
      };
      return response;
    }),
});

export type AppRouter = typeof appRouter;
