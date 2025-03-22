import { chatCLI } from "../shared/helpers/chatHandler.js";

async function main() {
  try {
    // Assistant and thread initialization logic remains the same...

    console.log('Chat started! Type "exit" to end the conversation.');
    await chatCLI(client, thread, assistant);
  } catch (error) {
    console.error("Error in main:", error.message);
    rl.close();
    process.exit(1);
  }
}

main().catch(console.error);
