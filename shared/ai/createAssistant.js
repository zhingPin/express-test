import { assistantPrompt } from "../const/prompt.js";
import { tools } from "../tools/allTools.js";
// /**
//  * Creates a new assistant using the provided OpenAI client.
//  * The assistant is configured with a model, a name, specific instructions,
//  * and a list of tools that it can use to perform tasks.
//  *
//  * @param {OpenAI} client - The OpenAI client used to interact with the API and create the assistant.
//  * @returns {Promise<Assistant>} - A promise that resolves to the created assistant object.
//  */
export async function createAssistant(client) {
    return await client.beta.assistants.create({
        model: "gpt-4o-mini",
        name: "Neo Anderson",
        instructions: assistantPrompt,
        tools: Object.values(tools).map((tool) => tool.definition),
    });
}
