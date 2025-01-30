import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../../utils/mongoDB.js";
connectToDatabase();
const AssistantSchema = new Schema({
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
}, { timestamps: true });
export const AssistantModel = mongoose.model("Assistant", AssistantSchema);
