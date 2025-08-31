// routes/aiRoutes.js
import express from "express";
import { generateInsight } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/insight
router.post("/insight", generateInsight);

export default router;
