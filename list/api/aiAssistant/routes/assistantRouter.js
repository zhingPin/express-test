import { Router } from "express";
import { assistantControllers } from "../controllers/assistantControllers.js";
const router = Router();
// // Get single assistants
router.route("/:id").get(assistantControllers.getAssistant);
// // Get all assistants
router
    .route("/")
    .get(assistantControllers.getAllAssistants);
router
    .route("/:id")
    .get(assistantControllers.getAssistant);
//   .post(assistantControllers.createAssistants);
// router.post(
//     "/",
//       assistantControllers.createAssistants
// );
export default router;
