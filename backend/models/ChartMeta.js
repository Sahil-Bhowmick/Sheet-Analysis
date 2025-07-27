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
    fileName: String,
    isPinned: {
      type: Boolean,
      default: false,
    },
    data: {
      type: [Object],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChartMeta", chartMetaSchema);
