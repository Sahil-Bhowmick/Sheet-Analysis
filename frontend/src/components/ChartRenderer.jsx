import { useRef, useState, useEffect } from "react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
} from "react-chartjs-2";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { toast } from "react-toastify";
import {
  saveChartMetadata,
  updateChartMetadata,
  getChartInsight,
} from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  RadialLinearScale,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  FaDownload,
  FaFilePdf,
  FaSave,
  FaRobot,
  FaCheckCircle,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  zoomPlugin
);

const ChartRenderer = ({
  data,
  xKey,
  yKey,
  chartType,
  onMetaSaved,
  fileName,
  fileId,
}) => {
  const chartRef = useRef();
  const [insight, setInsight] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const autoSavedFileRef = useRef(null);

  if (!data || !xKey || !yKey) return null;

  const isScatter = chartType === "scatter";
  const isXNumeric = data.every((row) => !isNaN(Number(row[xKey])));
  const isYNumeric = data.every((row) => !isNaN(Number(row[yKey])));

  if (isScatter && (!isXNumeric || !isYNumeric)) {
    return (
      <div className="text-center text-red-600 font-semibold mt-10 p-6 bg-red-50 border border-red-200 rounded-lg shadow">
        ❌ Scatter Chart requires both X and Y axis to be numeric.
        <br />
        Please select numeric columns like <b>Year</b>, <b>Amount</b>, etc.
      </div>
    );
  }

  const title = `${
    chartType[0].toUpperCase() + chartType.slice(1)
  }: ${yKey} vs ${xKey}`;
  const labels = data.map((row) => row[xKey]);
  const values = data.map((row) => Number(row[yKey]));
  const scatterPoints = data.map((row) => ({
    x: Number(row[xKey]),
    y: Number(row[yKey]),
  }));

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: isScatter ? scatterPoints : values,
        backgroundColor: [
          "#6366f1",
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f87171",
          "#a78bfa",
          "#f472b6",
        ],
        borderColor: "#4f46e5",
        borderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartType === "horizontalBar" ? "y" : "x",
    plugins: {
      legend: { position: "bottom", labels: { color: "#4b5563" } },
      zoom: !["pie", "doughnut", "polarArea"].includes(chartType)
        ? {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: "xy",
            },
            pan: { enabled: true, mode: "xy" },
          }
        : false,
    },
    scales: !["pie", "doughnut", "polarArea"].includes(chartType)
      ? {
          x: {
            type: isScatter ? "linear" : "category",
            title: {
              display: true,
              text: xKey,
              color: "#6b7280",
              font: { weight: "bold" },
            },
            ticks: { color: "#4b5563" },
            grid: { color: "#f3f4f6" },
          },
          y: {
            title: {
              display: true,
              text: yKey,
              color: "#6b7280",
              font: { weight: "bold" },
            },
            ticks: { color: "#4b5563" },
            grid: { color: "#f3f4f6" },
          },
        }
      : {},
  };

  const ChartComponent = {
    bar: Bar,
    horizontalBar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
    polarArea: PolarArea,
    scatter: Scatter,
  }[chartType];

  const downloadPNG = () => {
    if (!chartRef.current) return;
    toPng(chartRef.current)
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `chart-${Date.now()}.png`;
        a.click();
      })
      .catch((err) => toast.error("PNG download failed: " + err.message));
  };

  const downloadPDF = () => {
    if (!chartRef.current) return;
    toPng(chartRef.current)
      .then((dataUrl) => {
        const pdf = new jsPDF("landscape", "pt", [
          chartRef.current.offsetWidth,
          chartRef.current.offsetHeight,
        ]);
        pdf.addImage(dataUrl, "PNG", 0, 0);
        pdf.save(`chart-${Date.now()}.pdf`);
      })
      .catch((err) => toast.error("PDF download failed: " + err.message));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveChartMetadata({
        chartType,
        xKey,
        yKey,
        title,
        data,
        fileName,
        isPinned: true,
      });
      toast.success("✅ Chart saved to Saved Charts");
      onMetaSaved?.();
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const generateInsight = async () => {
    try {
      setLoadingInsight(true);
      const res = await getChartInsight({ chartType, xKey, yKey, data });
      setInsight(res.data.summary);
    } catch (err) {
      toast.error("AI insight generation failed");
    } finally {
      setLoadingInsight(false);
    }
  };

  // ✅ Auto-save or update chart
  useEffect(() => {
    const autoSave = async () => {
      if (!fileId || autoSavedFileRef.current === fileId) return;

      try {
        await updateChartMetadata(fileId, {
          chartType,
          xKey,
          yKey,
          title,
          data,
        });

        autoSavedFileRef.current = fileId;
        onMetaSaved?.();
      } catch (err) {
        console.error("Auto-update failed:", err.message);
      }
    };

    autoSave();
  }, [fileId, chartType]); // ✅ Update when chartType changes

  return (
    <div className="mt-10 rounded-2xl shadow-2xl border border-gray-200 p-8 bg-gradient-to-br from-white via-blue-50 to-blue-100 transition-all duration-300">
      <h3 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        {title}
      </h3>

      <div
        ref={chartRef}
        className={`mx-auto ${
          ["pie", "doughnut", "polarArea"].includes(chartType)
            ? "max-w-md"
            : "w-full"
        } bg-white rounded-lg p-6 shadow-inner h-[400px]`}
      >
        <ChartComponent
          key={`${chartType}-${xKey}-${yKey}`}
          data={chartData}
          options={chartOptions}
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={downloadPNG}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition shadow-md"
        >
          <FaDownload /> Download PNG
        </button>
        <button
          onClick={downloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition shadow-md"
        >
          <FaFilePdf /> Download PDF
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transition shadow-md disabled:opacity-50"
        >
          <FaSave /> {saving ? "Saving..." : "Save Chart"}
        </button>
        <button
          onClick={generateInsight}
          disabled={loadingInsight}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transition shadow-md disabled:opacity-50"
        >
          <FaRobot /> {loadingInsight ? "Thinking..." : "Generate AI Insight"}
        </button>
      </div>

      {insight && (
        <div className="mt-6 mx-auto max-w-3xl bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-md text-blue-800 text-sm animate-fade-in">
          <div className="flex items-center gap-2 font-medium mb-1">
            <FaCheckCircle className="text-blue-500" />
            AI Insight
          </div>
          <p className="leading-relaxed">{insight}</p>
        </div>
      )}
    </div>
  );
};

export default ChartRenderer;
