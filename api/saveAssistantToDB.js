import { AssistantModel } from "./(models)/assistantSchema.js";
export async function saveAssistantToDB(assistant) {
    try {
        const newAssistant = new AssistantModel({
            assistantId: assistant.id,
            name: assistant.name,
            modelName: assistant.model,
            instructions: assistant.instructions,
            tools: assistant.tools,
        });
        return await newAssistant.save();
    }
    catch (error) {
        console.error("Error saving assistant to database:", error);
        throw error;
    }
}
