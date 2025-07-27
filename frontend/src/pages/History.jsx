import { useEffect, useState } from "react";
import { getChartHistory, deleteChartById } from "../services/api";
import { format } from "date-fns";
import ChartModal from "../components/ChartModal";
import {
  FaChartBar,
  FaFileAlt,
  FaClock,
  FaEye,
  FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getChartHistory();
      setHistory(res.data.history);
    } catch (e) {
      toast.error("Failed to load history");
    }
  };

  const confirmDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteChartById(deleteTargetId);
      setHistory((h) => h.filter((c) => c._id !== deleteTargetId));
      toast.success("Chart deleted");
    } catch (e) {
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <h2 className="text-4xl font-extrabold text-center text-indigo-700">
        📊 Your Chart History
      </h2>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No charts found. Upload and save a chart to see history.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-white/30 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl p-6 flex flex-col transition-transform hover:scale-[1.015]"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-indigo-600 font-bold text-lg flex items-center gap-2">
                  <FaChartBar />
                  {item.chartType.toUpperCase()}
                </div>
                <div className="flex gap-3 text-gray-500 text-sm">
                  <button
                    onClick={() => setSelected(item)}
                    className="hover:text-indigo-600 transition"
                    title="View Chart"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => confirmDelete(item._id)}
                    className="hover:text-red-600 transition"
                    title="Delete Chart"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-2">
                X: <strong>{item.xKey}</strong>
                <br />
                Y: <strong>{item.yKey}</strong>
              </div>

              {item.title && (
                <p className="italic text-sm text-gray-600 mb-1">
                  🧠 {item.title}
                </p>
              )}

              {item.fileName && (
                <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <FaFileAlt /> {item.fileName}
                </div>
              )}

              <div className="mt-auto text-xs text-gray-400 flex items-center gap-1">
                <FaClock />
                {format(new Date(item.createdAt), "dd MMM yyyy • hh:mm a")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Modal */}
      <ChartModal
        selectedChart={selected}
        show={!!selected}
        onClose={() => setSelected(null)}
        showDeleteModal={showDeleteModal}
        onDeleteClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
};

export default History;
