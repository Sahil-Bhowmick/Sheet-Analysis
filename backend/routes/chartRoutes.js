import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken } from "../middleware/auth.js";
import {
  handleFileUpload,
  saveChartMetadata,
  updateChartMetadata,
  getUserChartHistory,
  getPinnedCharts,
  deleteChart,
} from "../controllers/chartController.js";

const router = express.Router();

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

// Upload + auto save
router.post("/upload", verifyToken, upload.single("file"), handleFileUpload);

// Save chart manually (isPinned: true or false)
router.post("/charts/save", verifyToken, saveChartMetadata);

// ✅ Update existing chart (after "Generate Analysis")
router.put("/charts/:id", verifyToken, updateChartMetadata);

// Fetch chart history and saved charts
router.get("/charts/history", verifyToken, getUserChartHistory);
router.get("/charts/saved", verifyToken, getPinnedCharts);

// Delete chart
router.delete("/charts/:id", verifyToken, deleteChart);

export default router;
