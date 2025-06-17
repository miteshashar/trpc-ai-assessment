import { ResponseSchema, SchemaType } from "@google-cloud/vertexai";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IPrompt } from "../../types";

const schema: () => ResponseSchema = () => ({
  type: SchemaType.OBJECT,
  properties: {
    jobOpeningTitle: {
      type: SchemaType.STRING,
      description: "The title of the job opening",
    },
    skills: {
      type: SchemaType.ARRAY,
      description:
        "List of the important, specific and distinct skills mentioned in the job description",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          slug: {
            type: SchemaType.STRING,
            description: "Lower kebab-case slug of the skill",
          },
          skill: {
            type: SchemaType.STRING,
            description: "Name of the skill",
          },
        },
      },
    },
  },
});

const prompt: IPrompt = {
  user: readFileSync(join(__dirname, "user.txt")).toString(),
  system: readFileSync(join(__dirname, "system.txt")).toString(),
  schema,
};

export default prompt;
