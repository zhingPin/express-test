import readline from "readline";
import { handleChat } from "./chatHandler.js"; // Ensure correct import path

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// CLI-specific function
export async function chatCLI(client, thread, assistant) {
  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question("\nYou: ", resolve);
    });

    if (userInput.toLowerCase() === "exit") {
      rl.close();
      break;
    }

    try {
      const response = await handleChat(client, userInput, thread, assistant);
      console.log("Neo:", response);
    } catch (error) {
      console.error("Error during chat:", error);
      rl.close();
      break;
    }
  }
}

// API-friendly function (takes user input as an argument)
export async function chatAPI(client, userInput, thread, assistant) {
  try {
    return await handleChat(client, userInput, thread, assistant);
  } catch (error) {
    console.error("Error in chatAPI:", error);
    throw error;
  }
}
