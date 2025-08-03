import express, { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { catchAsync } from "../../../helpers/catchAsync.js";
import { ThreadModel } from "../../models/threadSchema.js";
import AppError from "../../../helpers/appError.js";
import { MessageModel } from "../../models/messageSchema.js";
import { handleRunToolCalls } from "../../../../assistant/AI/openai/handleRunToolCall.js";


const client = new OpenAI();

const getThreadRunStatus2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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

    if (["queued", "in_progress"].includes(updatedThread.run.status)) {
        // If run is still processing, return 202 response
        console.log("⏳ Run is still in progress. Returning 202...");
        return res.status(202).json({
            status: "pending",
            message: "Run is still processing. Try again later.",
            runId: runId,
            threadId,
        });
    }

    // Otherwise, move to next
    // req.params.thread = updatedThread;
    req.params.id = updatedThread.id;
    // req.params.

    next();
});

const getAssistantResponse2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("🔍 getAssistantResponse2 called");
    // const { threadId, run } = req.thread;
    // const { threadId, run } = await ThreadModel.findById(req.params.id);
    const thread = await ThreadModel.findById(req.params.id);
    if (!thread) return next(new AppError("Thread not found", 404));

    const threadId = thread.threadId;
    const run = thread.run;

    if (
        !run ||
        (run.status !== "completed" &&
            run.status !== "expired" &&
            run.status !== "failed")
    ) {
        console.log("⏳ Assistant response is still pending. Returning 202... , run.status:", run.status);
        return res
            .status(202)
            .json({ status: "success", message: "Run still in progress" });
        // return next();
    }

    if (run.status === "failed" || run.status === "expired") {
        // Save a failure message in the DB
        const failedMessage = await MessageModel.create({
            threadId,
            sender: "assistant",
            content: [
                {
                    type: "text",
                    text: {
                        value:
                            "⚠️ The assistant was unable to generate a response due to an internal error. Please try again later.",
                        annotations: [],
                    },
                },
            ],
            run: { id: run.id, status: run.status },
            hasResponse: true,
        });

        console.log("❌ Assistant failure message saved to DB:", failedMessage);

        await ThreadModel.findByIdAndUpdate(req.params.id, {
            run: {
                status: "completed",
            },
        });
        // console.log("thread failed", latestRun.last_error);
        res.status(200).json({
            status: "success",
            data: {
                assistantResponse: failedMessage,
            },
            message: "Assistant response saved.",
        });
    }

    // Check if response already exists in DB
    const existingMessage = await MessageModel.findOne({
        // run: { id: run.id },
        "run.id": run.id,
        sender: "assistant",
    });

    if (existingMessage) {
        console.log("🔄 Cached response found. Skipping message creation.");

        return next();
    }
    console.log(
        "🔄 Cached response not found. Creating response:existingMessage."
    );

    // Fetch messages from OpenAI thread
    const messages = await client.beta.threads.messages.list(threadId);
    console.log("📜 Messages received:", messages.data.length);

    if (!messages) {
        return next(new AppError("No messages found for thread", 400));
    }

    const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
    );

    if (!assistantMessage) {
        return next(new AppError("❌ No assistant response found.", 400));
    }
    console.log("Assistant message content:", assistantMessage.content);

    // Convert response into the expected schema format
    const formattedContent = assistantMessage.content
        .map((msg) => {
            if (msg.type === "text") {
                return {
                    type: "text",
                    text: { value: msg.text.value, annotations: [] },
                };
            }
            // if (msg.type === "image") {
            //     return {
            //         type: "image",
            //         image: { url: msg.image_url, alt: msg.alt_text || "" },
            //     };
            // }
            // if (msg.type === "button") {
            //     return {
            //         type: "button",
            //         button: { label: msg.label, action: msg.action },
            //     };
            // }
            return null;
        })
        .filter(Boolean); // Remove null values if any

    // Save message to DB
    const newMessage = await MessageModel.create({
        threadId,
        sender: "assistant",
        content: formattedContent,
        run: { id: run.id, status: run.status },
        hasResponse: true,
    });

    console.log("✅ Assistant response saved to DB:", newMessage);
    await ThreadModel.findByIdAndUpdate(req.params.id, {
        hasAssistantResponse: true,
    });

    res.status(200).json({
        status: "success",
        data: {
            assistantResponse: newMessage,
        },
        message: "Assistant response saved.",
    });
});

