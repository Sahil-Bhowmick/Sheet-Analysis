import XLSX from "xlsx";
import ChartMeta from "../models/ChartMeta.js";

// ✅ Auto-save on file upload (as empty chartType)
export const handleFileUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const headers = Object.keys(jsonData[0] || {});
    const numericKeys = headers.filter(
      (key) => typeof jsonData[0][key] === "number"
    );

    if (numericKeys.length < 2) {
      return res.status(400).json({
        message: "File must contain at least two numeric columns",
      });
    }

    const xKey = numericKeys[0];
    const yKey = numericKeys[1];

    const newMeta = new ChartMeta({
      userId: req.userId,
      chartType: "",
      xKey,
      yKey,
      title: `${yKey} vs ${xKey}`,
      data: jsonData,
      fileName: file.originalname,
    });

    await newMeta.save();

    res.status(200).json({
      message: "File parsed and chart saved",
      data: jsonData,
      chart: newMeta,
      fileId: newMeta._id, // Sent to frontend for later update
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// ✅ Save chart (from UI - pinned or not)
export const saveChartMetadata = async (req, res) => {
  try {
    const { chartType, xKey, yKey, title, data, isPinned, fileName } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Chart data required" });
    }

    const meta = new ChartMeta({
      userId: req.userId,
      chartType,
      xKey,
      yKey,
      title,
      fileName,
      isPinned: isPinned || false,
      data,
    });

    await meta.save();
    res.status(201).json({ message: "Chart saved", meta });
  } catch (err) {
    res.status(500).json({ message: "Save failed", error: err.message });
  }
};

// ✅ Update chartType/title of previously saved chart (used after Generate Analysis)
export const updateChartMetadata = async (req, res) => {
  try {
    const chartId = req.params.id;
    const { chartType, xKey, yKey, title, data } = req.body;

    const updated = await ChartMeta.findOneAndUpdate(
      { _id: chartId, userId: req.userId },
      { chartType, xKey, yKey, title, data },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Chart not found" });
    }

    res.status(200).json({ message: "Chart updated", chart: updated });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Get chart history (isPinned: false)
export const getUserChartHistory = async (req, res) => {
  try {
    const history = await ChartMeta.find({
      userId: req.userId,
      isPinned: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({ history });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Fetch history failed", error: err.message });
  }
};

// ✅ Get pinned/saved charts (isPinned: true)
export const getPinnedCharts = async (req, res) => {
  try {
    const savedCharts = await ChartMeta.find({
      userId: req.userId,
      isPinned: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({ savedCharts });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Fetch pinned charts failed", error: err.message });
  }
};

// ✅ Delete chart by ID
export const deleteChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const deleted = await ChartMeta.findOneAndDelete({
      _id: chartId,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Chart not found" });
    }

    res.status(200).json({ message: "Chart deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
