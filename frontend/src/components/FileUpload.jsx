import { useState, useRef } from "react";
import { uploadFile } from "../services/api";
import { FaCloudUploadAlt, FaCheckCircle } from "react-icons/fa";
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
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setParsed(false);
    setPreviewData([]);
    setPreviewHeaders([]);

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return setError("❌ Only .xlsx or .xls files are allowed.");
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return setError("❌ File size exceeds 25MB.");
    }

    setFileName(file.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadFile(formData);
      const { data, chart } = res.data;

      if (data.length > 0) {
        setPreviewHeaders(Object.keys(data[0]));
        setPreviewData(data);
      }

      onDataParsed(data, file.name, chart);
      setParsed(true);
    } catch (err) {
      console.error(err);
      setError("❌ Upload or parsing failed.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-2xl shadow-xl bg-white/80 backdrop-blur border border-gray-200">
      {/* Upload Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700 flex justify-center items-center gap-2">
          <FaCloudUploadAlt className="text-3xl" />
          Upload Excel File
        </h2>
        <p className="text-sm text-gray-600">
          Drag & drop or click to select (.xlsx / .xls) — max 25MB
        </p>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current.click()}
        className="group cursor-pointer border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition rounded-xl p-10 text-center mb-4"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
          className="hidden"
        />
        <p className="text-sm text-gray-700 group-hover:scale-105 transition">
          {fileName ? (
            <span className="font-medium">📄 {fileName}</span>
          ) : (
            "Click or drag an Excel file here"
          )}
        </p>
      </div>

      {/* Error or Status */}
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      {loading && (
        <div className="flex justify-center items-center gap-2 text-indigo-600 text-sm animate-pulse mt-4">
          <ImSpinner2 className="animate-spin text-lg" />
          Uploading & parsing...
        </div>
      )}
      {parsed && !loading && (
        <div className="flex justify-center items-center gap-2 text-green-600 text-sm mt-4">
          <FaCheckCircle />
          File uploaded & parsed successfully!
        </div>
      )}

      {/* Data Preview */}
      {parsed && previewData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            📊 Data Preview ({showFullData ? "All Rows" : "First 100 Rows"})
          </h3>

          <div className="overflow-auto max-h-[400px] border rounded-lg shadow-inner">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="sticky top-0 bg-indigo-100 text-xs uppercase font-semibold text-indigo-800">
                <tr>
                  {previewHeaders.map((key) => (
                    <th key={key} className="px-4 py-2 border-b">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(showFullData ? previewData : previewData.slice(0, 100)).map(
                  (row, idx) => (
                    <tr key={idx}>
                      {previewHeaders.map((key) => (
                        <td key={key} className="px-4 py-2 whitespace-nowrap">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {!showFullData && (
            <p className="text-sm text-gray-500 mt-1">
              Showing only the first 100 rows for preview.
            </p>
          )}

          {/* Centered Toggle Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowFullData(!showFullData)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
            >
              {showFullData ? "Show Preview Only" : "Show Full Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
