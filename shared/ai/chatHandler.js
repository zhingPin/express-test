import { createRun } from "./createRun.jss";
import { performRun } from "./performRun.js";
import { MessageModel } from "../../api/(models)/messageSchema.js";

export async function handleChat(client, message, thread, assistant) {
  try {
    // Save user message to MessageModel
    const userMessage = new MessageModel({
      threadId: thread.id,
      sender: "user",
      content: message,
      timestamp: new Date(),
    });
    await userMessage.save();
    // Send message to OpenAI
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });
    // Create and perform the run
    const run = await createRun(client, thread, assistant.id);
    const result = await performRun(run, client, thread);
    // Check response type and set fallback if invalid
    let assistantResponse = "";
    if (result?.type === "text") {
      assistantResponse = result.text.value;
    } else {
      assistantResponse = "Invalid response type or empty result.";
    }
    // Save assistant response to MessageModel
    const assistantMessage = new MessageModel({
      threadId: thread.id,
      sender: "assistant",
      content: assistantResponse,
      timestamp: new Date(),
    });
    await assistantMessage.save();
    return assistantResponse;
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
    throw new Error(errorMessage);
  }
}
