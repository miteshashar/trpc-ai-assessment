// Get list of folders in the current directory

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

const CACHE_FOLDER = ".ai_cache";
if (!existsSync(CACHE_FOLDER)) {
  mkdirSync(CACHE_FOLDER, { recursive: true });
}

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
    // Load response from cache if available
    if (existsSync(cacheFilePath)) {
      const cachedResponse: Content = JSON.parse(
        readFileSync(cacheFilePath, "utf-8"),
      );
      history.push(...contents, cachedResponse);
      return cachedResponse;
    }
  }
  const request: GenerateContentRequest = {
    contents: history.concat(contents),
    generationConfig: {
      temperature: 0,
      topP: 0,
      topK: 15,
    },
  };
  if (prompt.system) {
    request.systemInstruction = replaceVars(prompt.system, vars);
  }
  if (prompt.schema) {
    request.generationConfig!.responseMimeType = "application/json";
    request.generationConfig!.responseSchema = prompt.schema(vars);
  }
  writeFileSync(
    join(CACHE_FOLDER, "request.json"),
    JSON.stringify(request, null, 2),
  );
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
    throw new Error("No candidates returned from AI API");
  }
  if (cacheKey) {
    const cacheFilePath = join(CACHE_FOLDER, `${cacheKey}.json`);
    writeFileSync(
      cacheFilePath,
      JSON.stringify(responseData.candidates[0].content),
    );
  }
  writeFileSync(
    join(CACHE_FOLDER, "response.json"),
    JSON.stringify(responseData, null, 2),
  );
  history.push(...contents, responseData.candidates[0].content);
  return responseData.candidates[0].content;
};
export default {
  evaluateCandidate,
  evaluateJobDescription,
};
