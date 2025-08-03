import mongoose, { Schema, Document } from "mongoose";
import { ToolConfig } from "../../../types/toolConfig.js";

interface ToolFunction {
  name: string;
  description: string;
  parameters: object;
  strict: boolean;
}

export interface IAssistant extends Document {
  assistantId: string;
  name: string;
  description: string;
  instructions: string;
  metadata: Record<string, any>;
  object: string;
  modelName: string; // Renamed from "model"
  tools: ToolConfig[];
  // createdAt: Date;
}

const AssistantSchema = new mongoose.Schema<IAssistant>(
  {
    assistantId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    instructions: { type: String },
    metadata: { type: Object },
    modelName: { type: String, required: true }, // Updated field name
    object: { type: String, default: "assistant" },
    tools: [
      {
        type: { type: String, required: true },
        function: {
          name: { type: String, required: true },
          description: { type: String, required: true },
          parameters: { type: Schema.Types.Mixed, default: {} },
          strict: { type: Boolean, default: false },
        },
      },
    ],
  },
  { timestamps: true }
);

export const AssistantModel = mongoose.model<IAssistant>(
  "Assistant",
  AssistantSchema
);
