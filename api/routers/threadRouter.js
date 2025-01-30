// const express = require("express");
// threadRouter.ts
import { Router } from "express";
// const threadController = require("../controllers/threadController");
import { getThreadWithMessages, getThreadByAssistantId, createThread, } from "../controllers/threadControllers.js";
const threadController = {
    getThreadWithMessages,
    getThreadByAssistantId,
    createThread,
};
const router = Router();
// Get a thread with messages by thread ID
router.route("/:threadId").get(threadController.getThreadWithMessages);
// Get a thread by assistant ID
router
    .route("/assistant/:assistantId")
    .get(threadController.getThreadByAssistantId);
// Create a new thread
router.route("/").post(threadController.createThread);
// Add more routes if necessary, such as updating or deleting threads
// router.route("/update").patch(threadController.updateThread);
export default router;
