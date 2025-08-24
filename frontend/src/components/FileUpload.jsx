import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { uploadFile } from "../services/api";
import {
  FaCloudUploadAlt,
  FaCheckCircle,
  FaTimes,
  FaSearch,
  FaCopy,
  FaHistory,
  FaTrashAlt,
  FaDownload,
  FaRegCopy,
  FaSpinner,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

// allow up to 100 MB
const MAX_SIZE_MB = 100;
const storageKey = "sheet_analysis_recent_uploads_v2";

/* ---------- small helpers ---------- */
const inferType = (val) => {
  if (val === null || val === undefined || val === "") return "empty";
  if (!isNaN(Number(val))) return "number";
  const d = Date.parse(val);
  if (!isNaN(d)) return "date";
  return "string";
};

const humanSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

function useDebounce(value, ms = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* ---------- component ---------- */
export default function FileUpload({ onDataParsed }) {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsed, setParsed] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [colTypes, setColTypes] = useState({});
  const [recent, setRecent] = useState([]);
  const [showFullData, setShowFullData] = useState(false);
  const [copied, setCopied] = useState(null); // cell copied timestamp/key

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setRecent(Array.isArray(r) ? r : []);
    } catch (e) {
      setRecent([]);
    }
  }, []);

  // keyboard shortcut: press G to toggle full data
  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === "g" && parsed && previewData.length > 0) {
        setShowFullData((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [parsed, previewData]);

  const saveRecent = (entry) => {
    try {
      const next = [
        entry,
        ...recent.filter((r) => r.fileName !== entry.fileName),
      ].slice(0, 12);
      localStorage.setItem(storageKey, JSON.stringify(next));
      setRecent(next);
    } catch (e) {}
  };

  const toastHint = (msg) => {
    const el = document.createElement("div");
    el.textContent = msg;
    Object.assign(el.style, {
      position: "fixed",
      right: 20,
      bottom: 20,
      background: "#0f172a",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: 10,
      zIndex: 9999,
      boxShadow: "0 8px 30px rgba(2,6,23,0.45)",
      fontFamily:
        "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2300);
  };

  const rowLimit = showFullData
    ? previewData.length
    : Math.min(200, previewData.length);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setParsed(false);
    setPreviewData([]);
    setPreviewHeaders([]);
    setColTypes({});
    setHiddenCols(new Set());

    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setFileName("");
      setError("Only .xlsx, .xls or .csv files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileName("");
      setError(`File size exceeds ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadFile(formData, {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setProgress(pct);
        },
      });

      const { data, chart } = res.data || {};

      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        setPreviewHeaders(headers);
        setPreviewData(data);

        const sample = data.slice(0, 50);
        const types = {};
        headers.forEach((h) => {
          const detected = sample.map((r) => inferType(r[h]));
          const counts = detected.reduce(
            (acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc),
            {}
          );
          const pick = ["number", "date", "string", "empty"].find(
            (t) => counts[t]
          );
          types[h] = pick || "string";
        });
        setColTypes(types);

        saveRecent({
          fileName: file.name,
          size: file.size,
          rows: data.length,
          date: new Date().toISOString(),
        });
      } else {
        setPreviewHeaders([]);
        setPreviewData([]);
      }

      onDataParsed?.(Array.isArray(data) ? data : [], file.name, chart);
      setParsed(true);
      toastHint("File parsed successfully");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Upload or parsing failed.");
      setParsed(false);
      setFileName("");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };
  const onFileChange = (e) => handleFile(e.target.files?.[0]);

  const clearFile = () => {
    setFileName("");
    setParsed(false);
    setPreviewData([]);
    setPreviewHeaders([]);
    setError("");
    setColTypes({});
    setHiddenCols(new Set());
    if (fileRef.current) fileRef.current.value = "";
    toastHint("Cleared file");
  };

  const previewNotice = useMemo(() => {
    if (!parsed || previewData.length === 0) return "";
    if (showFullData) return `Showing all ${previewData.length} rows.`;
    return `Showing first ${rowLimit} rows (of ${previewData.length}).`;
  }, [parsed, previewData, showFullData, rowLimit]);

  const filteredRows = useMemo(() => {
    const rows = showFullData ? previewData : previewData.slice(0, rowLimit);
    if (!debouncedQuery) return rows;
    const q = debouncedQuery.toLowerCase();
    return rows.filter((row) =>
      previewHeaders.some((h) =>
        (row[h] ?? "").toString().toLowerCase().includes(q)
      )
    );
  }, [debouncedQuery, previewData, previewHeaders, showFullData, rowLimit]);

  const toggleCol = (col) => {
    const next = new Set(hiddenCols);
    if (next.has(col)) next.delete(col);
    else next.add(col);
    setHiddenCols(next);
  };

  const downloadSampleCSV = () => {
    if (!previewData.length) return;
    const headers = previewHeaders.join(",");
    const row = previewData[0];
    const vals = previewHeaders
      .map((h) => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`)
      .join(",");
    const csv = headers + "\n" + vals;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample.csv";
    a.click();
    URL.revokeObjectURL(url);
    toastHint("Sample CSV downloaded");
  };

  const removeRecent = (fileNameToRemove) => {
    const next = recent.filter((r) => r.fileName !== fileNameToRemove);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setRecent(next);
    toastHint("Removed from recent");
  };

  const copyCell = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text ?? "");
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
      toastHint("Copied to clipboard");
    } catch {
      toastHint("Unable to copy");
    }
  };

  /* ---------- small UI building blocks ---------- */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-80">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#eef2ff" />
            <stop offset="100%" stopColor="#e9f5ff" />
          </linearGradient>
        </defs>
        <rect
          x="6"
          y="8"
          width="108"
          height="64"
          rx="8"
          fill="url(#g1)"
          stroke="#e6eefc"
        />
        <rect x="20" y="22" width="80" height="6" rx="3" fill="#fff" />
        <rect x="20" y="34" width="52" height="6" rx="3" fill="#fff" />
        <rect x="20" y="46" width="34" height="6" rx="3" fill="#fff" />
      </svg>

      <div className="text-sm text-slate-600">
        No preview yet — upload an Excel / CSV file to get started
      </div>
      <div className="text-xs text-slate-400">
        Supported: .xlsx .xls .csv — up to {MAX_SIZE_MB} MB
      </div>
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
      <style>
        {`
          /* subtle scrollbar */
          .modern-scroll::-webkit-scrollbar { height:8px; width:8px }
          .modern-scroll::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.10); border-radius: 999px }

          /* highlight match */
          .match { background: linear-gradient(90deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06)); padding:0.05rem 0.2rem; border-radius:0.25rem; }
        `}
      </style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left pane */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-gray-100 shadow-md p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center ring-1 ring-indigo-50">
                <FaCloudUploadAlt className="text-indigo-600 text-xl sm:text-2xl" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-semibold text-slate-800 truncate">
                  Upload & preview
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Drag, tap, or select a file — we’ll preview and suggest
                  charts.
                </p>
              </div>
            </div>

            <div
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileRef.current?.click();
              }}
              className={`mt-4 rounded-xl p-3 sm:p-4 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                isDragOver
                  ? "bg-indigo-50 ring-1 ring-indigo-100 border-indigo-200"
                  : "bg-gradient-to-b from-white to-slate-50 border border-gray-100"
              }`}
              style={{
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: isDragOver
                  ? "rgba(99,102,241,0.12)"
                  : "transparent",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onFileChange}
                className="hidden"
              />

              {!fileName ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-sm sm:text-base text-slate-700 font-medium">
                    Drop file here or tap to browse
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">
                    We’ll parse the first sheet and show a live preview
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-sm sm:text-base font-semibold truncate max-w-full">
                    📄 {fileName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {humanSize(fileRef.current?.files?.[0]?.size)}
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition min-h-[36px]"
                      aria-label="Remove file"
                    >
                      <FaTimes /> Remove
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSampleCSV();
                      }}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-gray-50 text-slate-700 hover:bg-gray-100 transition min-h-[36px]"
                      aria-label="Download sample CSV"
                    >
                      <FaCopy /> Sample CSV
                    </button>
                  </div>
                </div>
              )}

              {/* progress */}
              {loading && (
                <div className="mt-3">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 mt-2">
                    <ImSpinner2 className="animate-spin text-indigo-500" />{" "}
                    Uploading — <span className="font-medium">{progress}%</span>
                  </div>
                </div>
              )}

              {/* status */}
              <div className="mt-3 min-h-[32px] text-center">
                {error && <p className="text-sm text-red-600">{error}</p>}
                {!error && !loading && parsed && (
                  <div className="inline-flex items-center gap-2 text-green-600 text-sm">
                    <FaCheckCircle /> File uploaded & parsed
                  </div>
                )}
              </div>
            </div>

            {/* Recent uploads */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700">
                  Recent uploads
                </h4>
                <small className="text-xs text-slate-400">Local</small>
              </div>

              <div className="mt-3 space-y-2 max-h-56 overflow-auto modern-scroll pr-1">
                {recent.length === 0 && (
                  <div className="text-xs text-slate-400">
                    No recent uploads
                  </div>
                )}

                {recent.map((r) => (
                  <div
                    key={r.fileName}
                    className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-100 shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate max-w-[12rem] sm:max-w-[14rem]">
                        {r.fileName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {r.rows} rows • {humanSize(r.size)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFileName(r.fileName);
                          toastHint(
                            "Restored metadata — re-upload file to parse"
                          );
                        }}
                        title="Restore metadata"
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        aria-label={`Restore ${r.fileName}`}
                      >
                        <FaHistory />
                      </button>

                      <button
                        onClick={() => removeRecent(r.fileName)}
                        title="Remove"
                        className="p-2 rounded-md hover:bg-gray-100 text-red-500 transition"
                        aria-label={`Remove ${r.fileName}`}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* mobile-only quick clear */}
          <div className="block md:hidden">
            <button
              onClick={clearFile}
              className="w-full mt-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-gray-50 focus:outline-none"
            >
              Clear Upload
            </button>
          </div>
        </div>

        {/* Right pane */}
        <div className="md:col-span-2">
          <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-gray-100 shadow-md p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                  Data Preview
                </h3>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">
                  {previewNotice || "Upload a file to see a preview"}
                </div>
              </div>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    placeholder="Search rows..."
                    aria-label="Search rows"
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
                </div>

                <button
                  onClick={() => setShowFullData((s) => !s)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition min-h-[44px]"
                  title="Toggle full/preview rows (G)"
                >
                  {showFullData ? "Show First 200" : "Show Full Data"}
                </button>

                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={downloadSampleCSV}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition"
                  >
                    <FaDownload />{" "}
                    <span className="hidden sm:inline">Sample</span>
                  </button>
                  <button
                    onClick={() => (
                      setHiddenCols(new Set()),
                      setQuery(""),
                      toastHint("Reset view")
                    )}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {!parsed && <EmptyState />}

              {parsed && previewData.length > 0 && (
                <>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <div className="text-xs text-slate-500 mr-1">Columns:</div>
                    {previewHeaders.map((h) => {
                      const t = colTypes[h] || "-";
                      const hidden = hiddenCols.has(h);
                      return (
                        <button
                          key={h}
                          onClick={() => toggleCol(h)}
                          className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full transition focus:outline-none focus:ring-2 ${
                            hidden
                              ? "bg-slate-100 text-slate-400 border-gray-100"
                              : "bg-white text-slate-700 border border-gray-200 shadow-sm"
                          }`}
                          title={`Type: ${t}`}
                          aria-pressed={!hidden}
                        >
                          <span className="truncate max-w-[9rem] block">
                            {h}
                          </span>
                          <span
                            className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded ${
                              t === "number"
                                ? "bg-indigo-50 text-indigo-600"
                                : t === "date"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-50 text-slate-500"
                            }`}
                          >
                            {t}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Table area */}
                  <div className="mt-3 overflow-auto max-h-[60vh] rounded-lg border border-gray-100 modern-scroll">
                    <div className="min-w-full">
                      {/* Desktop/tablet table */}
                      <div className="hidden md:block">
                        <table className="min-w-full text-sm text-left text-slate-700">
                          <thead className="sticky top-0 bg-white/95 backdrop-blur-sm text-xs uppercase font-semibold text-slate-600">
                            <tr>
                              {previewHeaders
                                .filter((h) => !hiddenCols.has(h))
                                .map((key) => (
                                  <th
                                    key={key}
                                    className="px-4 py-3 border-b min-w-[140px] text-left"
                                  >
                                    {key}
                                  </th>
                                ))}
                            </tr>
                          </thead>

                          <tbody className="bg-white divide-y divide-gray-100">
                            {filteredRows.map((row, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                {previewHeaders
                                  .filter((h) => !hiddenCols.has(h))
                                  .map((key) => {
                                    const val = row[key] ?? "";
                                    const text = val?.toString?.() ?? "";
                                    const matchIndex = debouncedQuery
                                      ? text
                                          .toLowerCase()
                                          .indexOf(debouncedQuery.toLowerCase())
                                      : -1;
                                    const before =
                                      matchIndex > -1
                                        ? text.slice(0, matchIndex)
                                        : text;
                                    const matched =
                                      matchIndex > -1
                                        ? text.slice(
                                            matchIndex,
                                            matchIndex + debouncedQuery.length
                                          )
                                        : "";
                                    const after =
                                      matchIndex > -1
                                        ? text.slice(
                                            matchIndex + debouncedQuery.length
                                          )
                                        : "";

                                    return (
                                      <td
                                        key={key}
                                        className="px-4 py-2 align-top whitespace-normal max-w-[320px] break-words relative"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="text-sm">
                                            {matchIndex > -1 ? (
                                              <span>
                                                {before}
                                                <span className="match">
                                                  {matched}
                                                </span>
                                                {after}
                                              </span>
                                            ) : (
                                              <span>{text}</span>
                                            )}
                                          </div>

                                          <div className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity ml-2">
                                            <button
                                              onClick={() =>
                                                copyCell(text, `${idx}-${key}`)
                                              }
                                              className="p-1 rounded-md hover:bg-slate-100"
                                              title="Copy cell"
                                              aria-label="Copy cell"
                                            >
                                              <FaRegCopy className="text-xs text-slate-400" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* show copied badge */}
                                        {copied === `${idx}-${key}` && (
                                          <div className="absolute right-3 top-2 text-xs text-emerald-600">
                                            Copied
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile: compact cards */}
                      <div className="md:hidden space-y-2 p-2">
                        {filteredRows.map((row, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-md border border-gray-100 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                {previewHeaders
                                  .filter((h) => !hiddenCols.has(h))
                                  .slice(0, 5)
                                  .map((key) => (
                                    <div
                                      key={key}
                                      className="text-sm text-slate-700 truncate"
                                    >
                                      <span className="font-medium text-slate-600">
                                        {key}:
                                      </span>{" "}
                                      <span>{row[key] ?? ""}</span>
                                    </div>
                                  ))}
                              </div>

                              <div className="flex flex-col gap-2 items-end">
                                <div className="text-xs text-slate-400">
                                  #{idx + 1}
                                </div>
                                <button
                                  onClick={() =>
                                    copyCell(
                                      JSON.stringify(row, null, 2),
                                      `m-${idx}`
                                    )
                                  }
                                  className="text-xs px-2 py-1 rounded bg-gray-50 text-slate-600"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 justify-end">
                    <div className="text-xs text-slate-500 mr-auto">
                      Tip: Click column chips to hide/show columns
                    </div>

                    <button
                      onClick={downloadSampleCSV}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition"
                    >
                      <FaDownload /> Download sample CSV
                    </button>

                    <button
                      onClick={() => {
                        setHiddenCols(new Set());
                        setQuery("");
                        toastHint("Reset view");
                      }}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg transition"
                    >
                      Reset view
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
