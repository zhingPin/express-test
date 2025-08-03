import OpenAI from "openai";
import { MessageModel } from "../(models)/messageSchema.js";
import { catchAsync } from "../utils/catchAsync.js";
import { handleRunToolCalls } from "../../ai/helpers/handleRunToolCall.js";
import { ThreadModel } from "../(models)/threadSchema.js";
import AppError from "../utils/appError.js";

const client = new OpenAI();

const getThreadandLatestRunStatus = catchAsync(async (req, res, next) => {
    const thread = await ThreadModel.findById(req.params.id);

    if (!thread) {
        return next(new AppError("Thread data not available", 400));
    }

    const threadId = thread.threadId;
    const runId = thread.run?.id; // Add optional chaining to prevent errors if `run` is undefined

    if (!runId) {
        console.log("⚠️ No runId found. Moving to next...");
        return next();
    }

    // Retrieve the latest run status
    let latestRun = await client.beta.threads.runs.retrieve(threadId, runId);

    // Update the thread with the latest run data
    const updatedThread = await ThreadModel.findByIdAndUpdate(
        req.params.id,
        {
            run: {
                id: latestRun.id,
                status: latestRun.status,
            },
        },
        { new: true }
    );

    if (!updatedThread) {
        return next(new AppError("Could not update thread run status", 400));
    }

    console.log(`📜 Thread run status: ${updatedThread.run.status}`);

});

const getAssistantChunk = catchAsync(async (req, res, next) => {
    console.log("🔍 getAssistantChunk called");

    const { threadId, run } = await ThreadModel.findById(req.params.id);
    const { lastChunkIndex = 0 } = req.query; // start from index 0 if not provided

    if (!run || run.status !== "completed") {
        console.log("⏳ Run not completed yet. Returning 202...");
        return res.status(202).json({
            status: "pending",
            message: "Run still in progress",
        });
    }

    const messages = await client.beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
    );

    if (!assistantMessage || !assistantMessage.content) {
        return res.status(404).json({
            status: "error",
            message: "No assistant content available",
        });
    }

    // Convert to simplified chunks (assuming text for now)
    const textChunks = assistantMessage.content
        .filter((msg) => msg.type === "text")
        .flatMap((msg) => msg.text.value.split(/(?<=\.|\?|!)(\s+)/g)) // split by sentence
        .filter((chunk) => chunk.trim() !== "");

    const nextChunkIndex = parseInt(lastChunkIndex);
    const chunk = textChunks[nextChunkIndex];

    if (!chunk) {
        return res.status(204).json({
            status: "done",
            message: "All chunks delivered.",
        });
    }

    return res.status(200).json({
        status: "success",
        chunkIndex: nextChunkIndex,
        totalChunks: textChunks.length,
        data: chunk,
        done: nextChunkIndex >= textChunks.length - 1,
    });
});
