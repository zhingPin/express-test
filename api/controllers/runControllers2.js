import OpenAI from "openai";
import { MessageModel } from "../(models)/messageSchema.js";
import { catchAsync } from "../utils/catchAsync.js";
import { handleRunToolCalls } from "../../ai/helpers/handleRunToolCall.js";
import { ThreadModel } from "../(models)/threadSchema.js";
import AppError from "../utils/appError.js";

const client = new OpenAI();

const getThreadRunStatus2 = catchAsync(async (req, res, next) => {
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
  req.thread = updatedThread;
  next();
});
const getAssistantResponse2 = catchAsync(async (req, res, next) => {
  console.log("🔍 getAssistantResponse2 called");
  // const { threadId, run } = req.thread;
  const { threadId, run } = await ThreadModel.findById(req.params.id);
  if (
    !run ||
    (run.status !== "completed" &&
      run.status !== "expired" &&
      run.status !== "failed")
  ) {
    console.log("⏳ Assistant response is still pending. Returning 202...");
    // return res
    //   .status(202)
    //   .json({ status: "success", message: "Run still in progress" });
    return next();
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
  // if (!assistantMessage) {
  //   console.log("❌ No assistant response found.");
  //   return res
  //     .status(404)
  //     .json({ status: "error", message: "No assistant response found." });
  // }
  // Debug: Log the assistant message content
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
      if (msg.type === "image") {
        return {
          type: "image",
          image: { url: msg.image_url, alt: msg.alt_text || "" },
        };
      }
      if (msg.type === "button") {
        return {
          type: "button",
          button: { label: msg.label, action: msg.action },
        };
      }
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

const createMessage2 = catchAsync(async (req, res, next) => {
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

    req.thread = thread;
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
    req.run = run;

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

const performRun2 = catchAsync(async (req, res, next) => {
  const thread = await ThreadModel.findById(req.params.id);
  // console.log("pr thread", thread.run.status);

  if (!thread || !thread.run || !thread.run.id) {
    return next(new AppError("Thread data is missing", 400));
  }

  const run = req.run; // Latest run status is already in req.run
  // console.log("run", run);

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
    const performedRun = handleRunToolCalls(run, client, thread.threadId);
    console.log("pr thread", thread.run.status);

    return res.status(200).json({
      status: "success",
      data: {
        performedRun: performedRun.status,
        required_action: performedRun.required_action,
        message: "run complete",
      },
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
const checkRunStatus = catchAsync(async (req, res, next) => {
  const { threadId, runId } = req.params;

  if (!threadId || !runId) {
    return next(new AppError("Thread ID and Run ID are required", 400));
  }

  const run = await client.beta.threads.runs.retrieve(threadId, runId);

  if (!run) {
    return next(new AppError("Run not found", 404));
  }

  // ✅ If run is completed, fetch messages
  if (run.status === "completed") {
    console.log(`✅ Run ${run.id} completed. Fetching assistant response...`);

    const messages = await client.beta.threads.messages.list(threadId);

    return res.status(200).json({
      status: "success",
      data: {
        run,
        messages,
      },
    });
  }

  // ⏳ If still in progress, return current status
  return res.status(200).json({
    status: "pending",
    data: {
      runStatus: run.status, // Still "in_progress" or "queued"
    },
  });
});

const setRunStatusExpired = catchAsync(async (req, res, next) => {
  // Update the run.id and run.status directly using findByIdAndUpdate
  const updatedThread = await ThreadModel.findByIdAndUpdate(
    req.params.id,
    {
      run: {
        id: "run_Aj1kG5a9XH9APXJDre0dfwgx", // Set the run.id
        status: "expired", // Set the run.status to expired
      },
    },

    { new: true } // This option ensures that the updated document is returned
  );

  // Check if the thread exists after the update
  if (!updatedThread) {
    return next(new AppError("Thread not found", 404));
  }

  // Send the response back with the updated thread data
  res.status(200).json({
    status: "success",
    data: {
      run: updatedThread.run, // Send back the updated run data
    },
  });
});

export const runControllers2 = {
  getThreadRunStatus2,
  getAssistantResponse2,
  createMessage2,
  createRun2,
  performRun2,
  // checkRunStatus,
  // setRunStatusExpired,
};
