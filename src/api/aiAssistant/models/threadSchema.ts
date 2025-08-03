import mongoose, { Schema, Document } from "mongoose";

export interface ToolResource {
  type: string; // e.g., "code_interpreter", "file_search"
  resourceIds: string[]; // IDs specific to the tool
}

export interface IThread extends Document {
  threadId: string; // Identifier from OpenAI or other LLM
  assistantId: string; // Foreign key to Assistant
  title: string; // Optional thread title
  notes: string; // Optional thread notes
  metadata: Record<string, any>; // Arbitrary metadata object
  tool_resources: ToolResource[]; // Array of tool resources
  object: string;
  initialMessage: string; // Add this line
  run: {
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
    lastChecked?: Date;

  };
}

const ToolResourceSchema = new mongoose.Schema<ToolResource>({
  type: { type: String, required: true }, // Tool type
  resourceIds: { type: [String], required: true }, // List of resource IDs
});

const ThreadSchema = new Schema<IThread>(
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
    run: {
      id: { type: String, required: true },
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
          "new"
        ],
        required: true,

      },
      lastChecked: { type: Date, default: Date.now },
    },

  },
  { timestamps: true }
);

export const ThreadModel = mongoose.model<IThread>("Thread", ThreadSchema);
