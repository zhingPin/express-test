// /**
//  * Creates a new run for a given thread and assistant, and keeps polling
//  * for the completion status until the run finishes.
//  *
//  * @param {OpenAI} client - The OpenAI client used to interact with the API.
//  * @param {Thread} thread - The thread to which the run belongs.
//  * @param {string} assistantId - The ID of the assistant that will handle the run.
//  * @returns {Promise<Run>} - A promise that resolves to the created run object once it completes.
//  */
export async function createRun(client, thread, assistantId) {
    let run = await client.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
    });
    //wait for run to complete and keep polling
    while (run.status === "in_progress" || run.status === "queued") {
        await new Promise((resolve) => setTimeout(resolve, 1000)); //waits 1 second
        run = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }
    return run;
}
