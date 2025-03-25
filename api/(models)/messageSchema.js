import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  threadId: { type: String, ref: "Thread", required: true, index: true },
  sender: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
export const MessageModel = mongoose.model("Message", MessageSchema);
