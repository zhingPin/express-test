import { AssistantModel } from "../(models)/assistantSchema.js";
// const AssistantModel: Model<IAssistant> = require("../models/assistantModel");

export const getAssistant = async (req, res, next) => {
  try {
    const { assistantId } = req.params;
    const assistant = await AssistantModel.findOne({ assistantId });
    if (!assistant) {
      return res.status(404).json({
        status: "fail",
        message: "Assistant not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        assistant,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAssistants = async (req, res, next) => {
  console.log(req.requestTime);
  try {
    const assistants = await AssistantModel.find();
    res.status(200).json({
      status: "success",
      results: assistants.length,
      data: {
        assistants,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAssistant = async (req, res, next) => {
  console.log(req.requestTime);
  try {
    console.log(req.body);
    const newAssistant = await AssistantModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        assistant: newAssistant,
      },
    });
  } catch (error) {
    next(error);
  }
};
export async function saveAssistantToDB(req, res, next) {
  try {
    const assistant = await AssistantModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        assistant,
      },
    });
    return assistant; // Return the saved assistant
  } catch (error) {
    console.error("Error saving assistant to database:", error);
    next(error);
  }
}
