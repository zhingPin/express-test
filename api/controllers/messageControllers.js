import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { MessageModel } from "../(models)/messageSchema.js";
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
// Create a new message
export const createMessage = catchAsync(async (req, res, next) => {
  const { threadId, sender, content } = req.body;
  // You can choose to use saveMessage here to utilize the helper function
  const newMessage = await saveMessage(threadId, sender, content); // Use the helper function
  res.status(201).json({
    status: "success",
    data: {
      message: newMessage,
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
  getAllMessages,
  getMessage,
  createMessage,
  checkStatus,
};
