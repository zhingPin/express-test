import mongoose, { Schema, Document } from "mongoose";
import { Runs } from "openai/resources/beta/threads/index.mjs";

export interface IMessage extends Document {
  threadId: string; // Foreign key to Thread
  messageId: string;
  sender: "user" | "assistant" | "system"; // 'user' or 'assistant'
  content: string | ContentPart[];
  timestamp: Date;
  run: {
    type?: "text";
    id: string;
    status:
    | "queued"
    | "in_progress"
    | "requires_action"
    | "cancelling"
    | "cancelled"
    | "failed"
    | "completed"
    | "incomplete"
    | "expired";
  };
}

interface ContentPart {
  type: string;
  text?: {
    value: string;
  };
}

const MessageSchema = new mongoose.Schema<IMessage>({
  threadId: {
    type: String,
    ref: "Thread",
    required: true,
    index: true,
  },
  messageId: {
    type: String,
  },
  sender: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now },
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
    type: { type: String },
  },

},
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
