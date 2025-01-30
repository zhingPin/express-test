// assistantRouter.ts
import { getAllAssistants, getAssistant, createAssistant, } from "../controllers/assistantController.js";
import { Router } from "express";
const router = Router();
const assistantController = { getAllAssistants, getAssistant, createAssistant };
// Get all assistants
router
    .route("/")
    .get(assistantController.getAllAssistants)
    .post(assistantController.createAssistant);
// Get a specific assistant by ID
// router.route("/:assistantId").get(assistantController.getAssistant);
// // Add more routes if necessary, like updating or deleting an assistant
// router.route("/updateassistant").patch(assistantController.updateAssistant);
export default router;
