import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { MessageModel } from "../(models)/messageSchema.js";
import { ThreadModel } from "../(models)/threadSchema.js";
import { handleRunToolCalls } from "../../ai/helpers/handleRunToolCall.js";
import OpenAI from "openai";
import { handleChat } from "../../ai/helpers/chatHandler.js";

const client = new OpenAI();

// Create a new message
export const createMessage = catchAsync(async (req, res, next) => {
  const thread = await ThreadModel.findById(req.params.id);
  if (!thread) return next(new AppError("Thread not found", 404));

  const threadId = thread.threadId;
  const { sender, content } = req.body;

  if (!content)
    return next(new AppError("Message content cannot be empty", 400));

  try {
    // ✅ Check if there is an active run
    let activeRun = await client.beta.threads.runs.list(threadId);
    let ongoingRun = activeRun.data.find(
      (run) => run.status === "in_progress" || run.status === "requires_action"
    );

    if (ongoingRun) {
      return next(
        new AppError(
          "A run is still active. Please wait before sending another message.",
          400
        )
      );
    }

    // ✅ Add user message after confirming no active runs
    const message = await client.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });

    console.log("✅ Message created:", message);

    // ✅ Start assistant run
    console.log("🚀 Starting assistant run for thread:", threadId);
    console.log("🤖 Using assistant ID:", thread.assistantId);

    let run = await client.beta.threads.runs.create(threadId, {
      assistant_id: thread.assistantId,
    });

    console.log("🟢 Run created with ID:", run.id);
    console.log("⏳ Initial run status:", run.status);

    while (run.status === "requires_action") {
      run = await handleRunToolCalls(run, client, thread);
    }

    if (run.status === "failed") {
      const errorMessage = `I encountered an error: ${
        run.last_error?.message || "Unknown error"
      }`;
      console.error("❌ Run failed:", run.last_error);

      await client.beta.threads.messages.create(threadId, {
        role: "assistant",
        content: errorMessage,
      });
      return next(new AppError(errorMessage, 500));
    }

    const newMessage = await saveMessage(threadId, sender, content);
    res.status(201).json({ status: "success", data: { message: newMessage } });
  } catch (error) {
    console.error("❌ Error processing message:", error);
    return next(new AppError("Failed to process message", 500));
  }
});

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

// Function to save a message
export async function saveMessage(threadId, sender, content) {
  try {
    const newMessage = new MessageModel({
      threadId,
      sender,
      content,
    });
    return await newMessage.save();
  } catch (error) {
    console.error("Error saving message to database:", error);
    throw error;
  }
}
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
// Get a single message by ID
export const getMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const message = await MessageModel.findById(messageId); // Changed from Message to MessageModel
  if (!message) {
    return next(new AppError("Message not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      message,
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
  createMessage,
  createMessages,
  getAllMessages,
  getMessage,
  checkStatus,
};
