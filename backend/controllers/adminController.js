import User from "../models/User.js";
import ChartMeta from "../models/ChartMeta.js";

// ✅ Get all users (no password)
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

// ✅ Update user role
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const currentUserId = req.user.id;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (id === currentUserId) {
    return res.status(403).json({ message: "You cannot change your own role" });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update role", error: err.message });
  }
};

// ✅ Block or unblock user
export const toggleUserBlock = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  if (id === currentUserId) {
    return res
      .status(403)
      .json({ message: "You cannot block or unblock yourself" });
  }

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

// ✅ Delete user (prevents self)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  if (id === currentUserId) {
    return res
      .status(403)
      .json({ message: "You cannot delete your own account" });
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};

// ✅ Platform statistics
export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalCharts = await ChartMeta.countDocuments();

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
