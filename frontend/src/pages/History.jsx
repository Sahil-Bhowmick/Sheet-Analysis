import { useEffect, useState, useCallback } from "react";
import { getChartHistory, deleteChartById } from "../services/api";
import { format } from "date-fns";
import ChartModal from "../components/ChartModal";
import {
  FaChartBar,
  FaFileAlt,
  FaClock,
  FaEye,
  FaTrashAlt,
  FaRedo,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";

const SkeletonHistoryCard = () => (
  <div className="rounded-xl p-6 bg-gray-100/60 dark:bg-slate-800/50 animate-pulse h-44 flex flex-col justify-between">
    <div className="h-6 w-32 bg-gray-200/70 rounded-md mb-2" />
    <div className="h-4 w-40 bg-gray-200/70 rounded-md mb-1" />
    <div className="h-4 w-20 bg-gray-200/70 rounded-md mb-2" />
    <div className="h-6 w-24 bg-gray-200/70 rounded-md self-end" />
  </div>
);

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getChartHistory();
      const payload = res?.data?.history || res?.data || [];
      setHistory(Array.isArray(payload) ? payload : []);
    } catch (e) {
      console.error("load history error:", e);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Refresh when a chart is saved elsewhere
    const onSaved = (e) => {
      // If event has detail and it's a chart object, optimistically prepend it
      if (e?.detail && e.detail._id) {
        setHistory((prev) => {
          const exists = prev.some((c) => c._id && c._id === e.detail._id);
          if (exists) return prev;
          return [e.detail, ...prev];
        });
        toast.success("History updated");
      } else {
        // fallback: reload from server
        load();
      }
    };

    window.addEventListener("chart:saved", onSaved);
    return () => {
      window.removeEventListener("chart:saved", onSaved);
    };
  }, [load]);

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
      console.error("delete failed:", e);
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-4xl font-extrabold text-indigo-700">
          📊 Your Chart History
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            title="Refresh history"
          >
            <FaRedo className={`${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonHistoryCard key={i} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No charts found. Upload and save a chart to see history.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl p-6 flex flex-col transition-transform hover:scale-[1.015]"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-indigo-600 font-bold text-lg flex items-center gap-2">
                  <FaChartBar />
                  <span className="uppercase">{item.chartType ?? "CHART"}</span>
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
                X: <strong>{item.xKey ?? "—"}</strong>
                <br />
                Y: <strong>{item.yKey ?? "—"}</strong>
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
                {item.createdAt
                  ? format(new Date(item.createdAt), "dd MMM yyyy • hh:mm a")
                  : "—"}
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

      {/* small bottom loader when network is slow */}
      {loading && (
        <div className="fixed bottom-6 right-6 bg-white/90 text-sm rounded-full px-4 py-2 shadow flex items-center gap-2 z-40">
          <FaSpinner className="animate-spin" />
          Loading history...
        </div>
      )}
    </div>
  );
};

export default History;
