import { useState, useRef, useMemo } from "react";
import { uploadFile } from "../services/api";
import { FaCloudUploadAlt, FaCheckCircle, FaTimes } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

const MAX_SIZE_MB = 25;

const FileUpload = ({ onDataParsed }) => {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [error, setError] = useState("");
  const [showFullData, setShowFullData] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef(null);

  const rowLimit = showFullData
    ? previewData.length
    : Math.min(200, previewData.length);

  const humanSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setParsed(false);
    setPreviewData([]);
    setPreviewHeaders([]);

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setFileName("");
      return setError("Only .xlsx or .xls files are allowed.");
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileName("");
      return setError(`File size exceeds ${MAX_SIZE_MB}MB.`);
    }

    setFileName(file.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadFile(formData);
      const { data, chart } = res.data || {};

      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        setPreviewHeaders(headers);
        setPreviewData(data);
      } else {
        setPreviewHeaders([]);
        setPreviewData([]);
      }

      onDataParsed?.(Array.isArray(data) ? data : [], file.name, chart);
      setParsed(true);
    } catch (err) {
      console.error(err);
      setError("Upload or parsing failed. Please try again.");
      setParsed(false);
      setFileName("");
    } finally {
      setLoading(false);
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
    if (fileRef.current) fileRef.current.value = "";
  };

  const previewNotice = useMemo(() => {
    if (!parsed || previewData.length === 0) return "";
    if (showFullData) return `Showing all ${previewData.length} rows.`;
    return `Showing first ${rowLimit} rows (out of ${previewData.length}).`;
  }, [parsed, previewData, showFullData, rowLimit]);

  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6">
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-xl">
        {/* Header */}
        <div className="px-6 pt-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center justify-center gap-2">
            <FaCloudUploadAlt className="text-3xl sm:text-4xl" />
            Upload Excel File
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Drag &amp; drop or click to select (.xlsx / .xls) — max{" "}
            {MAX_SIZE_MB}MB
          </p>
        </div>

        {/* Dropzone */}
        <div className="px-4 sm:px-6 py-6">
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
              if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
            }}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition
              ${
                isDragOver
                  ? "bg-indigo-100 border-indigo-400"
                  : "bg-indigo-50 hover:bg-indigo-100 border-indigo-300"
              }`}
            aria-label="Upload area"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              className="hidden"
            />
            {!fileName ? (
              <div className="text-gray-700">
                <div className="text-sm sm:text-base">
                  Click or drag an Excel file here
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="font-medium truncate max-w-[90%]">
                  📄 {fileName}
                </div>
                <div className="text-xs text-gray-500">
                  {humanSize(fileRef.current?.files?.[0]?.size)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="mt-2 inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <FaTimes /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="mt-4 min-h-[24px] text-center">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading && (
              <div className="flex justify-center items-center gap-2 text-indigo-600 text-sm">
                <ImSpinner2 className="animate-spin text-lg" />
                Uploading &amp; parsing…
              </div>
            )}
            {parsed && !loading && !error && (
              <div className="flex justify-center items-center gap-2 text-green-600 text-sm">
                <FaCheckCircle />
                File uploaded &amp; parsed successfully!
              </div>
            )}
          </div>

          {/* Preview */}
          {parsed && previewData.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  Data Preview
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">{previewNotice}</span>
                  <button
                    onClick={() => setShowFullData((s) => !s)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
                  >
                    {showFullData ? "Show First 200 Rows" : "Show Full Data"}
                  </button>
                </div>
              </div>

              <div className="overflow-auto max-h-[60vh] rounded-xl border shadow-inner">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="sticky top-0 bg-indigo-100 text-xs uppercase font-semibold text-indigo-800">
                    <tr>
                      {previewHeaders.map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 border-b min-w-[140px]"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(showFullData
                      ? previewData
                      : previewData.slice(0, rowLimit)
                    ).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {previewHeaders.map((key) => (
                          <td key={key} className="px-4 py-2 whitespace-nowrap">
                            {row[key]?.toString?.() ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
