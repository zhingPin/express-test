import OpenAI from "openai";
import { MessageModel } from "../../(models)/messageSchema.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { handleRunToolCalls } from "../../../ai/helpers/handleRunToolCall.js";
import { ThreadModel } from "../../(models)/threadSchema.js";
import AppError from "../../utils/appError.js";


const client = new OpenAI();

const getThreadRunStatus = catchAsync(async (req, res, next) => {
    const thread = await ThreadModel.findById(req.params.id);
    if (!thread) return next(new AppError("Thread not found", 404));

    const runId = thread.run?.id;
    if (!runId) {
        console.log("⚠️ No runId found. Moving to next...");
        return next();
    }


    // Fetch messages here
    const threadMessages = await MessageModel.find({ threadId: thread.threadId }).sort({ timestamp: -1 });

    const assistantResponded = await hasAssistantResponded(runId);
    // Block if assistant hasn't replied yet and there are previous messages
    if (!assistantResponded && threadMessages.length > 0) {
        console.warn(`⏳ No assistant reply yet for run ${runId}. Blocking new user message.`);
        return res.status(400).json({
            status: "awaiting_response",
            message: "Wait for the assistant's response before sending a new message.",
        });
    }

    let latestRun;
    try {
        latestRun = await client.beta.threads.runs.retrieve(thread.threadId, runId);
    } catch (err) {
        return next(new AppError("Failed to retrieve run from OpenAI", 502));
    }

    // Update run status in DB
    await ThreadModel.findByIdAndUpdate(thread._id, {
        run: { id: latestRun.id, status: latestRun.status },
    });

    // Re-fetch updated thread to get fresh data
    const updatedThread = await ThreadModel.findById(thread._id);

    // Handle requires_action before continuing
    if (latestRun.status === "requires_action") {
        const performedRun = await handleRunToolCalls(latestRun, client, thread.threadId);

        return res.status(200).json({
            status: "success",
            data: {
                performedRun: performedRun.status,
                required_action: performedRun.required_action,
                message: "Run tool calls handled successfully.",
            },
        });
    }

    // If still queued or in progress, return 202
    if (["queued", "in_progress"].includes(latestRun.status)) {
        return res.status(202).json({
            status: "pending",
            message: "Run is still processing.",
            runId: latestRun.id,
            threadId: thread.threadId,
        });
    }

    // Attach updated thread and continue to next middleware
    req.thread = updatedThread;
    next();
});

const createMessage = catchAsync(async (req, res, next) => {
    const thread = req.thread;
    const { content, sender } = req.body;

    if (!thread) {
        console.error("❌ No thread found in request.");
        return next(new AppError("Thread not found", 400));
    }

    const run = thread.run;
    const runStatus = run?.status;
    console.log(`🔄 Current run status: ${runStatus || "no run yet"}`);

    // 🧵 Fetch existing messages
    const threadMessages = await MessageModel.find({ threadId: thread.threadId }).sort({ timestamp: -1 });
    console.log(`📬 Found ${threadMessages.length} existing message(s) in thread.`);

    // 🧱 Format content for DB
    const contentArray = Array.isArray(content) ? content : [content];
    const formattedContent = contentArray
        .map((msg, i) => {
            if (typeof msg === "string") {
                console.log(`📝 [${i}] Text message`);
                return { type: "text", text: { value: msg, annotations: [] } };
            }
            if (msg.type === "image") {
                console.log(`🖼️ [${i}] Image: ${msg.url}`);
                return { type: "image", image: { url: msg.url, alt: msg.alt || "" } };
            }
            if (msg.type === "button") {
                console.log(`🔘 [${i}] Button: ${msg.label}`);
                return {
                    type: "button",
                    button: { label: msg.label, action: msg.action },
                };
            }
            console.warn(`⚠️ [${i}] Unknown message type:`, msg);
            return null;
        })
        .filter(Boolean);

    // 💾 Save user message to DB
    const newMessage = await MessageModel.create({
        threadId: thread.threadId,
        sender,
        content: formattedContent,
        // run: run ? { id: run.id } : undefined,
    });
    console.log("✅ User message saved to DB:", newMessage._id);

    // 🚀 Send message to OpenAI
    try {
        const aiRes = await client.beta.threads.messages.create(thread.threadId, {
            role: "user",
            content: content,
        });
        console.log("📤 Message sent to OpenAI thread:", aiRes.id);
    } catch (err) {
        console.error("❌ Failed to send message to OpenAI:", err?.message || err);
        return next(new AppError("Failed to send message to OpenAI", 502));
    }

    // ⏭️ Continue to next middleware
    next();
});


