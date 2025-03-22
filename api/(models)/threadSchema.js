import mongoose from "mongoose";

const ToolResourceSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Tool type
  resourceIds: { type: [String], required: true }, // List of resource IDs
});
const ThreadSchema = new Schema(
  {
    threadId: { type: String, required: true, unique: true, index: true }, // OpenAI or LLM-provided thread ID
    assistantId: {
      type: String,
      ref: "Assistant",
      required: true,
    },
    title: { type: String, required: false }, // Optional title
    notes: { type: String, required: false }, // Optional notes
    metadata: {
      type: Schema.Types.Mixed, // Allows arbitrary key-value pairs
      default: {}, // Default to an empty object
    },
    tool_resources: {
      type: [ToolResourceSchema], // Array of ToolResource sub-documents
      default: [], // Default to an empty array
    },
    object: { type: String, required: true },
    initialMessage: { type: String, required: false, default: "" }, // Add this line
  },
  { timestamps: true }
);
export const ThreadModel = mongoose.model("Thread", ThreadSchema);
