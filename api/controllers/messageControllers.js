import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { MessageModel } from "../(models)/messageSchema.js";
import { ThreadModel } from "../(models)/threadSchema.js";
import { handleRunToolCalls } from "../../ai/helpers/handleRunToolCall.js";
import OpenAI from "openai";
import { handleChat } from "../../ai/helpers/chatHandler.js";

const client = new OpenAI();

// Controller function that handles creating messages and interacting with the chat logic
export const createMessages = catchAsync(async (req, res, next) => {
  const thread = await ThreadModel.findById(req.params.id);
  if (!thread) {
    return next(new AppError("Thread not found", 404));
  }

  const { sender, content } = req.body;

  try {
    // Save user message first
    const userMessage = new MessageModel({
      threadId: thread.threadId,
      sender: "user",
      content: content,
      timestamp: new Date(),
    });
    await userMessage.save();

    // Process chat with OpenAI
    const assistantResponse = await handleChat(
      client,
      content,
      thread,
      thread.assistantId
    );

    // Save assistant response
    const assistantMessage = new MessageModel({
      threadId: thread.threadId,
      sender: "assistant",
      content: assistantResponse,
      timestamp: new Date(),
    });
    await assistantMessage.save();

    return res.status(200).json({
      status: "success",
      data: {
        message: assistantResponse,
      },
    });
  } catch (error) {
    console.error("Error during chat:", error);
    return next(
      new AppError("An error occurred while processing the message", 500)
    );
  }
});

export const getMessagesByThreadId = catchAsync(async (req, res, next) => {
  const { thread } = await ThreadModel.findById(req.params.id);
  // const nft = await NftModel.findById(req.params.id);
  const threadId = thread.threadId;
  // Find messages associated with the given threadId
  const messages = await MessageModel.find({ threadId }).sort({ timestamp: 1 });

  if (!messages.length) {
    return next(
      new AppError(`No messages found for threadId: ${threadId}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: { messages },
  });
});

// Get all messages
export const getAllMessages = catchAsync(async (req, res, next) => {
  const messages = await MessageModel.find(); // Changed from Message to MessageModel
  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});

const checkStatus = (req, res, next) => {
  if (!req.body.run.status) {
    req.body.status = "available";
  }
  next();
};

export const messageController = {
  createMessages,
  getAllMessages,
  checkStatus,
  getMessagesByThreadId,
};
