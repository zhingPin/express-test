import { MessageModel } from "./(models)/messageSchema.js";
export async function saveMessage(threadId, sender, content) {
    try {
        const newMessage = new MessageModel({
            threadId,
            sender,
            content,
        });
        return await newMessage.save();
    }
    catch (error) {
        console.error("Error saving message to database:", error);
        throw error;
    }
}
