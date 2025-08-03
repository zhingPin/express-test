import OpenAI from "openai";
import { MessageModel } from "../../(models)/messageSchema.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { handleRunToolCalls } from "../../../ai/helpers/handleRunToolCall.js";
import { ThreadModel } from "../../(models)/threadSchema.js";
import AppError from "../../utils/appError.js";


const client = new OpenAI();

const getThreadRunStatusTest = catchAsync(async (req, res, next) => {
    console.log("🔍 getThreadRunStatusTest called");

    const thread = await ThreadModel.findById(req.params.id);
    if (!thread) return next(new AppError("Thread not found", 404));

    const threadId = thread.threadId;
    const runId = thread.run?.id;

    if (runId) {
        console.log("🔁 Run ID is present:", runId);

        const latestRun = await client.beta.threads.runs.retrieve(threadId, runId);

        // Update DB with the latest run status
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

        console.log("🆕 Updated run info:",
            "📜 runId:", latestRun.id,
            "📜 status:", latestRun.status
        );

        // Handle tool calls if required
        if (latestRun.status === "requires_action") {
            const performedRun = await handleRunToolCalls(latestRun, client, threadId);

            await ThreadModel.findByIdAndUpdate(
                req.params.id,
                {
                    run: {
                        ...thread.run,
                        hasResponse: true,
                    },
                },
                { new: true }
            );

            return res.status(200).json({
                status: "success",
                data: {
                    performedRun: performedRun.status,
                    required_action: performedRun.required_action,
                    message: "Run tool calls handled successfully.",
                },
            });
        }

        // Still processing? Let client keep polling
        if (["queued", "in_progress", "cancelling", "incomplete"].includes(latestRun.status)) {
            return res.status(202).json({
                status: "pending",
                message: "Run is still processing.",
                runId: latestRun.id,
                threadId,
            });
        }

        // Run has finished (or failed), allow message creation
        req.threadId = threadId;
        req.run = {
            id: latestRun.id,
            status: latestRun.status,
        };

        return next();
    }

    // No runId at all — first message likely
    console.log("🆕 No run present, will create a new message.");
    req.threadId = threadId;
    return next();
});

const createMessageTest = catchAsync(async (req, res, next) => {
    const { content } = req.body;
    const threadId = req.threadId;

    const thread = await ThreadModel.findById(req.params.id);

    if (!thread || !content) {
        return next(new AppError("Thread ID and content are required", 400));
    }

    // Check if response already exists in DB
    const existingResponse = await MessageModel.findOne({
        // run: { id: run.id },
        "run.id": thread.run.id,
        sender: "assistant",
        hasResponse: true
    });

    if (!existingResponse) {
        console.log("✅ Response already exists, returning cached response");
        return res.status(200).json({
            status: "ready",
            message: "Assistant message ready to stream",
            run: thread.run.id,
        });
    }

    console.log("📝 Sending user message to OpenAI...");
    await client.beta.threads.messages.create(threadId, {
        role: "user",
        content: content,
    });

    // 🔥 Create a new run
    console.log("🚀 Creating a new run...");
    const run = await client.beta.threads.runs.create(thread.threadId, {
        assistant_id: thread.assistantId,
    });



    if (!run || !run.id || ["expired", "failed", "cancelled"].includes(run.status)) {
        throw new Error("Run creation failed or returned invalid run ID");
    }

    // Update thread with new run
    const updatedThread = await ThreadModel.findByIdAndUpdate(
        thread._id,
        {
            run: {
                id: run.id,
                status: run.status,
            },
        },
        { new: true }
    );

    if (!updatedThread) {
        return next(new AppError("Failed to update thread with new run", 500));
    }

    console.log(`✅ New run created: ${run.id} (status: ${run.status})`);

    // Format message content
    const contentArray = Array.isArray(content) ? content : [content];
    const formattedContent = contentArray
        .map((msg) =>
            typeof msg === "string"
                ? { type: "text", text: { value: msg, annotations: [] } }
                : null
        )
        .filter(Boolean);

    const newMessage = await MessageModel.create({
        threadId: thread.threadId,
        sender: "user",
        content: formattedContent,
        run
    });

    console.log("✅ User message created", newMessage.run.status);

    return res.status(201).json({
        status: "success",
        message: "Message created and run started.",
        runId: run.id,
    });
});

/**
 * Check if an assistant has responded to a specific run.
 * @param {string} runId - The run ID to check.
 * @returns {Promise<boolean>} - Returns true if assistant message exists.
 */
async function hasAssistantResponded(runId) {
    if (!runId) return false;

    const assistantMessage = await MessageModel.findOne({
        "run.id": runId,
        sender: "assistant",
        hasResponse: true
    });

    return !!assistantMessage;
}

export const createRunControllersTest = {
    getThreadRunStatusTest,
    createMessageTest
}