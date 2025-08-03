import { ThreadModel } from "../../(models)/threadSchema";
import { catchAsync } from "../../utils/catchAsync";
import { OpenAI } from "openai";


const client = new OpenAI();
/**
 * Streams the assistant's response in chunks via Server-Sent Events (SSE).
 * This function retrieves the assistant's message from a thread and sends it
 * back to the client in manageable chunks.
 *
 * @param {Object} req - The request object containing the thread ID.
 * @param {Object} res - The response object used to send SSE data.
 * @param {Function} next - The next middleware function.
 */
const getAssistantChunk = catchAsync(async (req, res, next) => {
    console.log("🔍 getAssistantChunk (SSE mode) called");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    console.log("📡 Headers flushed, streaming started");

    const threadDoc = await ThreadModel.findById(req.params.id);
    if (!threadDoc) {
        console.log("❌ Thread not found");
        res.write(`data: ${JSON.stringify({ error: "Thread not found" })}\n\n`);
        return res.end();
    }

    const { threadId, run } = threadDoc;
    console.log(`🧵 threadId: ${threadId}, run.status: ${run?.status}`);

    if (!run || run.status !== "completed") {
        console.log("⏳ Run not completed yet");
        res.write(`data: ${JSON.stringify({ status: "pending" })}\n\n`);
        return res.end();
    }

    const messages = await client.beta.threads.messages.list(threadId);
    console.log(`📨 Retrieved ${messages.data.length} messages`);

    const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
    );

    if (!assistantMessage || !assistantMessage.content) {
        console.log("⚠️ No assistant message found");
        res.write(`data: ${JSON.stringify({ error: "No assistant content available" })}\n\n`);
        return res.end();
    }

    const textChunks = assistantMessage.content
        .filter((msg) => msg.type === "text")
        .flatMap((msg) => msg.text.value.split(/(?<=\.|\?|!)(\s+)/g))
        .filter((chunk) => chunk.trim() !== "");

    console.log(`✂️ Chunked into ${textChunks.length} parts`);

    for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(`🔹 Sending chunk ${i + 1}/${textChunks.length}: "${chunk.trim()}"`);
        res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
        await new Promise((r) => setTimeout(r, 100)); // simulate delay
    }

    console.log("✅ All chunks sent. Closing stream.");
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
});

const getAssistantChunkByLine = catchAsync(async (req, res, next) => {
    console.log("🔍 getAssistantChunk (SSE mode) called");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    console.log("📡 Headers flushed, streaming started");

    const threadDoc = await ThreadModel.findById(req.params.id);
    if (!threadDoc) {
        console.log("❌ Thread not found");
        res.write(`data: ${JSON.stringify({ error: "Thread not found" })}\n\n`);
        return res.end();
    }

    const { threadId, run } = threadDoc;
    console.log(`🧵 threadId: ${threadId}, run.status: ${run?.status}`);

    if (!run || run.status !== "completed") {
        console.log("⏳ Run not completed yet");
        res.write(`data: ${JSON.stringify({ status: "pending" })}\n\n`);
        return res.end();
    }

    const messages = await client.beta.threads.messages.list(threadId);
    console.log(`📨 Retrieved ${messages.data.length} messages`);

    const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
    );

    if (!assistantMessage || !assistantMessage.content) {
        console.log("⚠️ No assistant message found");
        res.write(`data: ${JSON.stringify({ error: "No assistant content available" })}\n\n`);
        return res.end();
    }

    const textChunks = assistantMessage.content
        .filter((msg) => msg.type === "text")
        .flatMap((msg) => msg.text.value.split(/(?<=\.|\?|!)(\s+)/g))
        .filter((chunk) => chunk.trim() !== "");

    console.log(`✂️ Chunked into ${textChunks.length} parts`);

    for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i].trim();

        // Stream chunk
        res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);

        // Save to DB immediately (appending to last assistant message or as new one)
        const threadDoc = await ThreadModel.findById(req.params.id);
        if (!threadDoc) break;

        // Append to last assistant message, or create a new one
        const lastMsg = [...threadDoc.messages].reverse().find(msg => msg.role === "assistant");

        if (lastMsg) {
            lastMsg.content += " " + chunk;
        } else {
            threadDoc.messages.push({
                role: "assistant",
                content: chunk,
                createdAt: new Date(),
            });
        }

        await threadDoc.save();
    }


    console.log("✅ All chunks sent. Closing stream.");
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
});