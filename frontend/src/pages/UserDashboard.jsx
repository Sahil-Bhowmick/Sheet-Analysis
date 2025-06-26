import { useState, useEffect, useRef } from "react";
import FileUpload from "../components/FileUpload";
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Line, Pie } from "react-chartjs-2";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
  getChartHistory,
  saveChartMetadata,
  getChartInsight,
} from "../services/api";
import { toast } from "react-toastify";

const ChartMap = { bar: Bar, line: Line, pie: Pie };

const UserDashboard = () => {
  const [excelData, setExcelData] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [title, setTitle] = useState("");
  const [insight, setInsight] = useState("");
  const [history, setHistory] = useState([]);
  const chartRef = useRef();

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

  const handleParsedData = (jsonData) => {
    setExcelData(jsonData);
    setXKey("");
    setYKey("");
    setTitle("");
    setInsight("");
  };

  const downloadPNG = () => {
    if (chartRef.current) {
      toPng(chartRef.current)
        .then((dataUrl) => {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `chart-${Date.now()}.png`;
          a.click();
        })
        .catch((err) => toast.error(err.message));
    }
  };

  const downloadPDF = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current);
        const pdf = new jsPDF("landscape", "pt", [
          chartRef.current.offsetWidth,
          chartRef.current.offsetHeight,
        ]);
        pdf.addImage(dataUrl, "PNG", 0, 0);
        pdf.save(`chart-${Date.now()}.pdf`);
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const generateTitle = () => {
    if (xKey && yKey) {
      return `${yKey} over ${xKey}`;
    }
    return "";
  };

  const handleSaveMeta = async () => {
    try {
      const autoTitle = generateTitle();
      setTitle(autoTitle);

      await saveChartMetadata({ chartType, xKey, yKey, title: autoTitle });
      toast.success("📊 Chart saved to history");
      fetchHistory();
    } catch (err) {
      toast.error("Failed to save chart metadata");
    }
  };

  const generateInsight = async () => {
    try {
      const res = await getChartInsight({
        chartType,
        xKey,
        yKey,
        data: excelData,
      });
      setInsight(res.data.summary);
    } catch (err) {
      toast.error("Failed to generate AI insight");
    }
  };

  const headers = excelData.length ? Object.keys(excelData[0]) : [];
  const ChartComponent = ChartMap[chartType];
  const chartData = {
    labels: excelData.map((d) => d[xKey]),
    datasets: [
      {
        label: yKey,
        data: excelData.map((d) => d[yKey]),
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      <h1 className="text-4xl font-bold text-center text-indigo-700">
        📈 Excel Analytics Dashboard
      </h1>

      <div className="bg-white shadow-md rounded-xl p-6">
        <FileUpload onDataParsed={handleParsedData} />
      </div>

      {headers.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 grid sm:grid-cols-3 gap-4">
          {[
            { label: "X-Axis", value: xKey, setter: setXKey },
            { label: "Y-Axis", value: yKey, setter: setYKey },
          ].map(({ label, value, setter }) => (
            <select
              key={label}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{label}</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          ))}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
        </div>
      )}

      {xKey && yKey && (
        <div className="bg-white shadow-xl rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2">{generateTitle()}</h3>
          <div ref={chartRef} className="bg-gray-50 p-4 rounded-md">
            <ChartComponent data={chartData} options={{ responsive: true }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={downloadPNG}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              ⬇️ PNG
            </button>
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              📄 PDF
            </button>
            <button
              onClick={handleSaveMeta}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              💾 Save
            </button>
            <button
              onClick={generateInsight}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🤖 AI Insight
            </button>
          </div>
          {insight && (
            <div className="mt-4 p-3 bg-blue-50 text-sm border-l-4 border-blue-400 text-blue-800 rounded">
              💡 Insight: {insight}
            </div>
          )}
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          📂 Chart History
        </h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No chart history yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded bg-indigo-50 border-l-4 border-indigo-500 shadow hover:shadow-lg transition"
              >
                <p className="font-semibold">{item.chartType.toUpperCase()}</p>
                <p className="text-sm">
                  X: {item.xKey} | Y: {item.yKey}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
