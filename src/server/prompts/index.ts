// AI prompt execution with caching support

import {
  Content,
  GenerateContentRequest,
  GenerateContentResponse,
} from "@google-cloud/vertexai";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { IPrompt, IPromptVars } from "../../types";
import config from "../config";
import { replaceVars } from "../utils";
import evaluateCandidate from "./evaluateCandidate";
import evaluateJobDescription from "./evaluateJobDescription";

// Create cache directory for AI responses
const CACHE_FOLDER = ".ai_cache";
if (!existsSync(CACHE_FOLDER)) {
  mkdirSync(CACHE_FOLDER, { recursive: true });
}

// Execute AI prompt with optional caching
export const runPrompt = async (
  prompt: IPrompt,
  history: Content[],
  vars: IPromptVars,
  cacheKey?: string,
): Promise<Content> => {
  const userPrompt = replaceVars(prompt.user, vars);
  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: userPrompt }],
    },
  ];
  if (cacheKey) {
    const cacheFilePath = join(CACHE_FOLDER, `${cacheKey}.json`);
    // Return cached response if available
    if (existsSync(cacheFilePath)) {
      const cachedResponse: Content = JSON.parse(
        readFileSync(cacheFilePath, "utf-8"),
      );
      history.push(...contents, cachedResponse);
      return cachedResponse;
    }
  }
  // Build AI request
  const request: GenerateContentRequest = {
    contents: history.concat(contents),
    // TODO: generationConfig can be moved to prompt management system
    // when adding new prompts for different use cases.
    // For now, hard-coded settings are good enough.
    generationConfig: {
      temperature: 0,
      topP: 0,
      topK: 15,
    },
  };
  if (prompt.system) {
    request.systemInstruction = replaceVars(prompt.system, vars);
  }
  // Configure structured JSON response if schema provided
  if (prompt.schema) {
    request.generationConfig!.responseMimeType = "application/json";
    request.generationConfig!.responseSchema = prompt.schema(vars);
  }

  const response = await fetch(config.AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.AI_API_TOKEN,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(
      `AI API request failed with status ${response.status}: ${response.statusText}`,
    );
  }
  const responseData = (await response.json()) as GenerateContentResponse;
  if (!responseData.candidates || responseData.candidates.length === 0) {
    throw new Error("No response received from AI API");
  }
  // Cache response for future requests
  if (cacheKey) {
    const cacheFilePath = join(CACHE_FOLDER, `${cacheKey}.json`);
    writeFileSync(
      cacheFilePath,
      JSON.stringify(responseData.candidates[0].content),
    );
  }
  history.push(...contents, responseData.candidates[0].content);
  return responseData.candidates[0].content;
};

export default {
  evaluateCandidate,
  evaluateJobDescription,
};
