import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../../utils/mongoDB.js";
connectToDatabase();
const MessageSchema = new Schema({
    threadId: {
        type: String,
        ref: "Thread",
        required: true,
        unique: true,
        index: true,
    },
    sender: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
export const MessageModel = mongoose.model("Message", MessageSchema);
