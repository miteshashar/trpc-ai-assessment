import { configDotenv } from "dotenv";
import { z } from "zod/v4";

configDotenv();

export default z
  .object({
    AI_API_URL: z.string(),
    AI_API_TOKEN: z.string(),
  })
  .parse(process.env);
