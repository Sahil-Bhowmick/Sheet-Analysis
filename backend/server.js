// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./connection/db.js"; // ✅ DB connection utility

// Route imports
import authRoutes from "./routes/authRoutes.js";
import chartRoutes from "./routes/chartRoutes.js"; // ✅ NEW: Chart & Upload Routes
import aiRoutes from "./routes/ai.js";

dotenv.config(); // Load env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", chartRoutes);
app.use("/api/ai", aiRoutes);

// Test root
app.get("/", (req, res) => {
  res.send("📊 Excel Analytics API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
