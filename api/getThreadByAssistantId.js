import { ThreadModel } from "./(models)/threadSchema.js";
export async function getThreadByAssistantId(assistantId) {
    const threadDoc = await ThreadModel.findOne({ assistantId }).exec();
    console.log("Thread Doc Retrieved:", threadDoc);
    if (!threadDoc) {
        console.log(`No thread found for assistantId: ${assistantId}`);
        return null;
    }
    const thread = {
        id: threadDoc.threadId,
        created_at: Math.floor(threadDoc.createdAt.getTime() / 1000),
        metadata: threadDoc.metadata || {},
        object: "thread",
        tool_resources: null,
    };
    console.log("Transformed Thread:", thread);
    return thread;
}
