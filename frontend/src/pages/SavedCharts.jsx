// src/pages/SavedCharts.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { getSavedCharts, deleteChartById } from "../services/api";
import ChartRenderer from "../components/ChartRenderer";
import ChartModal from "../components/ChartModal";
import {
  FaEye,
  FaTrashAlt,
  FaChartBar,
  FaClock,
  FaSpinner,
  FaRedo,
  FaSearch,
  FaTh,
  FaThList,
} from "react-icons/fa";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const VIEW_GRID = "grid";
const VIEW_LIST = "list";

const prettifyChartType = (s) => {
  if (!s) return "Chart";
  const spaced = s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");
  return spaced
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

const SkeletonCard = () => (
  <div className="rounded-2xl p-5 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur border border-gray-100/60 shadow-sm animate-pulse h-36 flex flex-col gap-3">
    <div className="h-4 w-24 bg-gray-200/70 rounded" />
    <div className="h-5 w-2/3 bg-gray-200/70 rounded" />
    <div className="h-4 w-1/2 bg-gray-200/70 rounded" />
    <div className="h-3 w-28 bg-gray-200/70 rounded mt-auto" />
  </div>
);

const Chip = ({ active, children, onClick, title }) => (
  <button
    title={title}
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs transition-shadow ${
      active
        ? "bg-indigo-600 text-white shadow-md"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

export default function SavedCharts() {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);

  // preview + delete modal
  const [selected, setSelected] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // UI
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("saved_view") || VIEW_GRID
  );
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(
    () => localStorage.getItem("saved_type") || "all"
  );
  const [selectedIds, setSelectedIds] = useState(new Set());

  const searchRef = useRef(null);

  useEffect(() => localStorage.setItem("saved_view", viewMode), [viewMode]);
  useEffect(() => localStorage.setItem("saved_type", typeFilter), [typeFilter]);

  const loadSaved = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSavedCharts();
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
      if (e?.detail && e.detail._id) {
        setCharts((prev) => {
          const exists = prev.some((c) => c._id && c._id === e.detail._id);
          if (exists) return prev;
          return [e.detail, ...prev];
        });
      } else {
        loadSaved();
      }
      toast.success("Saved charts updated");
    };
    window.addEventListener("chart:saved", onSaved);
    return () => window.removeEventListener("chart:saved", onSaved);
  }, [loadSaved]);

  // derived list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return charts
      .filter((c) => (typeFilter === "all" ? true : c.chartType === typeFilter))
      .filter((c) =>
        q
          ? (c.title || "").toLowerCase().includes(q) ||
            (c.fileName || "").toLowerCase().includes(q) ||
            (c.xKey || "").toLowerCase().includes(q) ||
            (c.yKey || "").toLowerCase().includes(q)
          : true
      );
  }, [charts, query, typeFilter]);

  const toggleSelect = (id) => {
    setSelectedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  const selectAll = () => setSelectedIds(new Set(filtered.map((c) => c._id)));

  // delete modal handlers
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setItemToDelete(null);
    setShowDeleteModal(false);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) {
      closeDeleteModal();
      return;
    }
    try {
      await deleteChartById(itemToDelete._id);
      setCharts((prev) => prev.filter((c) => c._id !== itemToDelete._id));
      toast.success("Chart deleted");
    } catch (e) {
      console.error("delete failed", e);
      toast.error("Delete failed");
    } finally {
      closeDeleteModal();
    }
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // card renderer
  const renderCard = (item) => {
    const checked = selectedIds.has(item._id);
    const chartTypeLabel = prettifyChartType(item.chartType);

    return (
      <motion.article
        key={item._id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={`group relative overflow-hidden rounded-2xl p-4 shadow-sm transition-transform bg-white/80 backdrop-blur border border-gray-100 hover:shadow-lg hover:-translate-y-1 ${
          viewMode === VIEW_LIST ? "flex items-center gap-4" : ""
        } ${checked ? "ring-2 ring-indigo-400/30" : ""}`}
        aria-labelledby={`saved-${item._id}-title`}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
            checked ? "bg-indigo-400/60" : "bg-transparent"
          }`}
        />

        <div
          className={`flex-shrink-0 h-14 px-3 mb-2 rounded-xl flex items-center justify-center border ${
            checked ? "ring-2 ring-indigo-400" : "border-gray-100"
          } bg-gradient-to-br from-white to-white/60 mr-4`}
          style={{ minWidth: 64 }}
        >
          <span
            className="text-indigo-700 font-semibold tracking-wide text-sm whitespace-nowrap capitalize "
            title={chartTypeLabel}
          >
            {chartTypeLabel}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="text-[10px] tracking-wide text-indigo-600 font-semibold uppercase select-none ">
                {chartTypeLabel}
              </div>

              <h3
                id={`saved-${item._id}-title`}
                className="truncate text-sm font-semibold text-slate-800"
                title={item.title || `${item.yKey} vs ${item.xKey}`}
              >
                {item.title || `${item.yKey || "Y"} vs ${item.xKey || "X"}`}
              </h3>

              <p className="mt-1 truncate text-xs text-slate-500">
                {item.fileName ?? "—"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSelect(item._id)}
                className={`p-2 rounded-md transition hover:bg-gray-100 focus:outline-none ${
                  checked ? "text-indigo-600" : "text-gray-600"
                }`}
                aria-pressed={checked}
                aria-label={checked ? "Unselect chart" : "Select chart"}
                title={checked ? "Unselect" : "Select"}
              >
                {checked ? "✓" : "◻︎"}
              </button>

              <button
                onClick={() => setSelected(item)}
                title="Preview"
                className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                aria-label="Preview chart"
              >
                <FaEye />
              </button>

              <button
                onClick={() => openDeleteModal(item)}
                title="Delete"
                className="p-2 rounded-md hover:bg-red-50 text-red-600 focus:outline-none"
                aria-label="Delete chart"
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50/40 px-2 py-1 text-indigo-700">
              <FaClock className="text-[10px]" />
              {item.createdAt
                ? format(new Date(item.createdAt), "dd MMM yyyy • hh:mm a")
                : "—"}
            </span>

            <span className="px-2 py-1 rounded bg-gray-100 text-xs text-slate-600">
              X:{" "}
              <strong className="ml-1 text-slate-800">
                {item.xKey ?? "—"}
              </strong>
            </span>

            <span className="px-2 py-1 rounded bg-gray-100 text-xs text-slate-600">
              Y:{" "}
              <strong className="ml-1 text-slate-800">
                {item.yKey ?? "—"}
              </strong>
            </span>
          </div>

          <div className="mt-3 italic text-sm text-slate-600 line-clamp-2">
            🧠 {item.title ?? `${item.yKey} vs ${item.xKey}`}
          </div>
        </div>

        {checked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-indigo-400/30"
          />
        )}
      </motion.article>
    );
  };

  // stats
  const total = charts.length;
  const last = charts[0]?.createdAt
    ? format(new Date(charts[0].createdAt), "dd MMM yyyy")
    : "—";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              📌 Saved Charts
            </h2>
            <p className="mt-2 text-white/90 max-w-2xl text-sm sm:text-base">
              Your pinned charts — quick access to charts you care about.
            </p>

            <div className="mt-4 grid grid-cols-3 divide-x divide-white/20 bg-white/10 backdrop-blur rounded-2xl overflow-hidden w-fit">
              <div className="px-5 py-3">
                <div className="text-xs text-white/80">Total</div>
                <div className="text-2xl font-semibold">{total}</div>
              </div>
              <div className="px-5 py-3">
                <div className="text-xs text-white/80">Selected</div>
                <div className="text-2xl font-semibold">{selectedIds.size}</div>
              </div>
              <div className="px-5 py-3">
                <div className="text-xs text-white/80">Last</div>
                <div className="text-lg font-medium">{last}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSaved}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white text-indigo-700 hover:bg-white/90 shadow"
            >
              <FaRedo className={`${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-4 z-20">
        <div className="bg-white/95 rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative w-full sm:w-80">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search saved charts… ( / to focus )"
                className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FaSearch />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Chip
                active={typeFilter === "all"}
                onClick={() => setTypeFilter("all")}
                title="All types"
              >
                All
              </Chip>
              {[
                "bar",
                "line",
                "pie",
                "doughnut",
                "scatter",
                "radar",
                "polarArea",
              ].map((t) => (
                <Chip
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                  title={`Filter ${t}`}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <button
                onClick={() => setViewMode(VIEW_GRID)}
                className={`p-2 rounded ${
                  viewMode === VIEW_GRID
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600"
                }`}
                title="Grid view"
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode(VIEW_LIST)}
                className={`p-2 rounded ${
                  viewMode === VIEW_LIST
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600"
                }`}
                title="List view"
              >
                <FaThList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : charts.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-14">
          <div className="text-5xl mb-2">📌</div>
          <div className="mb-4">No saved charts yet.</div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadSaved}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === VIEW_GRID
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          <AnimatePresence>
            {filtered.map((item) => renderCard(item))}
          </AnimatePresence>
        </div>
      )}

      {/* Chart Modal (preview + delete wired) */}
      <ChartModal
        selectedChart={selected}
        show={!!selected}
        onClose={() => setSelected(null)}
        showDeleteModal={showDeleteModal}
        onDeleteClose={closeDeleteModal}
        onConfirmDelete={confirmDelete}
      />

      {/* small bottom loader */}
      {loading && (
        <div className="fixed bottom-6 right-6 bg-white/90 text-sm rounded-full px-4 py-2 shadow flex items-center gap-2 z-40">
          <FaSpinner className="animate-spin" /> Loading saved charts...
        </div>
      )}
    </div>
  );
}
