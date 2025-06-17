import { ResponseSchema } from "@google-cloud/vertexai";

interface IPrompt {
  user: string;
  system?: string;
  schema?: (data: Record<string, any>) => ResponseSchema;
}

export type { IPrompt };
