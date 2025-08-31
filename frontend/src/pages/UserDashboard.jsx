import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import FileUpload from "../components/FileUpload";
import ChartRenderer from "../components/ChartRenderer";
import ChartModal from "../components/ChartModal";

import {
  getChartHistory,
  deleteChartById,
  updateChartMetadata,
} from "../services/api";

import {
  FaChartBar,
  FaArrowsAltH,
  FaArrowsAltV,
  FaClock,
  FaEye,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaSearch,
  FaThumbtack,
  FaThList,
  FaTh,
  FaSortAmountDown,
  FaSortAmountUp,
  FaBolt,
  FaDownload,
  FaSyncAlt,
  FaKeyboard,
  FaCube,
} from "react-icons/fa";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const VIEW_GRID = "grid";
const VIEW_LIST = "list";

// small debounce helper
const useDebounced = (value, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

// lightweight skeleton
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200/70 rounded ${className}`} />
);

// compact chip
const Chip = ({ active, children, onClick, title }) => (
  <button
    title={title}
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs border transition shadow-sm ${
      active
        ? "bg-indigo-600 text-white border-indigo-600"
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const UserDashboard = () => {
  // upload state
  const [excelData, setExcelData] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [generated, setGenerated] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileId, setFileId] = useState("");

  // 3D controls
  const [use3D, setUse3D] = useState(false);
  const [zKey, setZKey] = useState("");

  // history state
  const [history, setHistory] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // UI controls
  const [selected, setSelected] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("ud_view") || VIEW_GRID
  );
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(
    () => localStorage.getItem("ud_type") || "all"
  );
  const [sortDir, setSortDir] = useState(
    () => localStorage.getItem("ud_sort") || "desc"
  );
  const [dragIndex, setDragIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const headers = excelData.length ? Object.keys(excelData[0]) : [];
  const searchRef = useRef(null);

  // persist a few prefs
  useEffect(() => localStorage.setItem("ud_view", viewMode), [viewMode]);
  useEffect(() => localStorage.setItem("ud_type", typeFilter), [typeFilter]);
  useEffect(() => localStorage.setItem("ud_sort", sortDir), [sortDir]);
  useEffect(() => localStorage.setItem("ud_use3d", use3D ? "1" : "0"), [use3D]);

  // fetch history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await getChartHistory();
      const hist = res.data.history || [];
      const pinnedList = hist
        .filter((c) => c.isPinned)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const others = hist
        .filter((c) => !c.isPinned)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPinned(pinnedList);
      setHistory(others);
    } catch (err) {
      toast.error("Failed to load chart history");
    } finally {
      setLoadingHistory(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // handle file parsed by child FileUpload
  const handleParsedData = (jsonData, file, chartMeta) => {
    setExcelData(jsonData || []);
    setXKey("");
    setYKey("");
    setChartType("bar");
    setGenerated(false);
    setFileName(file || "");
    setFileId(chartMeta?._id || "");
    setZKey("");
    // gentle focus on axis select if available
    setTimeout(() => {
      const el = document.getElementById("x-axis-select");
      if (el) el.focus();
    }, 50);
  };

  // delete chart
  const confirmDelete = (id) => {
    if (!confirm("Delete this chart? This action cannot be undone.")) return;
    handleDelete(id);
  };
  const handleDelete = async (id) => {
    try {
      await deleteChartById(id);
      setHistory((prev) => prev.filter((c) => c._id !== id));
      setPinned((prev) => prev.filter((c) => c._id !== id));
      toast.success("Chart deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // toggle pin / unpin (saves via updateChartMetadata)
  const togglePin = async (item) => {
    try {
      const newPinned = !item.isPinned;
      await updateChartMetadata(item._id, { isPinned: newPinned });
      if (newPinned) {
        setPinned((p) => [{ ...item, isPinned: true }, ...p]);
        setHistory((h) => h.filter((x) => x._id !== item._id));
        toast.success("Pinned");
      } else {
        setHistory((h) => [{ ...item, isPinned: false }, ...h]);
        setPinned((p) => p.filter((x) => x._id !== item._id));
        toast.success("Unpinned");
      }
    } catch (err) {
      toast.error("Pin/unpin failed");
    }
  };

  // export CSV for a history item's data (assumes item.data exists)
  const exportChartCSV = (item) => {
    const arr = item.data || [];
    if (!arr || !arr.length)
      return toast.info("No data available for this chart");
    const keys = Object.keys(arr[0]);
    const csv = [
      keys.join(","),
      ...arr.map((r) =>
        keys
          .map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${item.fileName || "chart"}-${item._id}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Auto-suggest: pick first numeric pair and set chart
  const autoSuggest = () => {
    if (!excelData || excelData.length === 0)
      return toast.info("Upload a file first");
    const keys = Object.keys(excelData[0] || {});
    let found = null;
    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        if (i === j) continue;
        const xi = keys[i],
          yj = keys[j];
        const yNumeric = excelData.every((r) => !isNaN(Number(r[yj])));
        if (yNumeric) {
          found = { x: xi, y: yj };
          break;
        }
      }
      if (found) break;
    }
    if (!found)
      return toast.info(
        "Couldn't auto-suggest. Try selecting columns manually."
      );
    setXKey(found.x);
    setYKey(found.y);
    const distinctX = new Set(excelData.map((r) => r[found.x])).size;
    setChartType(distinctX <= 10 ? "bar" : "line");
    setGenerated(true);
    toast.success("Auto-suggest applied — review and generate");
  };

  const debouncedQuery = useDebounced(query, 250);

  // Search / Filter / Sort derived list
  const filtered = useMemo(() => {
    return history
      .filter((c) => {
        if (typeFilter !== "all" && c.chartType !== typeFilter) return false;
        if (!debouncedQuery) return true;
        const q = debouncedQuery.toLowerCase();
        return (
          (c.title || "").toLowerCase().includes(q) ||
          (c.fileName || "").toLowerCase().includes(q) ||
          (c.xKey || "").toLowerCase().includes(q) ||
          (c.yKey || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        sortDir === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [history, debouncedQuery, typeFilter, sortDir]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === "g" || e.key === "G") && xKey && yKey) setGenerated(true);
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [xKey, yKey]);

  // helper stats
  const totalCharts = history.length + pinned.length;
  const lastUpload = fileId
    ? format(new Date(), "dd MMM yyyy")
    : history[0]?.createdAt
    ? format(new Date(history[0].createdAt), "dd MMM yyyy")
    : "—";

  // export current upload as CSV
  const exportUploadCSV = () => {
    if (!excelData || !excelData.length)
      return toast.info("No upload to export");
    const keys = Object.keys(excelData[0]);
    const csv = [
      keys.join(","),
      ...excelData.map((r) =>
        keys
          .map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName || "upload"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // small utility: show only first N pinned in the carousel to avoid overflow
  const visiblePinned = pinned.slice(0, 8);

  // quick refresh
  const forceRefresh = () => setRefreshKey((k) => k + 1);

  // numeric columns helper for Z-axis choices
  const numericColumns = useMemo(() => {
    if (!Array.isArray(excelData) || excelData.length === 0) return [];
    const sample = excelData[0];
    return Object.keys(sample).filter((k) =>
      excelData.every((r) => r[k] == null || !Number.isNaN(Number(r[k])))
    );
  }, [excelData]);

  // if zKey not set and numericColumns has unused numeric, auto-populate a sensible default
  useEffect(() => {
    if (!zKey && numericColumns.length > 0) {
      const candidates = numericColumns.filter((c) => c !== xKey && c !== yKey);
      setZKey(candidates[0] || numericColumns[0]);
    }
  }, [numericColumns, xKey, yKey, zKey]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Excel Analytics
            </h1>
            <p className="mt-2 text-white/90 max-w-2xl text-sm sm:text-base">
              Upload spreadsheets, build interactive charts, pin favorites, and
              manage your history — fast.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <Chip
                title="Keyboard Shortcuts (? )"
                onClick={() => setShowShortcuts(true)}
              >
                <span className="inline-flex items-center gap-2">
                  <FaKeyboard /> Shortcuts
                </span>
              </Chip>
              <Chip title="Refresh data" onClick={forceRefresh}>
                <span className="inline-flex items-center gap-2">
                  <FaSyncAlt /> Refresh
                </span>
              </Chip>
              <Link
                to="/saved"
                className="px-3 py-1.5 rounded-full text-xs bg-white text-indigo-700 font-medium shadow-sm hover:bg-white/90 border border-white/50"
              >
                <span className="inline-flex items-center gap-2">
                  <FaThumbtack /> Saved Charts
                </span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-white/20 bg-white/10 backdrop-blur rounded-2xl overflow-hidden">
            <div className="px-5 py-4">
              <div className="text-xs text-white/80">Total</div>
              <div className="text-2xl font-semibold">{totalCharts}</div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-white/80">Pinned</div>
              <div className="text-2xl font-semibold">{pinned.length}</div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-white/80">Last</div>
              <div className="text-lg font-medium">{lastUpload}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload */}
      <section aria-labelledby="upload-section">
        <div className="bg-white/90 shadow-xl rounded-2xl p-5 sm:p-6 backdrop-blur-md">
          <FileUpload onDataParsed={handleParsedData} />

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <button
              onClick={exportUploadCSV}
              className="inline-flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <FaDownload /> Export Upload CSV
            </button>

            <button
              onClick={autoSuggest}
              className="inline-flex items-center gap-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <FaBolt /> Auto-suggest Chart
            </button>

            <div className="text-xs text-gray-500 ml-3">
              Tip: Press{" "}
              <span className="px-2 py-0.5 bg-gray-100 rounded">G</span> to
              generate when both axes are selected
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      {headers.length > 0 && (
        <section
          aria-labelledby="controls-section"
          className="sticky top-3 z-20 mt-4"
        >
          <div className="bg-white/95 border border-gray-100 rounded-2xl shadow-lg p-4 sm:p-5">
            {/* main row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* selects grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                {/* X axis */}
                <div>
                  <label
                    htmlFor="x-axis-select"
                    className="text-sm font-medium text-slate-700 inline-flex items-center gap-2 mb-1"
                  >
                    <FaArrowsAltH className="text-indigo-500" /> X-axis
                  </label>
                  <div className="mt-1 relative">
                    <select
                      id="x-axis-select"
                      value={xKey}
                      onChange={(e) => setXKey(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    >
                      <option value="">— choose —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Y axis */}
                <div>
                  <label
                    htmlFor="y-axis-select"
                    className="text-sm font-medium text-slate-700 inline-flex items-center gap-2 mb-1"
                  >
                    <FaArrowsAltV className="text-indigo-500" /> Y-axis
                  </label>
                  <div className="mt-1">
                    <select
                      id="y-axis-select"
                      value={yKey}
                      onChange={(e) => setYKey(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    >
                      <option value="">— choose —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chart type */}
                <div>
                  <label
                    htmlFor="chart-type-select"
                    className="text-sm font-medium text-slate-700 inline-flex items-center gap-2 mb-1"
                  >
                    <FaChartBar className="text-indigo-500" /> Chart Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="chart-type-select"
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    >
                      <option value="bar">Bar</option>
                      <option value="horizontalBar">Horizontal Bar</option>
                      <option value="line">Line</option>
                      <option value="pie">Pie</option>
                      <option value="doughnut">Doughnut</option>
                      <option value="radar">Radar</option>
                      <option value="polarArea">Polar Area</option>
                      <option value="scatter">Scatter</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-3 md:mt-6 justify-end sm:mt-0">
                <button
                  onClick={() => setGenerated(true)}
                  disabled={!xKey || !yKey}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                    xKey && yKey
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-200 cursor-not-allowed text-gray-500"
                  }`}
                  aria-disabled={!xKey || !yKey}
                  title={
                    !xKey || !yKey
                      ? "Select both X and Y axes to enable"
                      : "Generate chart"
                  }
                >
                  <FaPlay />
                  <span>Generate</span>
                </button>

                <div className="inline-flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button
                    onClick={() => setViewMode(VIEW_GRID)}
                    title="Grid view"
                    className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-100 transition ${
                      viewMode === VIEW_GRID
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaTh />
                  </button>
                  <button
                    onClick={() => setViewMode(VIEW_LIST)}
                    title="List view"
                    className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-100 transition ${
                      viewMode === VIEW_LIST
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaThList />
                  </button>
                </div>
              </div>
            </div>

            {/* 3D controls */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="inline-flex items-center gap-2 bg-white rounded-full p-1 border border-gray-100">
                <button
                  onClick={() => setUse3D(false)}
                  className={`px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition ${
                    !use3D
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-gray-50"
                  }`}
                  title="2D View"
                >
                  2D
                </button>
                <button
                  onClick={() => setUse3D(true)}
                  className={`px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition ${
                    use3D
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-gray-50"
                  }`}
                  title="3D View"
                >
                  <FaCube className="inline-block mr-1" /> 3D
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">
                  Z-axis (for 3D)
                </label>
                <select
                  value={zKey}
                  onChange={(e) => setZKey(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  disabled={!numericColumns.length}
                  title={
                    numericColumns.length
                      ? "Choose numeric column for Z axis"
                      : "No numeric columns available"
                  }
                >
                  <option value="">(use index)</option>
                  {numericColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="text-sm text-slate-500 hidden sm:block">
                  Tip: 3D works well for <strong>scatter</strong> and{" "}
                  <strong>bar</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Chart Renderer */}
      {generated && fileId && (
        <section>
          <ChartRenderer
            data={excelData}
            xKey={xKey}
            yKey={yKey}
            chartType={chartType}
            onMetaSaved={fetchHistory}
            fileName={fileName}
            fileId={fileId}
            use3D={use3D}
            zKey={zKey || null}
          />
        </section>
      )}

      {/* Pinned Charts Carousel */}
      <section>
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
              Pinned Charts
            </h3>
            <div className="text-sm text-gray-500">{pinned.length} pinned</div>
          </div>

          {loadingHistory ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-2/3 mt-2" />
                  <Skeleton className="h-4 w-1/2 mt-3" />
                </div>
              ))}
            </div>
          ) : pinned.length === 0 ? (
            <div className="py-6 text-sm text-gray-500">
              No pinned charts yet. Pin important charts for quick access.
            </div>
          ) : (
            <div className="mt-3 overflow-x-auto flex gap-3 py-2 scrollbar-hide">
              {visiblePinned.map((p) => (
                <motion.div
                  key={p._id}
                  whileHover={{ y: -4 }}
                  className="min-w-[220px] bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] tracking-wide text-indigo-600 font-semibold uppercase">
                        {p.chartType}
                      </div>
                      <div className="text-sm font-medium">
                        {p.title || `${p.yKey} vs ${p.xKey}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {p.fileName}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => setSelected(p)}
                        title="Preview"
                        className="text-gray-600 hover:text-indigo-600 p-1 rounded"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => togglePin(p)}
                        title="Unpin"
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded"
                      >
                        <FaThumbtack />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-400">
                      {format(new Date(p.createdAt), "dd MMM yyyy")}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportChartCSV(p)}
                        className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => setSelected(p)}
                        className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {pinned.length > visiblePinned.length && (
                <div className="min-w-[220px] flex items-center justify-center text-sm text-gray-500">
                  +{pinned.length - visiblePinned.length} more
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Chart History Panel */}
      <section>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
              📂 Chart History
            </h3>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative w-64">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search charts ( / )"
                  className="pl-10 pr-3 py-2 rounded-xl bg-gray-50/70 shadow-inner w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <FaSearch />
                </div>
              </div>

              <Chip
                active={typeFilter === "all"}
                onClick={() => setTypeFilter("all")}
              >
                All
              </Chip>
              {["bar", "line", "pie", "scatter"].map((t) => (
                <Chip
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </Chip>
              ))}

              <button
                onClick={() =>
                  setSortDir((s) => (s === "desc" ? "asc" : "desc"))
                }
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                {sortDir === "desc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
              </button>
            </div>
          </div>

          {/* Scrollable history list */}
          <div
            className={`mt-6 transition-all duration-300 ${
              showHistory
                ? "max-h-[600px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <div className="text-2xl mb-2">🗂️</div>
                No charts match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 overflow-y-auto max-h-[600px] pr-2 custom-scroll">
                {filtered.map((item) => (
                  <motion.div
                    key={item._id}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl p-5 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-[10px] uppercase text-indigo-500 font-semibold tracking-wide">
                        {item.chartType}
                      </div>
                      <div className="font-medium text-gray-800 mt-1">
                        {item.title || `${item.yKey} vs ${item.xKey}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.fileName}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <FaClock />{" "}
                        {format(new Date(item.createdAt), "dd MMM, hh:mm a")}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => togglePin(item)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                          <FaThumbtack />
                        </button>
                        <button
                          onClick={() => exportChartCSV(item)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => confirmDelete(item._id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shortcuts modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowShortcuts(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h4 className="text-lg font-semibold text-indigo-700">
                Keyboard Shortcuts
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>
                  <span className="font-mono px-2 py-0.5 bg-gray-100 rounded">
                    G
                  </span>{" "}
                  Generate chart (when X and Y are selected)
                </li>
                <li>
                  <span className="font-mono px-2 py-0.5 bg-gray-100 rounded">
                    /
                  </span>{" "}
                  Focus search
                </li>
                <li>
                  <span className="font-mono px-2 py-0.5 bg-gray-100 rounded">
                    ?
                  </span>{" "}
                  Toggle this help
                </li>
              </ul>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChartModal
        selectedChart={selected}
        show={!!selected}
        onClose={() => setSelected(null)}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
};

export default UserDashboard;
