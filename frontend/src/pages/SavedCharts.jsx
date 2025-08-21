import { useEffect, useState, useCallback } from "react";
import { getSavedCharts, deleteChartById } from "../services/api";
import ChartRenderer from "../components/ChartRenderer";
import Modal from "react-modal";
import {
  FaEye,
  FaTrashAlt,
  FaChartBar,
  FaClock,
  FaSpinner,
  FaRedo,
} from "react-icons/fa";
import { format } from "date-fns";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

const SkeletonCard = () => (
  <div className="rounded-xl p-6 bg-gray-100/60 dark:bg-slate-800/50 animate-pulse h-44 flex flex-col justify-between">
    <div className="h-6 w-32 bg-gray-200/70 rounded-md mb-2" />
    <div className="h-4 w-40 bg-gray-200/70 rounded-md mb-1" />
    <div className="h-4 w-20 bg-gray-200/70 rounded-md" />
    <div className="h-6 w-24 bg-gray-200/70 rounded-md self-end" />
  </div>
);

const SavedCharts = () => {
  const [charts, setCharts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSaved = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSavedCharts();
      // Accept multiple shapes returned by API
      const saved =
        res?.data?.saved || res?.data?.savedCharts || res?.data || [];
      setCharts(Array.isArray(saved) ? saved : []);
    } catch (err) {
      console.error("loadSaved error:", err);
      toast.error("Failed to load saved charts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();

    const onSaved = (e) => {
      // If API returned saved chart in event detail, optimistically prepend it
      if (e?.detail && e.detail._id) {
        setCharts((prev) => {
          const exists = prev.some((c) => c._id && c._id === e.detail._id);
          if (exists) return prev;
          return [e.detail, ...prev];
        });
      } else {
        // fallback: reload from server if no detail
        loadSaved();
      }
      toast.success("Saved charts updated");
    };

    window.addEventListener("chart:saved", onSaved);
    return () => {
      window.removeEventListener("chart:saved", onSaved);
    };
  }, [loadSaved]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete saved chart?")) return;
    try {
      await deleteChartById(id);
      setCharts((prev) => prev.filter((c) => c._id !== id));
      toast.success("Chart deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-4xl font-extrabold text-indigo-700">
          📌 Saved Charts
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSaved}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            title="Refresh"
          >
            <FaRedo className={`${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Empty state / Loading / Grid */}
      {loading ? (
        // Skeleton grid while loading
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : charts.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No saved charts yet. Click "Save Chart" on the dashboard to pin a
          chart here.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {charts.map((item) => (
            <div
              key={item._id}
              className="bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl p-6 flex flex-col transition-transform hover:scale-[1.02]"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-indigo-600 font-bold text-lg flex items-center gap-2">
                  <FaChartBar />
                  <span className="uppercase">
                    {item.chartType?.toString?.() ?? "CHART"}
                  </span>
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
                    onClick={() => handleDelete(item._id)}
                    className="hover:text-red-600 transition"
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-2">
                <div>
                  <span className="text-gray-500">X:</span>{" "}
                  <strong>{item.xKey ?? "—"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Y:</span>{" "}
                  <strong>{item.yKey ?? "—"}</strong>
                </div>
              </div>

              <div className="italic text-sm text-gray-600 mb-2 line-clamp-2">
                🧠 {item.title ?? `${item.yKey} vs ${item.xKey}`}
              </div>

              <div className="mt-auto text-xs text-gray-400 flex items-center gap-2">
                <FaClock />
                <span>
                  {item.createdAt
                    ? format(new Date(item.createdAt), "dd MMM yyyy • hh:mm a")
                    : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to preview chart */}
      <Modal
        isOpen={!!selected}
        onRequestClose={() => setSelected(null)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        className="bg-white max-w-4xl w-[90%] rounded-lg shadow-2xl p-6 outline-none overflow-auto max-h-[90vh]"
      >
        {selected && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-indigo-700 font-bold mb-4">
                {selected.title || `${selected.yKey} vs ${selected.xKey}`}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              {selected.data && selected.data.length > 0 ? (
                <ChartRenderer
                  chartType={selected.chartType}
                  xKey={selected.xKey}
                  yKey={selected.yKey}
                  data={selected.data}
                />
              ) : (
                <div className="flex items-center justify-center p-10 border rounded-md">
                  <FaSpinner className="animate-spin mr-3" />
                  <span className="text-sm text-gray-600">
                    Chart data unavailable or still loading.
                  </span>
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SavedCharts;
