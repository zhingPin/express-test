import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";

export async function createRun(
  client: OpenAI,
  threadId: string,
  assistantId: string
): Promise<Run> {
  console.log("🚀 Creating a new run for thread:", threadId);
  console.log("🤖 Using assistant ID:", assistantId);

  try {
    let run = await client.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    console.log("🟢 Run created with ID:", run.id);
    console.log("⏳ Initial run status:", run.status);

    // Wait for the run to complete, polling every second
    while (run.status === "in_progress" || run.status === "queued") {
      console.log(`🔄 Run status: ${run.status}... polling again in 1s`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await client.beta.threads.runs.retrieve(threadId, run.id);
    }

    console.log("✅ Run completed with status:", run.status);
    return run;
  } catch (error) {
    console.error(
      "❌ Error during run creation:",
      error instanceof Error ? error.stack : error
    );
    throw new Error("Failed to create and complete the run.");
  }
}
