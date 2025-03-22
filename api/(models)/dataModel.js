// models/dataModel.ts
import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
  userInput: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const DataModel = mongoose.model("Data", DataSchema);
