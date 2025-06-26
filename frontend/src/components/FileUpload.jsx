import { useState } from "react";
import * as XLSX from "xlsx";

const FileUpload = ({ onDataParsed }) => {
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      onDataParsed(json, file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="my-4">
      <label className="block font-medium text-gray-700 mb-2">Upload Excel File:</label>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
        className="block w-full text-sm text-gray-600 bg-white border rounded-lg shadow-sm p-2"
      />
      {fileName && <p className="mt-2 text-sm text-gray-500">Selected: {fileName}</p>}
    </div>
  );
};

export default FileUpload;
