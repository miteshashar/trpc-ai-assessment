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
    skills: {
      type: SchemaType.ARRAY,
      description:
        "Evaluation of the candidate for the skills mentioned in the job description",
      items: {
        type: SchemaType.OBJECT,
        properties: data
          ? Object.fromEntries(
              data.skills.map((skill) => [
                skill.slug,
                {
                  type: SchemaType.OBJECT,
                  description: `Evaluation of the candidate for the skill "${skill.skill}"`,
                  properties: {
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
              ]),
            )
          : {},
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
