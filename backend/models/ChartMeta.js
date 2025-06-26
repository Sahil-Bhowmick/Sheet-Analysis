// models/ChartMeta.js
import mongoose from "mongoose";

const chartMetaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chartType: String,
    xKey: String,
    yKey: String,
    title: String,
  },
  { timestamps: true }
);

export default mongoose.model("ChartMeta", chartMetaSchema);
