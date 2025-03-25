import { AssistantModel } from "../(models)/assistantSchema.js";
import { catchAsync } from "../utils/catchAsync.js";
import { createAssistant } from "../../ai/helpers/createAssistant.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/helpers/apiFeatures.js";
import OpenAI from "openai";

const client = new OpenAI();

export const createAssistants = catchAsync(async (req, res, next) => {
  console.log(req.requestTime);

  const { name } = req.body; // Extract name from request
  const assistant = await createAssistant(client, name || "Neo Anderson"); // Use provided name or default
  console.log("assistant", assistant);

  if (!assistant || !assistant.id) {
    return next(new AppError("Error creating assistant", 400));
  }

  const newAssistant = await AssistantModel.create(assistant);
  if (!newAssistant) {
    return next(new AppError("Error saving assistant to database", 400));
  }

  res.status(201).json({
    status: "success",
    data: {
      assistant: newAssistant,
    },
    message: "New assistant created",
  });
});

export const getAssistant = catchAsync(async (req, res, next) => {
  const assistant = await AssistantModel.findById(req.params.id);

  if (!assistant) {
    return next(new AppError("Assistant not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      assistant,
    },
  });
});

const getAllAssistants = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(AssistantModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const assistants = await features.query;

  if (features.pagination().pageDoesNotExist) {
    return next(new AppError("This page does not exist", 404));
  }

  if (
    (!assistants.length && req.query.page) ||
    (!assistants.length && req.query.limit)
  ) {
    return next(new AppError("You've scrolled too far !!!", 404));
  }

  res.status(200).json({
    status: "success",
    results: assistants.length,
    data: {
      assistants,
    },
  });
});

export const updateAssistant = catchAsync(async (req, res, next) => {
  console.log(req.requestTime);
  console.log(req.body);
  // const newAssistant = await AssistantModel.findByIdAndUpdate(req.body);
  const assistant = await AssistantModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assistant) {
    return next(new AppError("Incorrect Assistant ID update failed", 404));
  }
  res.status(201).json({
    status: "success",
    data: {
      assistant,
    },
  });
});

export const deleteAssistant = catchAsync(async (req, res, next) => {
  const assistant = await AssistantModel.findByIdAndDelete(req.params.id);
  if (!assistant) {
    return next(new AppError("Incorrect NFT ID delete failed", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const checkStatus = (req, res, next) => {
  if (!req.body.status) {
    req.body.status = "available";
  }
  next();
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

export const assistantController = {
  getAssistant,
  getAllAssistants,
  createAssistants,
  updateAssistant,
  deleteAssistant,
};
