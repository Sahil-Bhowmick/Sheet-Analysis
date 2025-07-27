import { useEffect, useState } from "react";
import { getSavedCharts, deleteChartById } from "../services/api";
import ChartRenderer from "../components/ChartRenderer";
import Modal from "react-modal";
import { FaEye, FaTrashAlt, FaChartBar, FaClock } from "react-icons/fa";
import { format } from "date-fns";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

const SavedCharts = () => {
  const [charts, setCharts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      const res = await getSavedCharts();
      setCharts(res.data.saved || []);
    } catch (err) {
      toast.error("Failed to load saved charts");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete saved chart?")) return;
    try {
      await deleteChartById(id);
      setCharts((prev) => prev.filter((c) => c._id !== id));
      toast.success("Chart deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <h2 className="text-4xl font-extrabold text-center text-indigo-700">
        📌 Saved Charts
      </h2>

      {charts.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No saved charts yet. Click "Save Chart" on the dashboard to pin a
          chart here.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {charts.map((item) => (
            <div
              key={item._id}
              className="bg-white/30 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl p-6 flex flex-col transition-transform hover:scale-[1.02]"
            >
              <div className="flex justify-between items-center mb-2">
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
                    onClick={() => handleDelete(item._id)}
                    className="hover:text-red-600 transition"
                    title="Delete"
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

              <div className="italic text-sm text-gray-600 mb-2">
                🧠 {item.title}
              </div>

              <div className="mt-auto text-xs text-gray-400 flex items-center gap-1">
                <FaClock />
                {format(new Date(item.createdAt), "dd MMM yyyy • hh:mm a")}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onRequestClose={() => setSelected(null)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        className="bg-white max-w-4xl w-[90%] rounded-lg shadow-2xl p-6 outline-none overflow-auto max-h-[90vh]"
      >
        {selected && (
          <>
            <h2 className="text-2xl text-center text-indigo-700 font-bold mb-4">
              {selected.title || `${selected.yKey} vs ${selected.xKey}`}
            </h2>
            <ChartRenderer
              chartType={selected.chartType}
              xKey={selected.xKey}
              yKey={selected.yKey}
              data={selected.data}
            />
            <div className="text-center mt-6">
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
