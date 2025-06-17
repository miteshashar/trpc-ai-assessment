import { ResponseSchema, SchemaType } from "@google-cloud/vertexai";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IPrompt } from "../../types";

const schema: (
  data: Record<"skills", Record<"slug" | "skill", string>[]>,
) => ResponseSchema = (data) => ({
  type: SchemaType.OBJECT,
  properties: {
    candidateName: {
      type: SchemaType.STRING,
      description: "The name of the candidate",
    },
    experience: {
      type: SchemaType.NUMBER,
      description: "The total years of experience of the candidate",
    },
    strengths: {
      type: SchemaType.ARRAY,
      description:
        "List of strengths of the candidate in context of the job description",
      items: {
        type: SchemaType.STRING,
      },
    },
    weaknesses: {
      type: SchemaType.ARRAY,
      description:
        "List of weaknesses of the candidate in context of the job description",
      items: {
        type: SchemaType.STRING,
      },
    },
    skillRatings: {
      type: SchemaType.ARRAY,
      description: `Evaluation of the candidate for the skills mentioned in the job description. ALL ${data.skills.length} skills are required to be present in the response with rating and reasoning, even if the candidate has no alignment with them: ${Object.values(data.skills).map((s) => s.slug)}`,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          slug: {
            type: SchemaType.STRING,
            description: `Lower kebab-case slug of the skill. One of: ${Object.values(data.skills).map((s) => s.slug)}`,
          },
          skill: {
            type: SchemaType.STRING,
            description: `Name of the skill. One of: ${data.skills
              .map((skill) => skill.skill)
              .join(", ")}`,
          },
          rating: {
            type: SchemaType.NUMBER,
            description:
              "Rating(out of 10) of the specific skill's alignment for the candidate in context of the job description",
          },
          reasoning: {
            type: SchemaType.STRING,
            description:
              "Reasoning for the rating of the specific skill's alignment for this candidate in context of the job description",
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
