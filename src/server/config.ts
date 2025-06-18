import { configDotenv } from "dotenv";
import { z } from "zod/v4";

// Load environment variables from .env file
configDotenv();

// Validate required environment variables for AI API
export default z
  .object({
    AI_API_URL: z.string(),
    AI_API_TOKEN: z.string(),
  })
  .parse(process.env);
