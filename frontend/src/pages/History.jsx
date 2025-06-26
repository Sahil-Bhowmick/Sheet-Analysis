// src/pages/History.jsx
import { useEffect, useState } from "react";
import { getChartHistory } from "../services/api";
import { format } from "date-fns";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getChartHistory();
        setHistory(res.data.history); // Ensure this is correct from backend
      } catch (err) {
        console.error("Error fetching history", err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 py-10 space-y-8">
      <h2 className="text-3xl font-bold text-center text-indigo-700">
        📁 Your Full Chart History
      </h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-500">No chart history found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-white border-l-4 border-indigo-500 shadow-md p-5 rounded-lg transition hover:shadow-lg"
            >
              <p className="font-bold text-indigo-600 mb-1">
                {item.chartType.toUpperCase()} Chart
              </p>
              <p className="text-sm text-gray-800">
                X: <strong>{item.xKey}</strong> &nbsp;|&nbsp; Y:{" "}
                <strong>{item.yKey}</strong>
              </p>
              {item.fileName && (
                <p className="text-sm text-gray-500">
                  📄 File: <span className="italic">{item.fileName}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                📅 {format(new Date(item.createdAt), "PPpp")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
