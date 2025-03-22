/**
 * Creates a new thread and saves it to the database.
 *
 * @param {OpenAI} client - The OpenAI client used to interact with the API.
 * @param {string} assistantId - The ID of the assistant associated with the thread.
 * @param {string} [message] - An optional initial message for the thread.
 * @returns {Promise<Thread>} - A promise resolving to the created thread object.
 */
export async function createThread(client, message) {
  try {
    // Step 1: Create a new thread via OpenAI
    const thread = await client.beta.threads.create();
    // Step 2: Optionally send an initial message
    if (message) {
      await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: message,
      });
    }
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}
