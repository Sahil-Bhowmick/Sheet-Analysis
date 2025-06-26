// src/components/ChartRenderer.jsx
import { useRef } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend
);

const ChartRenderer = ({ data, xKey, yKey, chartType }) => {
  const chartRef = useRef(null);
  if (!data || !xKey || !yKey) return null;

  const labels = data.map((row) => row[xKey]);
  const values = data.map((row) => Number(row[yKey]));

  const chartData = {
    labels,
    datasets: [
      {
        label: `${yKey} vs ${xKey}`,
        data: values,
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
      },
    ],
  };

  const downloadAsPNG = () => {
    html2canvas(chartRef.current).then((canvas) => {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "chart.png";
      a.click();
    });
  };

  const downloadAsPDF = () => {
    html2canvas(chartRef.current).then((canvas) => {
      const pdf = new jsPDF();
      const img = canvas.toDataURL("image/png");
      pdf.addImage(img, "PNG", 10, 10, 180, 120);
      pdf.save("chart.pdf");
    });
  };

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
  }[chartType];

  return (
    <div className="mt-8">
      <div ref={chartRef} className="bg-white p-4 rounded shadow-md">
        <ChartComponent data={chartData} />
      </div>
      <div className="flex gap-4 mt-4">
        <button onClick={downloadAsPNG} className="btn">Download PNG</button>
        <button onClick={downloadAsPDF} className="btn">Download PDF</button>
      </div>
    </div>
  );
};

export default ChartRenderer;
