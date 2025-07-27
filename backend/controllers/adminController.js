// backend/controllers/adminController.js
import User from "../models/User.js";
import ChartMeta from "../models/ChartMeta.js";

// ✅ Get all users (excluding password)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
};

// ✅ Update user role (admin/user)
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    await User.findByIdAndUpdate(id, { role });
    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update role", error: err.message });
  }
};

// ✅ Toggle user block status
export const toggleUserBlock = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update block status", error: err.message });
  }
};

// ✅ Get platform usage statistics
export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalCharts = await ChartMeta.countDocuments();

    // Most used chart type
    const chartStats = await ChartMeta.aggregate([
      { $group: { _id: "$chartType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostUsedChartType = chartStats.length > 0 ? chartStats[0]._id : "N/A";

    res.status(200).json({
      totalUsers,
      blockedUsers,
      totalCharts,
      mostUsedChartType,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch stats", error: err.message });
  }
};
