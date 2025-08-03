import { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { catchAsync } from "../../../helpers/catchAsync.js";
import { ThreadModel } from "../../models/threadSchema.js";
import AppError from "../../../helpers/appError.js";
import { handleRunToolCalls } from "../../../../assistant/AI/openai/handleRunToolCall.js";
import { MessageModel } from "../../models/messageSchema.js";
import { AssistantModel } from "../../models/assistantSchema.js";


const client = new OpenAI();

const getThreadRunStatusTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("🔍 getThreadRunStatusTest called");


    const thread = await ThreadModel.findById(req.params.id);
    if (!thread) return next(new AppError("Thread not found", 404));

    // const lastChecked = thread.run?.lastChecked;
    // if (lastChecked && Date.now() - lastChecked.getTime() < 1000) {
    //     return res.status(429).json({ message: "Polling too frequently." });
    // }


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
                lastChecked: Date.now()
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
                message: "Run tool calls handled successfully.",
                data: {
                    run: {
                        status: performedRun.status,
                        id: performedRun.id
                    },
                    required_action: performedRun.required_action,
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
        req.params.threadId = threadId;
        req.params.runStatus = latestRun.status
        req.params.runID = latestRun.id

        return next();
    }

    // No runId at all — first message likely
    console.log("🆕 No run present, will create a new message.");
    req.params.threadId = threadId;
    return next();
});

const createMessageTest = catchAsync(async (req, res, next) => {
    const { content } = req.body;
    const threadId = req.params.threadId;

    const thread = await ThreadModel.findById(req.params.id);

    if (!thread || !content) {
        return next(new AppError("Thread ID and content are required", 400));
    }

    // Check if response already exists in DB
    const existingResponse = await MessageModel.findOne({
        // run: { id: thread.run.id },
        "run.id": thread.run.id,
        sender: "assistant",
    });

    if (!existingResponse) {
        console.log("✅ Assistant response is ready to fetch");
        return res.status(200).json({
            status: "ready",
            message: "Assistant message ready to stream",
            run: {
                id: thread.run.id,
                status: thread.run.status
            },
            assistantMessage: existingResponse,
        });
    }

    console.log("📝 Sending user message to OpenAI...");
    await client.beta.threads.messages.create(threadId, {
        role: "user",
        content: content,
    });

    const assistant = await AssistantModel.findById(thread.assistantId);
    if (!assistant) {
        throw new Error("Assistant not found");
    }
    console.log("assistantId", assistant.assistantId)

    const run = await client.beta.threads.runs.create(thread.threadId, {
        assistant_id: assistant.assistantId, // ensure it's a string
    });



    if (!run || !run.id || ["expired", "failed", "cancelled"].includes(run.status)) {
        throw new Error("🔥 Run creation failed or returned invalid run ID");
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
        .map((msg) => {
            if (typeof msg === "string") {
                return { type: "text", text: { value: msg, annotations: [] } };
            }
            if (msg.type === "image") {
                return { type: "image", image: { url: msg.url, alt: msg.alt || "" } };
            }
            if (msg.type === "button") {
                return {
                    type: "button",
                    button: { label: msg.label, action: msg.action },
                };
            }
            return null;
        })
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
        runId: {
            id: run.id,
            status: run.status
        },
        userMessage: content
    });
});

/**
 * Check if an assistant has responded to a specific run.
 * @param {string} runId - The run ID to check.
 * @returns {Promise<boolean>} - Returns true if assistant message exists.
 */
// async function hasAssistantResponded(runId: string) {
//     if (!runId) return false;

//     const assistantMessage = await MessageModel.findOne({
//         "run.id": runId,
//         sender: "assistant",
//         hasResponse: true
//     });

//     return !!assistantMessage;
// }

export const runControllers_v2 = {
    getThreadRunStatusTest,
    createMessageTest
}