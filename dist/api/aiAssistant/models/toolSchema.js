import mongoose, { Schema } from "mongoose";
const toolSchema = new Schema({
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
const ToolModel = mongoose.model("Tool", toolSchema);
export default ToolModel;
