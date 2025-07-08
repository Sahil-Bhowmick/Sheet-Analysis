import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import ChartRenderer from "../components/ChartRenderer";
import { getChartHistory, deleteChartById } from "../services/api";
import {
  FaChartBar,
  FaArrowsAltH,
  FaArrowsAltV,
  FaClock,
  FaFileAlt,
  FaEye,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
} from "react-icons/fa";
import { format } from "date-fns";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

const UserDashboard = () => {
  const [excelData, setExcelData] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [generated, setGenerated] = useState(false);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getChartHistory();
      setHistory(res.data.history);
    } catch (err) {
      toast.error("Failed to load chart history");
    }
  };

  const handleParsedData = (jsonData, file) => {
    setExcelData(jsonData);
    setXKey("");
    setYKey("");
    setChartType("bar");
    setGenerated(false);
    setFileName(file);
  };

  const confirmDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteChartById(deleteTargetId);
      setHistory((prev) => prev.filter((c) => c._id !== deleteTargetId));
      toast.success("Chart deleted");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const headers = excelData.length ? Object.keys(excelData[0]) : [];
  const recentHistory = history.slice(-3).reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <h1 className="text-4xl font-bold text-center text-indigo-700">
        📈 Excel Analytics Dashboard
      </h1>

      {/* Upload */}
      <div className="bg-white/70 shadow-xl rounded-xl p-6 backdrop-blur">
        <FileUpload onDataParsed={handleParsedData} />
      </div>

      {/* Axis Selector */}
      {headers.length > 0 && (
        <div className="bg-white/90 shadow-xl rounded-2xl p-6 grid sm:grid-cols-3 gap-6 border border-gray-200">
          <div className="relative">
            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <FaArrowsAltH className="text-indigo-500" />
              Select X-Axis
            </label>
            <select
              value={xKey}
              onChange={(e) => setXKey(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-sm"
            >
              <option value="">-- Choose column --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <FaArrowsAltV className="text-indigo-500" />
              Select Y-Axis
            </label>
            <select
              value={yKey}
              onChange={(e) => setYKey(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-sm"
            >
              <option value="">-- Choose column --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <FaChartBar className="text-indigo-500" />
              Chart Type
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-sm"
            >
              <option value="bar">Bar Chart</option>
              <option value="horizontalBar">Horizontal Bar</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="radar">Radar Chart</option>
              <option value="polarArea">Polar Area</option>
              <option value="scatter">Scatter Chart</option>
            </select>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {xKey && yKey && chartType && (
        <div className="text-center">
          <button
            onClick={() => setGenerated(true)}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <FaPlay /> Generate Analysis
          </button>
        </div>
      )}

      {/* Chart Renderer */}
      {generated && (
        <ChartRenderer
          data={excelData}
          xKey={xKey}
          yKey={yKey}
          chartType={chartType}
          onMetaSaved={fetchHistory}
        />
      )}

      {/* Chart History */}
      <div className="bg-white/30 backdrop-blur border border-gray-200 shadow-xl rounded-xl overflow-hidden transition-all duration-500">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
            📂 Chart History
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-indigo-600 hover:text-indigo-800 transition-transform transform"
          >
            {showHistory ? (
              <FaChevronUp className="text-lg" />
            ) : (
              <FaChevronDown className="text-lg" />
            )}
          </button>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showHistory ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No chart history yet.</p>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recentHistory.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white border border-gray-100 shadow-md rounded-lg p-5 flex flex-col transition hover:shadow-lg hover:-translate-y-1 duration-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-indigo-600 font-semibold text-sm flex items-center gap-2">
                          <FaChartBar />
                          {item.chartType.toUpperCase()}
                        </div>
                        <div className="flex gap-3 text-gray-500 text-sm">
                          <button
                            onClick={() => setSelected(item)}
                            title="View Chart"
                            className="hover:text-indigo-600 transition"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => confirmDelete(item._id)}
                            title="Delete Chart"
                            className="hover:text-red-600 transition"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 mb-1">
                        X: <strong>{item.xKey}</strong> | Y:{" "}
                        <strong>{item.yKey}</strong>
                      </div>

                      {item.title && (
                        <p className="italic text-xs text-gray-600 mb-1 truncate">
                          🧠 {item.title}
                        </p>
                      )}

                      {item.fileName && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mb-1 truncate">
                          <FaFileAlt /> {item.fileName}
                        </div>
                      )}

                      <div className="mt-auto text-xs text-gray-400 flex items-center gap-1">
                        <FaClock />
                        {format(
                          new Date(item.createdAt),
                          "dd MMM yyyy • hh:mm a"
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {history.length > 3 && (
                  <div className="text-center mt-6">
                    <Link
                      to="/history"
                      className="inline-block text-indigo-600 font-medium hover:underline text-sm"
                    >
                      View All Charts →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart Preview Modal */}
      <Modal
        isOpen={!!selected}
        onRequestClose={() => setSelected(null)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h3 className="text-lg font-semibold text-red-600 mb-4">
          Are you sure you want to delete this chart?
        </h3>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserDashboard;
