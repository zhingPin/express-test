import AppError from "../utils/appError.js";
import {
  transformThread,
  transformMessage,
  validateId,
} from "../utils/helpers/transformData.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ThreadModel } from "../(models)/threadSchema.js";
import { MessageModel } from "../(models)/messageSchema.js";
import { AssistantModel } from "../(models)/assistantSchema.js";
import OpenAI from "openai";

const client = new OpenAI();

export const createThread = catchAsync(async (req, res, next) => {
  const { title, initialMessage } = req.body;
  const assistant = await AssistantModel.findById(req.params.id);

  if (!assistant) {
    return next(new AppError("Assistant not found", 404));
  }

  // Step 1: Create thread via OpenAI API
  const thread = await client.beta.threads.create();
  if (!thread) {
    return next(new AppError("Failed to create thread", 400));
  }
  console.log("thread", thread);

  // Step 2: Save thread in MongoDB
  const newThread = await ThreadModel.create({
    threadId: thread.id, // Store OpenAI thread ID
    assistantId: assistant.id,
    title,
    object: thread.object,
  });

  let savedMessage = null;

  // Step 3: Optionally send and store initial message
  if (initialMessage) {
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: initialMessage,
    });

    savedMessage = await MessageModel.create({
      threadId: thread.id,
      sender: "user", // Corrected field name
      content: initialMessage,
    });

    // Add message reference to the thread
    newThread.messages.push(savedMessage._id);
    await newThread.save();
  }

  res.status(201).json({
    status: "success",
    data: {
      thread: newThread,
      message: savedMessage,
    },
  });
});

export const getThreadWithMessages = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Fetch thread and populate messages in a single query
  const thread = await ThreadModel.findById(id).exec();
  if (!thread) {
    return next(new AppError("Thread not found", 404));
  }

  console.log("Fetched thread:", thread);

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

export const getThreadsByAssistantId = catchAsync(async (req, res, next) => {
  const assistant = await AssistantModel.findById(req.params.id);
  if (!assistant) {
    return next(new AppError(`Assistant not found`, 404));
  }

  // Fetch only the threads associated with the assistantId
  const threads = await ThreadModel.find({ assistantId: assistant.id }).exec();

  if (!threads.length) {
    return next(
      new AppError(`No threads found for assistantId: ${assistant.id}`, 404)
    );
  }

  // Return only the threads (without messages)
  res.status(200).json({
    status: "success",
    data: { threads },
  });
});

export const threadController = {
  createThread,
  getThreadWithMessages,
  getThreadsByAssistantId,
};
