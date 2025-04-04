import { Router } from "express";
import { runControllers } from "../controllers/runControllers.js";

const router = Router();

router
  .route("/run")
  .post(
    runControllers.getThreadRunStatus,
    runControllers.createMessage,
    runControllers.createRun,
    runControllers.performRun,
    runControllers.getRunResponse
  );

export default router;
