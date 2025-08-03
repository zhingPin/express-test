import { createRunControllers } from "../../controllers/newRunControllers/createRunControllers.js";
import { Router } from "express";
import { createRunControllersTest } from "../../controllers/newRunControllers/createRunTest.js";

const router = Router();

// ✅ Create only a new run (used if separating steps manually)
router.post("/:id", createRunControllers.createRun);

// ✅ Preferred: Full cycle — Send message → Create run → Perform run
router.post(
    "/:id/perform",
    createRunControllers.getThreadRunStatus,
    createRunControllers.createMessage,
    createRunControllers.createRun,
);

router.post(
    "/:id/performtest",
    createRunControllersTest.getThreadRunStatusTest,
    createRunControllersTest.createMessageTest,
);


export default router;