const createMessage2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { content, sender } = req.body;

    const thread = await ThreadModel.findById(req.params.id);
    if (!thread) {
        return next(new AppError("Thread not found", 400));
    }

    if (thread.run && thread.run.status === "requires_action") {
        console.log(
            `🔄 cm Run already in progress (${thread.run.status}), skipping run creation.`
        );

        return next();
    }

    if (!thread.run || thread.run.status === "completed") {
        console.log("📝 Sending user message to OpenAI...");
        // Send message to OpenAI
        await client.beta.threads.messages.create(thread.threadId, {
            role: "user",
            content: content,
        });
        // Ensure content is always an array
        const contentArray = Array.isArray(content) ? content : [content];

        // Format user input to match schema
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

        console.log("📜 Formatted content:", formattedContent);

        const newMessage = await MessageModel.create({
            threadId: thread.threadId,
            sender,
            content: formattedContent,
        });

        console.log("✅ User message created:", newMessage);

        req.params.threadId = thread.threadId;
        next();
    }
});

const createRun2 = catchAsync(async (req, res, next) => {
    const thread = await ThreadModel.findById(req.params.id);
    if (!thread) {
        return next(new AppError("Thread data is missing", 400));
    }

    // Check if there's already an active run
    if (thread.run && thread.run.status === "requires_action") {
        console.log(
            `🔄 cr Run already in progress (${thread.run.status}) for (${thread.run.id}), skipping perform run.`
        );

        const run = await client.beta.threads.runs.retrieve(
            thread.threadId,
            thread.run.id
        );
        console.log(
            `🔄 cr retrieved runData (${run.status}) for (${run.id}), skipping perform run.`
        );
        // req.run = run;
        req.params.runId = run.id;
        req.params.runStatus = run.status;
        req.params.runId = run.id;



        return next();
    }

    // 🔥 Create a new run
    console.log("🚀 Creating a new run...");
    const newRun = await client.beta.threads.runs.create(thread.threadId, {
        assistant_id: thread.assistantId, // Make sure to have this in your .env
    });

    // Update the database with new run details
    const updatedThread = await ThreadModel.findByIdAndUpdate(
        thread._id,
        {
            run: {
                id: newRun.id,
                status: newRun.status,
            },
        },
        { new: true }
    );

    if (!updatedThread) {
        return next(new AppError("Failed to update thread with new run", 500));
    }

    console.log(`✅ New run created: ${newRun.id} (status: ${newRun.status})`);

    return res.status(201).json({
        status: "success",
        data: {
            updatedThread,
        },
        message: "new run created",
    });
});

const performRun2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const thread = await ThreadModel.findById(req.params.id);
    // console.log("pr thread", thread.run.status);

    if (!thread || !thread.run || !thread.run.id) {
        return next(new AppError("Thread data is missing", 400));
    }

    // const run = thread.run; // Latest run status is already in req.run
    // console.log("run", run);
    const run = await client.beta.threads.runs.retrieve(thread.threadId, thread.run.id);


    if (!run || !run.id) {
        return next(new AppError("Run data is missing", 400));
    }

    // ⚡ Handle "requires_action"
    if (run.status === "requires_action") {
        console.log("⚡ Run requires action, handling tool calls...");
        console.log("pr run id", run.id);
        console.log("pr thread run id", thread.run.id);

        console.log("pr thread", thread.run.status);

        // Process tool calls and update the run status
        handleRunToolCalls(run, client, thread.threadId)
            .then((performedRun) => {
                console.log("✅ Tool call performed:", performedRun?.status);
            })
            .catch((err) => {
                console.error("❌ Tool call failed:", err);
            });

    }

    // // ⏳ If still in progress or queued
    if (run.status === "in_progress" || run.status === "queued") {
        console.log(
            `⏳ Run still in progress (${run.status}), polling will continue...`
        );

        res.status(200).json({
            status: "success",
            data: {
                run,
                runStatus: run.status,
                // updatedThread: updatedThread.run.status,
            },
            message: `Run is still ${run.status}, waiting for completion...`,
        });
    }
});

export const runControllers_v1 = {
    getThreadRunStatus2,
    getAssistantResponse2,
    createMessage2,
    createRun2,
    performRun2,
    // checkRunStatus,
    // setRunStatusExpired,
};