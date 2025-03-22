// messageRouter.ts
import { Router } from "express";
import { messageController } from "../controllers/messageControllers.js";

const router = Router();
// Get all messages
router.route("/").get(messageController.getAllMessages);
// Get a specific message by ID
router.route("/:messageId").get(messageController.getMessage);
// Create a new message
router.route("/").post(messageController.createMessage);
export default router;
