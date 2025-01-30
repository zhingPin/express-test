// models/dataModel.ts
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../../utils/mongoDB.js";
connectToDatabase();
const DataSchema = new Schema({
    userInput: { type: String, required: true },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
export const DataModel = mongoose.model("Data", DataSchema);
