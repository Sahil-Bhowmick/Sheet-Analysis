// connection/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 MongoDB connection error: ${error.message}`);

    // Optional: Retry logic
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }

  // Optional: Mongoose connection event listeners
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    connectDB(); // Reconnect on disconnection
  });
};

export default connectDB;
