import mongoose from "mongoose";

const toolSchema = new mongoose.Schema({
  definition: {
    type: Object,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  version: {
    type: String,
  },
  metadata: {
    type: Object,
    default: {},
  },
  category: {
    type: String,
  },
  handler: {
    type: Function, // Note: You might need a placeholder or custom handling for functions
    required: true,
  },
});

export const ToolModel = mongoose.model("Tool", toolSchema);
