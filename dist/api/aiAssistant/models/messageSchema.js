import mongoose, { Schema } from "mongoose";
const MessageSchema = new mongoose.Schema({
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
}, { timestamps: true });
export const MessageModel = mongoose.model("Message", MessageSchema);
