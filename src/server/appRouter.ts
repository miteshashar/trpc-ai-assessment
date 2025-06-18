// Main tRPC router for CV evaluation API
import schema from "./schema";
import trpc from "./trpc";

import { Content } from "@google-cloud/vertexai";
import {
  ICandidateEvaluation,
  IEvaluateInput,
  IEvaluateOutput,
  IJobDescriptionEvaluation,
  ISkill,
} from "../types";
import prompts, { runPrompt } from "./prompts";
import { getMarkdownFromPdfFile, sha256 } from "./utils";

// Define tRPC API endpoints
export const appRouter = trpc.router({
  // Evaluate candidate CV against job description
  evaluate: trpc.procedure
    .input(schema.evaluateSchema)
    .mutation(async (opts) => {
      const data = opts.input as IEvaluateInput;

      // Convert PDFs to markdown for AI processing
      const jobDescription = await getMarkdownFromPdfFile(data.jobDescription);
      const cv = await getMarkdownFromPdfFile(data.cv);

      const history: Content[] = [];

      // First: Extract job details and skills using AI
      const jdEvaluationResponse = await runPrompt(
        prompts.evaluateJobDescription,
        history,
        { jobDescription },
        await sha256(jobDescription),
      );
      const jdEvaluation: IJobDescriptionEvaluation = JSON.parse(
        jdEvaluationResponse.parts[0].text!,
      );

      // Second: Evaluate candidate against extracted skill requirements using AI
      const candidateEvaluationResponse = await runPrompt(
        prompts.evaluateCandidate,
        history,
        {
          cv,
          skills: (jdEvaluation.skills || []) as ISkill[],
        },
      );
      const candidateEvaluation: ICandidateEvaluation = JSON.parse(
        candidateEvaluationResponse.parts[0].text!,
      );

      const response: IEvaluateOutput = {
        jobDescriptionEvaluation: jdEvaluation,
        candidateEvaluation,
      };
      return response;
    }),
});

export type AppRouter = typeof appRouter;
