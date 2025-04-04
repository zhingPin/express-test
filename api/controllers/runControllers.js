import OpenAI from "openai";
import { MessageModel } from "../(models)/messageSchema.js";
import { catchAsync } from "../utils/catchAsync.js";
import { handleRunToolCalls } from "../../ai/helpers/handleRunToolCall.js";
import { ThreadModel } from "../(models)/threadSchema.js";
import AppError from "../utils/appError.js";

const client = new OpenAI();

const getThreadRunStatus = catchAsync(async (req, res, next) => {
  const thread = await ThreadModel.findById(req.params.id);
  if (!thread) {
    return next(new AppError("Thread not found", 404));
  }

  // If no run exists yet, move to createRun
  if (!thread.run?.id || !thread.run?.status) {
    console.log("🟡 No existing run found, proceeding to createRun...");
    req.thread = thread; // Pass thread forward
    next(); // Skip retrieving a non-existent run
  }
  console.log("thread.run", thread.run);
  let run = await client.beta.threads.runs.retrieve(
    thread.threadId,
    thread.run.id
  );

  // If run is still in progress, return a retry response
  if (run.status === "in_progress" || run.status === "queued") {
    console.log(
      `🔄 Run already in progress (${run.status}), passing it to next.`
    );
    req.run = run;
    console.log(run);
    next();
  }

  req.thread = thread;
  req.run = run; // Store retrieved run
  next();
});

const createMessage = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const { thread } = req; // Get thread from req

  if (!thread) {
    return next(new AppError("Thread data not available", 400));
  }

  // If no run exists, create one and store it in `req.run`
  if (!thread.run?.id || !thread.run?.status) {
    console.log("🟡 No existing run found, creating a new run...");
    // await createRun(req, res, next);
    // return;
  } else if (
    thread.run.status === "in_progress" ||
    thread.run.status === "queued"
  ) {
    console.log(
      `🔄 Existing run (${thread.run.status}), waiting for completion...`
    );
    req.run = thread.run;
    next(); // Pass to performRun
  }

  const threadId = thread.threadId;

  if (req.run.status === "completed" || req.run.status === "failed") {
    // Send message to OpenAI
    await client.beta.threads.messages.create(thread.threadId, {
      role: "user",
      content: content,
    });

    // Store message in database
    await MessageModel.create({
      threadId,
      sender: "user",
      content: content,
      timestamp: new Date(),
    });

    console.log("📩 Message sent:", content);
  }

  next();
});

const createRun = catchAsync(async (req, res, next) => {
  const { thread } = req;
  if (!thread) return next(new AppError("Thread data not available", 400));

  let latestRun = null;

  // 🔹 Check if a run already exists
  if (thread.run?.id) {
    latestRun = await client.beta.threads.runs.retrieve(
      thread.threadId,
      thread.run.id
    );

    if (latestRun.status === "requires_action") {
      console.log("⚡ Run requires action, handling tool calls...");
      req.run = latestRun;
      next();
    }

    // 🔹 If the existing run is still active, reuse it
    if (["in_progress", "queued"].includes(latestRun.status)) {
      console.log(`🔄 Active run found (${latestRun.status}), reusing it.`);
      req.run = latestRun;
      return next();
    }
  }

  // 🔹 If no active run, create a new one
  console.log("🆕 Creating a new run...");
  const newRun = await client.beta.threads.runs.create(thread.threadId, {
    assistant_id: thread.assistantId,
  });

  console.log(`✅ New run created: ${newRun.id}, Status: ${newRun.status}`);

  // 🔹 Update thread with new run details and status
  thread.run = { id: newRun.id, status: newRun.status };

  // Update the thread document in the database
  await ThreadModel.findOneAndUpdate(
    { threadId: thread.threadId }, // Filter by threadId
    { run: thread.run }, // Update the run field
    { new: true } // Return the updated document
  );

  req.run = newRun; // Store in request
  next();
});

const performRun = catchAsync(async (req, res, next) => {
  let { run, thread } = req;
  if (!run || !thread) {
    return next(new AppError("Run or thread data missing", 400));
  }
  console.log(thread);

  console.log(`🚀 Checking run status for ${run.id}...`);

  // Fetch the latest run status from OpenAI
  run = await client.beta.threads.runs.retrieve(thread.threadId, run.id);
  console.log(`🔄 Updated run status: ${run.status}`);

  // Update the thread record with the latest run status
  thread.run = { id: run.id, status: run.status };
  await thread.save();

  if (run.status === "requires_action") {
    console.log("⚡ Run requires action, handling tool calls...");
    req.run = await handleRunToolCalls(run, client, thread);

    thread.run = { id: req.run.id, status: req.run.status };
    console.log("pr", " id:", req.run.id, "status:", req.run.status);

    await ThreadModel.findOneAndUpdate(
      { threadId: req.params.id }, // Filter by threadId
      { run: thread.run }, // Update the run field
      { new: true } // Return the updated document
    );
  }

  next();
});

const getRunResponse = catchAsync(async (req, res, next) => {
  const { run, thread } = req;
  if (!run || !thread) {
    return next(new AppError("Run or thread data missing", 400));
  }

  // 🔹 **Always update thread.run status**
  thread.run.status = run.status;
  await thread.save(); // Save updated status

  if (run.status === "in_progress" || run.status === "queued") {
    return res.status(202).json({
      message: "Run still in progress, please retry.",
      runId: run.id,
      status: run.status,
    });
  }

  if (run.status === "requires_action") {
    return res.status(202).json({
      message: "Run requires action",
      runId: run.id,
      status: run.status,
    });
  }

  if (run.status === "failed") {
    const errorMessage = `I encountered an error: ${
      run.last_error?.message || "Unknown error"
    }`;
    console.error("Run failed:", run.last_error);

    await client.beta.threads.messages.create(thread.threadId, {
      role: "assistant",
      content: errorMessage,
    });

    return res.status(202).json({
      type: "text",
      text: { value: errorMessage, annotations: [] },
    });
  }

  if (run.status === "completed") {
    const messages = await client.beta.threads.messages.list(thread.threadId);
    const assistantMessage = messages.data.find(
      (message) => message.role === "assistant"
    );

    if (assistantMessage) {
      await MessageModel.create({ content: assistantMessage.content });
      return res.status(200).json({
        type: "text",
        text: { value: assistantMessage.content, annotations: [] },
      });
    }

    return res.status(200).json({
      type: "text",
      text: { value: "No response from assistant", annotations: [] },
    });
  }
});

export const runControllers = {
  getThreadRunStatus,
  createMessage,
  createRun,
  performRun,
  getRunResponse,
};

// router
//   .route("/example-route")
//   .get(
//     getThreadRunStatus,
//     createMessage,
//     createRun,
//     performRun,
//     getRunResponse
//   );
