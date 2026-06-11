import express from "express";
import { saveScene, getScene } from "../controllers/sceneController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/scenes/save", requireAuth, saveScene);
router.get("/scenes", requireAuth, getScene);

export default router;