import { MessageModel } from "./(models)/messageSchema.js";
import { ThreadModel } from "./(models)/threadSchema.js";
export async function getThreadWithMessages(threadId) {
    try {
        // Find the thread using `threadId`
        const thread = await ThreadModel.findOne({ threadId }).lean().exec();
        if (!thread) {
            throw new Error("Thread not found");
        }
        // Fetch the messages
        const messages = await MessageModel.find({ threadId }).lean().exec();
        // Transform the thread and messages
        return {
            id: thread.threadId,
            assistantId: thread.assistantId,
            title: thread.title || "",
            notes: thread.notes || "",
            metadata: thread.metadata || {},
            tool_resources: thread.tool_resources || [],
            created_at: thread.createdAt.getTime(),
            object: "thread",
            __v: thread.__v,
            messages: messages.map((message) => ({
                id: message.messageId,
                threadId: message.threadId,
                sender: message.sender,
                content: message.content,
                timestamp: message.timestamp,
            })),
        };
    }
    catch (error) {
        console.error("Error fetching thread with messages:", error);
        throw new Error("Failed to fetch thread with messages");
    }
}
