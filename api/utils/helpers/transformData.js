import AppError from "../appError.js";
export function transformThread(thread) {
    return {
        threadId: thread.threadId,
        assistantId: thread.assistantId,
        title: thread.title || "", // Optional field, default to empty string
        notes: thread.notes || "", // Optional field, default to empty string
        metadata: thread.metadata || {}, // Default to an empty object
        tool_resources: thread.tool_resources || [], // Default to an empty array
        object: thread.object || "thread",
        initialMessage: thread.initialMessage || "", // Default to empty string
        createdAt: new Date(thread.createdAt), // Ensure this is a Date
    };
}
export function transformMessage(message) {
    return {
        id: message.messageId, // Ensure message.messageId exists
        threadId: message.threadId,
        sender: message.sender,
        content: message.content,
        timestamp: new Date(message.timestamp), // Convert timestamp to Date if needed
    };
}
export function validateId(id, type) {
    if (!id) {
        throw new AppError(`${type} is required`, 400);
    }
}
