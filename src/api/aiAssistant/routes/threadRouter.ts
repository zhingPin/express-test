
import { Router } from "express";
import { threadController } from "../controllers/threadControllers.js";

const router = Router();

// Get a thread by assistant ID
router.get("/:id", threadController.getThreadWithMessages);
router.post("/:id", threadController.createThread);

router
    .route("/:id/thread")
    .get(threadController.getThreadsByAssistantId);

export default router;
