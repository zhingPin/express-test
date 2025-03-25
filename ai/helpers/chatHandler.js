import { createRun } from "../helpers/createRun.js";
import { performRun } from "../helpers/performRun.js";
import { MessageModel } from "../../api/(models)/messageSchema.js";

// Function that handles the chat process (user message, assistant message, etc.)
export async function handleChat(client, message, thread, assistantId) {
  try {
    // Save user message to MessageModel

    // Send message to OpenAI
    await client.beta.threads.messages.create(thread.threadId, {
      role: "user",
      content: message,
    });

    // Create and perform the run
    const run = await createRun(client, thread.threadId, assistantId);
    const result = await performRun(run, client, thread.threadId);

    // Check response type and set fallback if invalid
    let assistantResponse = "";
    if (result?.type === "text") {
      assistantResponse = result.text.value;
    } else {
      assistantResponse = "Invalid response type or empty result.";
    }
    console.log("assistantMessaged 🚀");
    return assistantResponse; // Return the assistant's response
  } catch (error) {
    console.error("Error during chat:", error);
    // Handle fallback for error cases
    const errorMessage = "An error occurred while processing the response.";

    // Save error message to MessageModel
    const errorMessageRecord = new MessageModel({
      threadId: thread.id,
      sender: "assistant",
      content: errorMessage,
      timestamp: new Date(),
    });
    await errorMessageRecord.save();

    throw new Error(errorMessage); // Rethrow to be caught in createMessages
  }
}
