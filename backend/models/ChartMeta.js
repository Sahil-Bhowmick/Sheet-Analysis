// // models/ChartMeta.js
// import mongoose from "mongoose";

// const chartMetaSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     chartType: String,
//     xKey: String,
//     yKey: String,
//     title: String,
//   },
//   { timestamps: true }
// );

// export default mongoose.model("ChartMeta", chartMetaSchema);

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
    data: {
      type: [Object], // store parsed Excel data array
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChartMeta", chartMetaSchema);
