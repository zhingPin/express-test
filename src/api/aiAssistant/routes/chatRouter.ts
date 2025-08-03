import { Router } from "express";
import { getRunControllers } from "../controllers/chat/assistantResponseController.js";
import { runControllers_v1 } from "../controllers/chat/chat_v1.js";
import { runControllers_v2 } from "../controllers/chat/chat_v2.js";

const router = Router();



router.post("/:id/runs",
    runControllers_v1.getThreadRunStatus2,
    runControllers_v1.getAssistantResponse2,
    runControllers_v1.createMessage2,
    runControllers_v1.createRun2,
    runControllers_v1.performRun2
);



router.post(
    "/:id/send",
    runControllers_v2.getThreadRunStatusTest,
    runControllers_v2.createMessageTest,
);

router.get("/:id/chunks", getRunControllers.getAssistantChunk);

export default router;
