import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllUsers,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
  getAdminStats,
} from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash,
  FiUserX,
  FiUserCheck,
  FiSearch,
  FiChevronLeft,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import StatCard from "../components/StatCard";
import AdminDashboardSkeleton from "../components/AdminDashboardSkeleton";

const shimmer =
  "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    userId: null,
  });
  const [blockModal, setBlockModal] = useState({
    visible: false,
    userId: null,
    isBlocked: false,
  });

  const USERS_PER_PAGE = 5;

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalCharts: 0,
    mostUsedChartType: "N/A",
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/dashboard");
      return;
    }
    fetchStats();
    fetchUsers();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const res = await getAdminStats();
      setStats(res.data);
    } catch {
      toast.error("Failed to load stats");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data);
      setFilteredUsers(res.data);
      const active = res.data.filter((u) => !u.isBlocked).length;
      const blocked = res.data.length - active;
      setStats((prev) => ({
        ...prev,
        totalUsers: res.data.length,
        activeUsers: active,
        blockedUsers: blocked,
      }));
    } catch {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId) => {
    const currentUserId = localStorage.getItem("userId");
    const user = users.find((u) => u._id === userId);

    if (!user) return;

    if (user._id === currentUserId) {
      toast.error("You cannot modify your own role");
      return;
    }

    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role changed to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const confirmToggleBlock = (userId, isBlocked) => {
    const currentUserId = localStorage.getItem("userId");

    if (userId === currentUserId) {
      toast.error("You cannot block or unblock yourself");
      return;
    }

    setBlockModal({ visible: true, userId, isBlocked });
  };

  const handleToggleBlock = async () => {
    const currentUserId = localStorage.getItem("userId");

    if (blockModal.userId === currentUserId) {
      toast.error("You cannot block or unblock yourself");
      setBlockModal({ visible: false, userId: null, isBlocked: false });
      return;
    }

    try {
      await toggleUserBlock(blockModal.userId);
      toast.success("User status updated");
      fetchUsers();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setBlockModal({ visible: false, userId: null, isBlocked: false });
    }
  };

  const confirmDeleteUser = (userId) => {
    const currentUserId = localStorage.getItem("userId");

    if (userId === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    setDeleteModal({ visible: true, userId });
  };

  const handleDeleteUser = async () => {
    const currentUserId = localStorage.getItem("userId");

    if (deleteModal.userId === currentUserId) {
      toast.error("You cannot delete your own account");
      setDeleteModal({ visible: false, userId: null });
      return;
    }

    try {
      await deleteUser(deleteModal.userId);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleteModal({ visible: false, userId: null });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sorted = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredUsers(sorted);
  };

  const indexOfLast = currentPage * USERS_PER_PAGE;
  const indexOfFirst = indexOfLast - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  // Animation variants for table rows/cards
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-sky-100 to-indigo-200 p-2 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
      >
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-8 border-b bg-white/70">
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent">
              🛠️ Admin Dashboard
            </span>
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 shadow"
          >
            <FiChevronLeft /> Back to Home
          </button>
        </header>

        <section className="px-2 md:px-8 py-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
          >
            <StatCard
              title="👥 Total Users"
              value={stats.totalUsers}
              color="from-blue-500 to-blue-700"
              className="hover:scale-105 transition-transform"
            />
            <StatCard
              title="✅ Active Users"
              value={stats.activeUsers}
              color="from-green-500 to-green-700"
              className="hover:scale-105 transition-transform"
            />
            <StatCard
              title="⛔ Blocked Users"
              value={stats.blockedUsers}
              color="from-red-500 to-red-700"
              className="hover:scale-105 transition-transform"
            />
            <StatCard
              title="📊 Total Uploads"
              value={stats.totalCharts}
              color="from-purple-500 to-purple-700"
              className="hover:scale-105 transition-transform"
            />
            <StatCard
              title="🏆 Most Used Chart"
              value={stats.mostUsedChartType}
              color="from-yellow-400 to-yellow-600"
              className="hover:scale-105 transition-transform"
            />
          </motion.div>

          <div className="w-full md:w-1/2 mx-auto flex items-center gap-2 bg-white rounded-xl shadow px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-400 transition">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-transparent outline-none text-gray-700"
            />
          </div>

          {loading ? (
            <AdminDashboardSkeleton />
          ) : (
            <>
              {/* Desktop Table */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className="hidden md:block overflow-x-auto rounded-xl shadow-lg bg-white mt-4"
                >
                  <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-indigo-100 via-sky-100 to-cyan-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        {["name", "email", "role", "isBlocked"].map((key) => {
                          const isActive = sortConfig.key === key;
                          const isAsc =
                            isActive && sortConfig.direction === "asc";
                          const isDesc =
                            isActive && sortConfig.direction === "desc";

                          return (
                            <th
                              key={key}
                              onClick={() => handleSort(key)}
                              className="px-5 py-4 font-semibold text-indigo-800 text-sm tracking-wide cursor-pointer hover:text-indigo-900 transition-all select-none whitespace-nowrap"
                            >
                              <span className="flex items-center justify-start gap-1.5 group">
                                <span>
                                  {key === "isBlocked"
                                    ? "Status"
                                    : key.charAt(0).toUpperCase() +
                                      key.slice(1)}
                                </span>

                                <span className="flex flex-col text-[11px] leading-none text-gray-400 group-hover:text-indigo-500 transition-all duration-200">
                                  <FiChevronUp
                                    className={`transition-transform duration-200 ${
                                      isAsc
                                        ? "text-indigo-800 scale-110"
                                        : "opacity-50"
                                    }`}
                                  />
                                  <FiChevronDown
                                    className={`-mt-[2px] transition-transform duration-200 ${
                                      isDesc
                                        ? "text-indigo-800 scale-110"
                                        : "opacity-50"
                                    }`}
                                  />
                                </span>
                              </span>
                            </th>
                          );
                        })}
                        <th className="px-5 py-4 text-center font-semibold text-indigo-800 text-sm tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      <AnimatePresence>
                        {currentUsers.map((u) => (
                          <motion.tr
                            key={u._id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="hover:bg-indigo-50 transition"
                          >
                            <td className="px-5 py-4 flex items-center gap-2 whitespace-nowrap">
                              <motion.div
                                whileHover={{ scale: 1.15 }}
                                className="w-8 h-8 bg-gradient-to-br from-indigo-200 to-sky-200 text-indigo-700 rounded-full flex items-center justify-center font-bold uppercase shadow"
                              >
                                {u.name.charAt(0)}
                              </motion.div>
                              <span className="font-semibold">{u.name}</span>
                            </td>
                            <td className="px-5 py-4">{u.email}</td>
                            <td className="px-5 py-4">
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleRoleChange(u._id)}
                                className={`px-3 py-1 text-sm rounded-full font-medium shadow transition ${
                                  u.role === "admin"
                                    ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:bg-red-200"
                                    : "bg-gradient-to-r from-indigo-100 to-sky-100 text-indigo-700 hover:bg-indigo-200"
                                }`}
                              >
                                {u.role === "admin"
                                  ? "Revoke Admin"
                                  : "Make Admin"}
                              </motion.button>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                                  u.isBlocked
                                    ? "bg-gradient-to-r from-red-100 to-red-200 text-red-600"
                                    : "bg-gradient-to-r from-green-100 to-green-200 text-green-600"
                                }`}
                              >
                                {u.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center flex gap-2 justify-center">
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() =>
                                  confirmToggleBlock(u._id, u.isBlocked)
                                }
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow transition ${
                                  u.isBlocked
                                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 hover:bg-green-200"
                                    : "bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                {u.isBlocked ? <FiUserCheck /> : <FiUserX />}
                                {u.isBlocked ? "Unblock" : "Block"}
                              </motion.button>
                              <motion.button
                                aria-label="Delete User"
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => confirmDeleteUser(u._id)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600 shadow transition"
                              >
                                <FiTrash />
                                Delete
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>
              </AnimatePresence>
              {/* Mobile card view */}
              <div className="md:hidden space-y-5 mt-0">
                <AnimatePresence>
                  {currentUsers.map((u) => (
                    <motion.div
                      key={u._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 space-y-4"
                    >
                      {/* Avatar & Info */}
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-sky-200 text-indigo-700 rounded-full flex items-center justify-center font-bold uppercase text-lg shadow-sm"
                        >
                          {u.name.charAt(0)}
                        </motion.div>
                        <div>
                          <p className="font-semibold text-base text-gray-800">
                            {u.name}
                          </p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>

                      {/* Role & Status */}
                      <div className="text-sm space-y-2 px-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">
                            Role:
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleRoleChange(u._id)}
                            className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition ${
                              u.role === "admin"
                                ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:bg-red-200"
                                : "bg-gradient-to-r from-indigo-100 to-sky-100 text-indigo-700 hover:bg-indigo-200"
                            }`}
                          >
                            {u.role === "admin" ? "Revoke Admin" : "Make Admin"}
                          </motion.button>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">
                            Status:
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold transition ${
                              u.isBlocked
                                ? "bg-gradient-to-r from-red-100 to-red-200 text-red-600"
                                : "bg-gradient-to-r from-green-100 to-green-200 text-green-600"
                            }`}
                          >
                            {u.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => confirmToggleBlock(u._id, u.isBlocked)}
                          className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-xl font-medium shadow transition ${
                            u.isBlocked
                              ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 hover:bg-green-200"
                              : "bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {u.isBlocked ? (
                            <FiUserCheck size={14} />
                          ) : (
                            <FiUserX size={14} />
                          )}
                          {u.isBlocked ? "Unblock" : "Block"}
                        </motion.button>

                        <motion.button
                          aria-label="Delete User"
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => confirmDeleteUser(u._id)}
                          className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-xl font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600 shadow transition"
                        >
                          <FiTrash size={14} />
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {filteredUsers.length > USERS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </section>
      </motion.div>
      {/* ❗ Delete Modal */}
      {deleteModal.visible && (
        <Modal
          title="Confirm Deletion"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onCancel={() => setDeleteModal({ visible: false, userId: null })}
          onConfirm={handleDeleteUser}
          confirmText="Confirm Delete"
          confirmColor="red"
        />
      )}

      {/* ❗ Block/Unblock Modal */}
      {blockModal.visible && (
        <Modal
          title={blockModal.isBlocked ? "Unblock User" : "Block User"}
          message={`Are you sure you want to ${
            blockModal.isBlocked ? "unblock" : "block"
          } this user?`}
          onCancel={() =>
            setBlockModal({ visible: false, userId: null, isBlocked: false })
          }
          onConfirm={handleToggleBlock}
          confirmText={blockModal.isBlocked ? "Unblock" : "Block"}
          confirmColor={blockModal.isBlocked ? "green" : "red"}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
