import { useEffect, useState } from "react";
import { getChartHistory, deleteChartById } from "../services/api";
import { format } from "date-fns";
import Modal from "react-modal";
import ChartRenderer from "../components/ChartRenderer";
import {
  FaChartBar,
  FaFileAlt,
  FaClock,
  FaEye,
  FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete chart?")) return;
    try {
      await deleteChartById(id);
      setHistory((h) => h.filter((c) => c._id !== id));
      toast.success("Chart deleted");
    } catch (e) {
      toast.error("Delete failed");
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
                    onClick={() => handleDelete(item._id)}
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

      {/* Modal Chart Preview */}
      <Modal
        isOpen={!!selected}
        onRequestClose={() => setSelected(null)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        className="bg-white max-w-4xl w-[90%] rounded-lg shadow-2xl p-6 outline-none overflow-auto max-h-[90vh]"
      >
        {selected && (
          <div className="w-full">
            <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-6">
              {selected.title || `${selected.yKey} vs ${selected.xKey}`}
            </h2>

            <div className="w-full max-w-3xl mx-auto px-2 overflow-x-auto">
              <ChartRenderer
                chartType={selected.chartType}
                xKey={selected.xKey}
                yKey={selected.yKey}
                data={selected.data}
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => setSelected(null)}
                className="mt-6 bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-md text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default History;
