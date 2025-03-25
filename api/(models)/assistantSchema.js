import mongoose from "mongoose";

const assistantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    object: { type: String, default: "agent" },
    created_at: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String },
    model: { type: String, required: true },
    instructions: { type: String },
    tools: [
      {
        type: { type: String, required: true },
        function: {
          name: { type: String, required: true },
          description: { type: String, required: true },
          parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
          strict: { type: Boolean, default: false },
        },
      },
    ],
    top_p: { type: Number, default: 1 },
    temperature: { type: Number, default: 1 },
    reasoning_effort: { type: Number },
    tool_resources: { type: Object, default: {} },
    metadata: { type: Object, default: {} },
    response_format: { type: String, default: "auto" },
  },
  { timestamps: true }
);

export const AssistantModel = mongoose.model("Assistant", assistantSchema);

const baseAgentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    object: { type: String, default: "agent" },
    created_at: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String },
    model: { type: String, required: true },
    instructions: { type: String },
    tools: [
      {
        type: { type: String, required: true },
        function: {
          name: { type: String, required: true },
          description: { type: String, required: true },
          parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
          strict: { type: Boolean, default: false },
        },
      },
    ],
    top_p: { type: Number, default: 1 },
    temperature: { type: Number, default: 1 },
    reasoning_effort: { type: Number },
    tool_resources: { type: Object, default: {} },
    metadata: { type: Object, default: {} },
    response_format: { type: String, default: "auto" },
  },
  { timestamps: true }
);

export default baseAgentSchema;
