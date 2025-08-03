import { catchAsync } from "../../helpers/catchAsync.js";
import { AssistantModel } from "../models/assistantSchema.js";
import AppError from "../../helpers/appError.js";
export const getAllAssistants = catchAsync(async (req, res, next) => {
    const assistants = await AssistantModel.find();
    res.status(200).json({
        status: "success",
        results: assistants.length,
        data: {
            assistants,
        },
    });
});
export const getAssistant = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Ensure this matches the route param name
    const assistant = await AssistantModel.findById(id); // Use findById instead of findOne
    if (!assistant) {
        return next(new AppError("Assistant not found", 404)); // Use AppError for not found
    }
    res.status(200).json({
        status: "success",
        data: {
            assistant,
        },
    });
});
export const createAssistant = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newAssistant = await AssistantModel.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            assistant: newAssistant,
        },
    });
});
export const assistantControllers = {
    getAllAssistants,
    getAssistant,
    createAssistant
};
