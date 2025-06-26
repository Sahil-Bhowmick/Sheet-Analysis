import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken } from "../middleware/auth.js";
import {
  handleFileUpload,
  saveChartMetadata,
  getUserChartHistory,
} from "../controllers/chartController.js";

const router = express.Router();

// Multer memory storage config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (![".xls", ".xlsx", ".csv"].includes(ext)) {
      return cb(new Error("Only Excel files are allowed"));
    }
    cb(null, true);
  },
});

// ✅ API Routes (standardized)
router.post("/upload", verifyToken, upload.single("file"), handleFileUpload);
router.post("/charts/save", verifyToken, saveChartMetadata); // ✅ match frontend
router.get("/charts/history", verifyToken, getUserChartHistory); // ✅ match frontend

export default router;
