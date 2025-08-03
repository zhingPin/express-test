import OpenAI from "openai";
import { catchAsync } from "../../utils/catchAsync.js";
import { ThreadModel } from "../../(models)/threadSchema.js";
import AppError from "../../utils/appError.js";
import { MessageModel } from "../../(models)/messageSchema.js";

const client = new OpenAI();

const getThreadandLatestRunStatus = catchAsync(async (req, res, next) => {
    const thread = await ThreadModel.findById(req.params.id);

    if (!thread) {
        return next(new AppError("Thread data not available", 400));
    }

    const threadId = thread.threadId;
    const runId = thread.run.id; // Add optional chaining to prevent errors if `run` is undefined

    if (!runId) {
        return next(new AppError("runId not found", 400));

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

    // console.log(`📜 Thread run status: ${updatedThread.run.status}`);

});

const getAssistantChunk = catchAsync(async (req, res, next) => {
    console.log("🔍 getAssistantChunk (SSE mode) called");

    // Set up Server-Sent Events headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // flush headers so client receives the connection immediately

    // Fetch thread document from DB
    const threadDoc = await ThreadModel.findById(req.params.id);
    if (!threadDoc) {
        console.log("❌ Thread not found");
        res.write(`data: ${JSON.stringify({ error: "Thread not found" })}\n\n`);
        return res.end();
    }

    const { threadId, run } = threadDoc;
    console.log(`🧵 threadId: ${threadId}, run.status: ${run.status}`);

    // Check if assistant response already exists in DB (cached)
    const existingMessage = await MessageModel.findOne({
        "run.id": run.id,
        sender: "assistant",
        hasResponse: true
    });

    if (existingMessage) {
        console.log("✅ Response already exists, returning cached response");

        const textContent = existingMessage.content?.[0]?.text?.value || "";

        // Split text into chunks at punctuation + whitespace
        const chunks = textContent
            .split(/(?<=\.|\?|!)(\s+)/g)
            .filter((chunk) => chunk.trim() !== "");

        // Send each chunk one by one to simulate streaming
        for (let i = 0; i < chunks.length; i++) {
            res.write(`data: ${JSON.stringify({ delta: chunks[i].trim() })}\n\n`);
            await new Promise((r) => setTimeout(r, 100)); // simulate slight delay
        }

        // Mark stream as complete
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
    }

    // If run isn't completed yet, return pending status
    if (!run || run.status !== "completed") {
        console.log("⏳ Run not completed yet", run);
        res.write(`data: ${JSON.stringify({ status: "pending" })}\n\n`);
        return res.end();
    }

    // Get messages from OpenAI thread
    const messages = await client.beta.threads.messages.list(threadId);
    console.log(`📨 Retrieved ${messages.data.length} messages`);

    const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
    );

    // If no assistant message found, return error
    if (!assistantMessage || !assistantMessage.content) {
        console.log("⚠️ No assistant message found");
        res.write(`data: ${JSON.stringify({ error: "No assistant content available" })}\n\n`);
        return res.end();
    }

    // Break assistant message text into chunks
    const textChunks = assistantMessage.content
        .filter((msg) => msg.type === "text")
        .flatMap((msg) =>
            msg.text.value.split(/(?<=\.|\?|!)(\s+)/g)
        )
        .filter((chunk) => chunk.trim() !== "");

    console.log(`✂️ Chunked into ${textChunks.length} parts`);

    let fullAssistantText = "";

    // Stream each chunk to the client with a delay
    for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i].trim();
        fullAssistantText += chunk + " ";
        console.log(`🔹 Sending chunk ${i + 1}/${textChunks.length}: "${chunk}"`);
        res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
        await new Promise((r) => setTimeout(r, 100)); // simulate delay
    }

    // Save assistant message to DB
    const newMessage = await MessageModel.create({
        threadId,
        sender: "assistant",
        content: [
            {
                type: "text",
                text: {
                    value: fullAssistantText.trim(),
                    annotations: [],
                },
                streamCompleted: true
            },
        ],
        run: { id: run.id, status: run.status },
        hasResponse: true,
    });


    console.log("✅ Assistant response created.", newMessage.run.status);

    // Final "done" event
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end(); // close the stream
});

export const getRunControllers = {
    getThreadandLatestRunStatus,
    getAssistantChunk,
};

