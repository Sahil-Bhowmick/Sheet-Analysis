// backend/routes/adminRoutes.js
import express from "express";
import {
  getAllUsers,
  updateUserRole,
  toggleUserBlock,
  getPlatformStats,
} from "../controllers/adminController.js";
import { verifyToken, checkAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Admin-protected routes
router.get("/users", verifyToken, checkAdmin, getAllUsers);
router.put("/user/:id/role", verifyToken, checkAdmin, updateUserRole);
router.put("/user/:id/block", verifyToken, checkAdmin, toggleUserBlock);
router.get("/stats", verifyToken, checkAdmin, getPlatformStats);

export default router;
