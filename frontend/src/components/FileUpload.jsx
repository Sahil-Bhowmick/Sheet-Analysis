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
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setParsed(false);

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

      const res = await uploadFile(formData); // backend auto-saves chart
      const { data, chart } = res.data;

      onDataParsed(data, file.name, chart); // pass chart to UserDashboard
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
    <div className="w-full max-w-2xl mx-auto rounded-2xl p-6 shadow-xl bg-white/60 backdrop-blur-md border border-gray-300">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-700 flex justify-center items-center gap-2">
          <FaCloudUploadAlt className="text-3xl" />
          Upload Excel File
        </h2>
        <p className="text-sm text-gray-600">
          Drag & drop or click to select (.xlsx / .xls)
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current.click()}
        className="group cursor-pointer border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition rounded-xl p-8 text-center"
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

      {error && (
        <p className="mt-3 text-center text-sm text-red-500">{error}</p>
      )}

      {loading && (
        <div className="mt-4 flex justify-center items-center gap-2 text-indigo-600 text-sm animate-pulse">
          <ImSpinner2 className="animate-spin text-lg" />
          Uploading & parsing...
        </div>
      )}

      {parsed && !loading && (
        <div className="mt-4 flex justify-center items-center gap-2 text-green-600 text-sm">
          <FaCheckCircle />
          File uploaded & saved successfully!
        </div>
      )}
    </div>
  );
};

export default FileUpload;
