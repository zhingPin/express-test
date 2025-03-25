// assistantRouter.ts
import { assistantController } from "../controllers/assistantControllers.js";
import { Router } from "express";
import { threadController } from "../controllers/threadControllers.js";
import { messageController } from "../controllers/messageControllers.js";
const router = Router();

// Get all assistants
router
  .route("/")
  .get(assistantController.getAllAssistants)
  .post(assistantController.createAssistants);

router
  .route("/:id/thread")
  .post(threadController.createThread)
  .get(threadController.getThreadWithMessages);

router
  .route("/thread/:id/message")
  .post(messageController.createMessage)
  .get(threadController.getThreadWithMessages);

router
  .route("/thread/:id/messages")
  .post(messageController.createMessages)
  .get(threadController.getThreadWithMessages);

router.route("/:id").get(assistantController.getAssistant);
//   .post(assistantController.createAssistants);
// Get a specific assistant by ID
// router.route("/:assistantId").get(assistantController.getAssistant);
// // Add more routes if necessary, like updating or deleting an assistant
// router.route("/updateassistant").patch(assistantController.updateAssistant);
export default router;