const createRun = catchAsync(async (req, res, next) => {
    const thread = await ThreadModel.findById(req.params.id);
    if (!thread) return next(new AppError("Thread not found", 400));

    const run = thread.run;

    // 🧵 Get current messages in the thread
    const threadMessages = await MessageModel.find({ threadId: thread.threadId }).sort({ timestamp: -1 });

    // ✅ Case 1: No run OR no messages → safe to start new run
    if (!run?.id || threadMessages.length === 0) {
        const newRun = await client.beta.threads.runs.create(thread.threadId, {
            assistant_id: thread.assistantId,
        });

        const updatedThread = await ThreadModel.findByIdAndUpdate(
            thread._id,
            { run: { id: newRun.id, status: newRun.status } },
            { new: true }
        );

        return res.status(201).json({
            status: "success",
            message: "New run started (no run or empty thread).",
            threadId: updatedThread.threadId,
            runId: newRun.id,
        });
    }

    // Use helper to check if assistant responded
    const assistantResponded = await hasAssistantResponded(run.id);

    // ✅ Case 2: Run completed but assistant never responded → start new run
    if (run.status === "completed" && !assistantResponded) {
        const newRun = await client.beta.threads.runs.create(thread.threadId, {
            assistant_id: thread.assistantId,
        });

        const updatedThread = await ThreadModel.findByIdAndUpdate(
            thread._id,
            { run: { id: newRun.id, status: newRun.status } },
            { new: true }
        );

        return res.status(201).json({
            status: "success",
            message: "New run started (assistant never replied to last one).",
            threadId: updatedThread.threadId,
            runId: newRun.id,
        });
    }

    // Get latest user message
    const latestUserMsg = await MessageModel.findOne({ threadId: thread.threadId, sender: "user" }).sort({ timestamp: -1 });

    // ✅ Case 3: Assistant responded, but there is a new user message after assistant reply → start new run
    if (assistantResponded && latestUserMsg) {
        const assistantMsg = await MessageModel.findOne({
            "run.id": run.id,
            sender: "assistant",
        }).sort({ timestamp: -1 });

        if (latestUserMsg.timestamp > assistantMsg.timestamp) {
            const newRun = await client.beta.threads.runs.create(thread.threadId, {
                assistant_id: thread.assistantId,
            });

            const updatedThread = await ThreadModel.findByIdAndUpdate(
                thread._id,
                { run: { id: newRun.id, status: newRun.status } },
                { new: true }
            );

            return res.status(201).json({
                status: "success",
                message: "New run started (new user message after assistant reply).",
                threadId: updatedThread.threadId,
                runId: newRun.id,
            });
        }
    }

    // ✅ Case 4: Assistant already responded and no new user message → reuse/cached
    if (assistantResponded) {
        return res.status(202).json({
            status: "cached",
            message: "Assistant already responded and no new user input.",
            threadId: thread.threadId,
            runId: run.id,
        });
    }

    // ❌ Case 5: Run exists but still processing and assistant hasn't responded
    return res.status(202).json({
        status: "waiting",
        message: "Run already in progress. Waiting for assistant response.",
        threadId: thread.threadId,
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
    });

    return !!assistantMessage;
}


export const createRunControllers = {
    getThreadRunStatus,
    createMessage,
    createRun,
};
