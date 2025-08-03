import { getRunControllers } from "../../controllers/newRunControllers/getRunControllers.js";
import { Router } from "express";

const router = Router();

// Get the latest run status for a thread
router.get("/:id", getRunControllers.getThreadandLatestRunStatus);

// Get the assistant's response chunk for a thread
router.get("/:id/assistant-chunk", getRunControllers.getAssistantChunk);

// Get the assistant's response chunk for a specific thread
// and chunk ID using next() in controller
// router.get("/:id/assistant-chunk/:chunkId", getRunControllers.getAssistantChunk, getRunControllers.getThreadandLatestRunStatus);
export default router;
