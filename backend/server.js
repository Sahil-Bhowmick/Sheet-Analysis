// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./connection/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
