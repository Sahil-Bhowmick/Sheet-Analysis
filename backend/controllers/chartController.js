import XLSX from "xlsx";
import ChartMeta from "../models/ChartMeta.js";

// ✅ 1. Handle Excel File Upload and Parse
// export const handleFileUpload = async (req, res) => {
//   try {
//     const file = req.file;

//     if (!file) return res.status(400).json({ message: "No file uploaded" });

//     const workbook = XLSX.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = XLSX.utils.sheet_to_json(worksheet);

//     return res.status(200).json({ data: jsonData });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Failed to parse Excel file", error: err.message });
//   }
// };
// ✅ Auto-save chart on upload
export const handleFileUpload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Auto-pick first two numeric columns as X and Y
    const headers = Object.keys(jsonData[0] || {});
    const numericKeys = headers.filter(
      (key) => typeof jsonData[0][key] === "number"
    );

    if (numericKeys.length < 2) {
      return res.status(400).json({
        message:
          "File must contain at least two numeric columns for auto-charting",
      });
    }

    const xKey = numericKeys[0];
    const yKey = numericKeys[1];

    const newMeta = new ChartMeta({
      userId: req.userId,
      chartType: "bar", // default chart
      xKey,
      yKey,
      title: `Auto: ${yKey} vs ${xKey}`,
      data: jsonData,
      fileName: file.originalname,
    });

    await newMeta.save();

    return res.status(200).json({
      message: "File parsed and chart auto-saved",
      data: jsonData,
      chart: newMeta,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to parse Excel file",
      error: err.message,
    });
  }
};

// ✅ 2. Save Chart Metadata
export const saveChartMetadata = async (req, res) => {
  try {
    const { chartType, xKey, yKey, title, data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Chart data is required" });
    }

    const meta = new ChartMeta({
      userId: req.userId,
      chartType,
      xKey,
      yKey,
      title,
      data, // ✅ save parsed Excel data
    });

    await meta.save();
    res.status(201).json({ message: "Chart metadata saved", meta });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error saving chart metadata", error: err.message });
  }
};
// ✅ 3. Get User's Chart History

export const getUserChartHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const history = await ChartMeta.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch chart history", error: err.message });
  }
};

// ✅ 4. Delete a chart by ID
export const deleteChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const userId = req.userId;

    const deleted = await ChartMeta.findOneAndDelete({ _id: chartId, userId });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Chart not found or unauthorized" });
    }

    res.status(200).json({ message: "Chart deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete chart", error: err.message });
  }
};
