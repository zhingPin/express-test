import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  threadId: { type: String, ref: "Thread", required: true, index: true },
  sender: { type: String, enum: ["user", "assistant"], required: true },
  content: [
    {
      type: { type: String, enum: ["text", "image", "button"], required: true },
      text: {
        value: mongoose.Schema.Types.Mixed, // Ensure it supports objects
        annotations: { type: Array, default: [] }, // Optional annotations
      },
      image: {
        url: { type: String, required: false }, // For image messages
        alt: { type: String, required: false },
      },
      button: {
        label: { type: String, required: false }, // For button messages
        action: { type: String, required: false },
      },
    },
  ],
  run: {
    id: { type: String },
    status: {
      type: String,
      enum: [
        "queued",
        "in_progress",
        "requires_action",
        "cancelling",
        "cancelled",
        "failed",
        "completed",
        "incomplete",
        "expired",
      ],
    },
  },
  hasResponse: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});
export const MessageModel = mongoose.model("Message", MessageSchema);
