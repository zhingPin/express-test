import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../helpers/catchAsync.js";
import { ThreadModel } from "../models/threadSchema.js";
import AppError from "../../helpers/appError.js";
import { MessageModel } from "../models/messageSchema.js";
import { transformMessage, transformThread } from "../../helpers/transformData.js";
import { AssistantModel } from "../models/assistantSchema.js";
import OpenAI from "openai";


const client = new OpenAI();

export const getThreadWithMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Fetch thread and populate messages in a single query
    const thread = await ThreadModel.findById(req.params.id);

    if (!thread) {
        return next(new AppError("Thread not found", 404));
    }

    // console.log("Fetched thread:", thread);

    // Fetch messages associated with the thread
    const messages = await MessageModel.find({ threadId: thread.threadId })
        .lean()
        .exec();

    res.status(200).json({
        status: "success",
        data: {
            ...transformThread(thread),
            messages: messages.map(transformMessage),
        },
    });
});

export const getThreadsByAssistantId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const assistantId = req.params.id;

    if (!assistantId) {
        return next(new AppError("Missing assistantId in request", 400));
    }

    const threads = await ThreadModel.find({ assistantId }).exec();

    if (!threads || threads.length === 0) {
        return next(new AppError(`No threads found for assistantId: ${assistantId}`, 404));
    }

    res.status(200).json({
        status: "success",
        result: threads.length || "0",
        data: threads.map(transformThread),
    });
});

export const createThreadByAssistantId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { assistantId } = req.params;

    if (!assistantId) {
        return next(new AppError("Missing assistantId in request", 400));
    }


});

export const createThread = catchAsync(async (req, res, next) => {
    const assistantId = req.params.id;

    // Ensure assistant exists
    const assistant = await AssistantModel.findById(assistantId); // ⚠️ You forgot to `await` this
    console.log("assistantId", assistantId)
    if (!assistant) {
        console.log("Assistant ID not found:", assistantId);
        return next(new AppError("Assistant not found", 404));
    }

    // Create a thread via OpenAI API (or custom logic)
    const thread = await client.beta.threads.create(); // assumes you're using OpenAI SDK
    const threadId = thread.id;

    // Extract any extra fields from the body (optional)
    const {
        title = "",
        notes = "",
        metadata = {},
        initialMessage = "",
        tool_resources = [],
        object = "thread", // default fallback
    } = req.body;

    // Save to DB
    const newThread = await ThreadModel.create({
        threadId,
        assistantId,
        title,
        notes,
        metadata,
        initialMessage,
        tool_resources,
        object,
        run: {
            id: "null", // you may update this later when a run is created
            status: "new", // default starting status
        },
    });

    res.status(201).json({
        status: "success",
        data: {
            newThread: newThread,
        },
    });
});

export const threadController = {
    //   createThread,
    getThreadWithMessages,
    // getThreadByAssistantId,
    getThreadsByAssistantId,
    createThread

};