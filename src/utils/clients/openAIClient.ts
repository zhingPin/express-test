import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config(); // Load API key from .env file
export const connectToOpenai = new OpenAI(
  {
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have this in your .env file
  },
);
// export { connectToOpenai };
