import mongoose from "mongoose";

const ToolResourceSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Tool type
  resourceIds: { type: [String], required: true }, // List of resource IDs
});
const ThreadSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.Mixed, // Allows arbitrary key-value pairs
      default: {}, // Default to an empty object
    },
    tool_resources: {
      type: [ToolResourceSchema], // Array of ToolResource sub-documents
      default: [], // Default to an empty array
    },
    object: { type: String, required: true },
    initialMessage: { type: String, required: false, default: "" },
    run: {
      id: { type: String },
      status: {
        type: String,
        enum: [
          "queued",// Run is stopped at getstatus
          "in_progress",// Run is stopped at getstatus
          "requires_action",// Run is performed
          "cancelling",// Run is stopped at getstatus
          "cancelled",// Run is run again
          "failed",// Run is run again
          "completed",// Run waits for hasResponse
          "incomplete",// Run is stopped at getstatus
          "expired",// Run is run again
        ],
        // required: true,
      },
      required_action: { type: String },
      last_error: { type: String },
      hasResponse: { type: Boolean, default: false },

    },
  },
  { timestamps: true }
);
export const ThreadModel = mongoose.model("Thread", ThreadSchema);
