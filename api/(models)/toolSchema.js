import { Schema, model } from "mongoose";
import { connectToDatabase } from "../../utils/mongoDB.js";
connectToDatabase();
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
const ToolModel = model("Tool", toolSchema);
export default ToolModel;
