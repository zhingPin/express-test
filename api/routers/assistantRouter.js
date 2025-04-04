// assistantRouter.ts
import { assistantController } from "../controllers/assistantControllers.js";
import { Router } from "express";
import { threadController } from "../controllers/threadControllers.js";
import { messageController } from "../controllers/messageControllers.js";
import { runControllers } from "../controllers/runControllers.js";
import { runControllers2 } from "../controllers/runControllers2.js";
const router = Router();

// Get single assistants
router.route("/:id").get(assistantController.getAssistant);

// Get all assistants
router
  .route("/")
  .get(assistantController.getAllAssistants)
  .post(assistantController.createAssistants);

router
  .route("/:id/thread")
  .post(threadController.createThread)
  .get(threadController.getThreadsByAssistantId);

router
  .route("/thread/:id/messages")
  .post(messageController.createMessages)
  .get(threadController.getThreadWithMessages);

router
  .route("/runs/:id")
  .post(
    runControllers.getThreadRunStatus,
    runControllers.createMessage,
    runControllers.createRun,
    runControllers.performRun,
    runControllers.getRunResponse
  );

router
  .route("/runs2/:id")
  .post(
    runControllers2.getThreadRunStatus2,
    runControllers2.getAssistantResponse2,
    runControllers2.createMessage2,
    runControllers2.createRun2,
    runControllers2.performRun2
  );

// router.route("/check-run-status").get(runControllers2.checkRunStatus);

export default router;
