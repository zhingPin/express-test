import AppError from "../utils/appError.js";
import { transformThread, transformMessage, validateId, } from "../utils/helpers/transformData.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ThreadModel } from "../(models)/threadSchema.js";
import { MessageModel } from "../(models)/messageSchema.js";
// const ThreadModel: Model<IThread> = require("../(models)/threadModel");
// const MessageModel: Model<IMessage> = require("../(models)/messageModel");
export const getThreadWithMessages = catchAsync(async (req, res, next) => {
    const { threadId } = req.params;
    // Validate `threadId`
    validateId(threadId, "Thread ID");
    // Fetch the thread
    const thread = await ThreadModel.findOne({ threadId }).lean().exec();
    if (!thread) {
        return next(new AppError("Thread not found", 404));
    }
    // Fetch associated messages
    const messages = await MessageModel.find({ threadId }).lean().exec();
    // Transform the data
    const response = {
        ...transformThread(thread),
        messages: messages.map(transformMessage),
    };
    res.status(200).json({ status: "success", data: response });
});
export const getThreadByAssistantId = catchAsync(async (req, res, next) => {
    const { assistantId } = req.params;
    // Validate `assistantId`
    validateId(assistantId, "Assistant ID");
    // Fetch the thread by assistantId
    const threadDoc = await ThreadModel.findOne({ assistantId }).exec();
    if (!threadDoc) {
        return next(new AppError(`No thread found for assistantId: ${assistantId}`, 404));
    }
    // Transform the thread
    const thread = transformThread(threadDoc);
    res.status(200).json({
        status: "success",
        data: { thread },
    });
});
// Create a new thread in DB (Helper function)
export async function createThreadInDB(assistantId, threadId, title = "Untitled Thread", // Default title
initialMessage = "" // Default initial message
) {
    try {
        const newThread = new ThreadModel({
            assistantId,
            threadId, // Use the OpenAI thread ID
            title,
            initialMessage,
            object: "thread",
        });
        console.log("Thread created in database:", newThread);
        return await newThread.save();
    }
    catch (error) {
        console.error("Error creating thread in database:", error);
        throw error;
    }
}
// CatchAsync-wrapped `createThread` function
export const createThread = catchAsync(async (req, res, next) => {
    const { assistantId, threadId, title, initialMessage } = req.body;
    const newThread = await createThreadInDB(assistantId, threadId, title, initialMessage);
    res.status(201).json({
        status: "success",
        data: {
            thread: newThread,
        },
    });
});
