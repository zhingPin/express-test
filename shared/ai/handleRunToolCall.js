import { tools } from "../tools/allTools.js";
export async function handleRunToolCalls(run, client, thread) {
    console.log(`💾 Handling tool calls for run ${run.id}`);
    const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls;
    if (!toolCalls)
        return run;
    // This will hold all valid outputs
    const toolOutputs = [];
    for (const tool of toolCalls) {
        const toolConfig = tools[tool.function.name];
        if (!toolConfig) {
            console.error(`Tool ${tool.function.name} not found`);
            // Return early after logging the error
            return run; // or you can return a custom error message or status
        }
        console.log(`💾 Executing: ${tool.function.name}`);
        try {
            const args = JSON.parse(tool.function.arguments);
            const output = await toolConfig.handler(args);
            if (output !== undefined) {
                toolOutputs.push({
                    tool_call_id: tool.id,
                    output: String(output),
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toolOutputs.push({
                tool_call_id: tool.id,
                output: `Error: ${errorMessage}`,
            });
        }
    }
    // Only submit valid outputs
    if (toolOutputs.length === 0)
        return run;
    // Submit the outputs to OpenAI
    return client.beta.threads.runs.submitToolOutputsAndPoll(thread.id, run.id, {
        tool_outputs: toolOutputs,
    });
}
