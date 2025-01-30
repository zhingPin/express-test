import { ThreadModel } from "./(models)/threadSchema.js";
/**
 * Creates a new thread in the database.
 *
 * @param {string} assistantId - The ID of the assistant associated with the thread.
 * @param {string} threadId - The ID of the thread from OpenAI.
 * @param {string} title - The title of the thread.
 * @param {string} [initialMessage] - An optional initial message for the thread.
 * @returns {Promise<typeof ThreadModel>} - The created thread document.
 */
export async function createThreadInDB(assistantId, threadId, title = "Untitled Thread", // Default title
initialMessage = "" // Default initial message
) {
    try {
        const newThread = new ThreadModel({
            assistantId,
            threadId, // Use the OpenAI thread ID
            title,
            initialMessage,
            object: "thread",
        });
        console.log("Thread created in database:", newThread);
        return await newThread.save();
    }
    catch (error) {
        console.error("Error creating thread in database:", error);
        throw error;
    }
}
