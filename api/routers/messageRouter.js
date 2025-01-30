// messageRouter.ts
import { Router } from "express";
import { getAllMessages, getMessage, createMessage, } from "../controllers/messageControllers.js";
const messageController = {
    getAllMessages,
    getMessage,
    createMessage,
};
// const messageController = require("../controllers/messageController");
const router = Router();
// Get all messages
router.route("/").get(messageController.getAllMessages);
// Get a specific message by ID
router.route("/:messageId").get(messageController.getMessage);
// Create a new message
router.route("/").post(messageController.createMessage);
export default router;
