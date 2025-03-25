import OpenAI from "openai";
import "dotenv/config"; // Ensure environment variables are loaded
// Initialize OpenAI client once
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in .env
});
export default openai;
