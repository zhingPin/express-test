import { AssistantModel } from "./(models)/assistantSchema.js";
export function mapMongoAssistantToOpenAI(assistant) {
    if (!assistant)
        return null;
    // Map the MongoDB assistant to the OpenAI Assistant type
    return {
        id: assistant.assistantId, // Ensure _id is converted to string
        name: assistant.name,
        description: assistant.description,
        instructions: assistant.instructions,
        metadata: assistant.metadata,
        created_at: assistant.createdAt.getTime(),
        model: assistant.modelName, // Add default or fetched model
        object: "assistant", // Add default value for object
        tools: assistant.tools
            .map((tool) => {
            // Ensure tool.definition exists and matches the expected structure
            if (tool.definition && tool.definition.function) {
                return {
                    type: tool.definition.type || "function", // Default to "function" if missing
                    function: {
                        name: tool.definition.function.name,
                        description: tool.definition.function.description,
                        parameters: tool.definition.function.parameters,
                    },
                };
            }
            return null; // Return null or skip the tool if the structure is invalid
        })
            .filter((tool) => tool !== null), // Filter out null tools
    };
}
export async function getAssistantById(assistantId) {
    // Query by assistantId instead of _id
    const assistant = await AssistantModel.findOne({ assistantId });
    if (!assistant)
        return null; // Handle case where no assistant is found
    return mapMongoAssistantToOpenAI(assistant);
}
