import XLSX from "xlsx";
import ChartMeta from "../models/ChartMeta.js";

// ✅ 1. Handle Excel File Upload and Parse
export const handleFileUpload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return res.status(200).json({ data: jsonData });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to parse Excel file", error: err.message });
  }
};

// ✅ 2. Save Chart Metadata
export const saveChartMetadata = async (req, res) => {
  try {
    const { chartType, xKey, yKey, title } = req.body;

    const meta = new ChartMeta({
      userId: req.userId, // 🔥 Check this
      chartType,
      xKey,
      yKey,
      title,
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
    res.status(200).json({ history }); // ✅ Wrap in object
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch chart history", error: err.message });
  }
};
