import express from "express";
import {
  getAllUsers,
  updateUserRole,
  toggleUserBlock,
  getPlatformStats,
  deleteUser,
} from "../controllers/adminController.js";

import { verifyToken, checkAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", verifyToken, checkAdmin, getAllUsers);
router.put("/user/:id/role", verifyToken, checkAdmin, updateUserRole);
router.put("/user/:id/block", verifyToken, checkAdmin, toggleUserBlock);
router.delete("/user/:id", verifyToken, checkAdmin, deleteUser);
router.get("/stats", verifyToken, checkAdmin, getPlatformStats);

export default router;
