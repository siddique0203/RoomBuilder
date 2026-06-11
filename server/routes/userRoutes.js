import express from "express";

import {
  signup,
  login,
  getCurrentUser,
  logout,
} from "../controllers/userController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logout);

export default router;