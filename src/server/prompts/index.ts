// Get list of folders in the current directory

import {
  Content,
  GenerateContentRequest,
  GenerateContentResponse,
} from "@google-cloud/vertexai";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import config from "../config";
import { IPrompt } from "../types";
import evaluateCandidate from "./evaluateCandidate";
import evaluateJobDescription from "./evaluateJobDescription";

const CACHE_FOLDER = ".ai_cache";
if (!existsSync(CACHE_FOLDER)) {
  mkdirSync(CACHE_FOLDER, { recursive: true });
}

export const runPrompt = async (
  prompt: IPrompt,
  history: Content[],
  vars?: Record<string, any>,
  data?: Record<string, any>,
  cacheKey?: string,
): Promise<Content> => {
  const cacheFilePath = join(CACHE_FOLDER, `${cacheKey}.json`);
  const userPrompt = prompt.user.replace(
    /\{(\w+)\}/g,
    (_, key) => vars?.[key] || "",
  );
  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: userPrompt }],
    },
  ];
  if (cacheKey) {
    // Load response from cache if available
    if (existsSync(cacheFilePath)) {
      const cachedResponse = JSON.parse(readFileSync(cacheFilePath, "utf-8"));
      history.push(...contents, cachedResponse);
      return cachedResponse as Content;
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
    request.systemInstruction = prompt.system.replace(
      /\{(\w+)\}/g,
      (_, key) => vars?.[key] || "",
    );
  }
  if (prompt.schema) {
    request.generationConfig!.responseMimeType = "application/json";
    request.generationConfig!.responseSchema = prompt.schema(data || {});
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
