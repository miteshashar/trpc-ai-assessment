// Centralized type definitions for CV evaluation system

import { ResponseSchema } from "@google-cloud/vertexai";

// AI prompt configuration types
export interface IPromptVars {
  jobDescription?: string;
  cv?: string;
  skills?: ISkill[];
}

export interface IPrompt {
  user: string;
  system?: string;
  schema?: (vars: IPromptVars) => ResponseSchema;
}

// Interface should be aligned with evaluateJobDescription prompt response schema
export interface ISkill {
  slug: string;
  skill: string;
}

// Interface should be aligned with evaluateCandidate prompt response schema
export interface ISkillRating extends ISkill {
  rating: number;
  reasoning: string;
}

// Interface should be aligned with evaluateJobDescription prompt response schema
export interface IJobDescriptionEvaluation {
  companyName: string;
  jobOpeningTitle: string;
  skills: ISkill[];
}

// Interface should be aligned with evaluateCandidate prompt response schema
export interface ICandidateEvaluation {
  candidateName: string;
  experience: number;
  strengths: string[];
  weaknesses: string[];
  skillRatings: ISkillRating[];
}

// API input/output types
export interface IEvaluateInput {
  jobDescription: File;
  cv: File;
}

export interface IEvaluateOutput {
  jobDescriptionEvaluation: IJobDescriptionEvaluation;
  candidateEvaluation: ICandidateEvaluation;
}
