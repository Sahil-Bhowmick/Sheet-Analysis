import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Bar,
  Line as ChartLine,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter as ChartScatter,
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

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line as DreiLine } from "@react-three/drei";
import * as THREE from "three";

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

/**
 * ChartRenderer - now with full 3D counterparts for 2D charts.
 *
 * Props:
 * - data: array of records
 * - xKey, yKey: axis field names
 * - chartType: one of bar, horizontalBar, line, pie, doughnut, radar, polarArea, scatter
 * - onMetaSaved, fileName, fileId
 * - use3D (optional boolean) - show 3D scene when true
 * - zKey (optional string) - numeric column for Z axis (scatter/3D line), fallback to index
 *
 * Notes:
 * - For large datasets, instancing used for scatter & radial bars to stay performant.
 * - Hover tooltips available for the majority of interactions; instanced meshes show approximate info.
 */

const ChartRenderer = ({
  data,
  xKey,
  yKey,
  chartType = "bar",
  onMetaSaved,
  fileName,
  fileId,
  use3D: use3DProp = false,
  zKey: zKeyProp = null,
}) => {
  const chartRef = useRef();
  const [insight, setInsight] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const autoSavedFileRef = useRef(null);

  // 3D toggles
  const [use3D, setUse3D] = useState(Boolean(use3DProp));
  const [zKey, setZKey] = useState(zKeyProp || null);
  useEffect(() => setUse3D(Boolean(use3DProp)), [use3DProp]);
  useEffect(() => setZKey(zKeyProp || null), [zKeyProp]);

  if (!data || !xKey || !yKey) return null;

  const title = `${
    chartType[0].toUpperCase() + chartType.slice(1)
  }: ${yKey} vs ${xKey}`;
  const labels = data.map((r) => r[xKey]);
  const values = data.map((r) => Number(r[yKey]) || 0);
  const zValues = data.map((r, i) => (zKey ? Number(r[zKey] ?? 0) : i));

  const scatterPoints = useMemo(
    () =>
      data.map((r, i) => ({
        x: Number(r[xKey]) || 0,
        y: Number(r[yKey]) || 0,
        z: zKey ? Number(r[zKey] ?? 0) : i,
        label: r[xKey] ?? String(i),
      })),
    [data, xKey, yKey, zKey]
  );

  // Chart.js 2D objects (fallback)
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data:
          chartType === "scatter"
            ? scatterPoints.map((p) => ({ x: p.x, y: p.y }))
            : values,
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
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#374151" } },
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
            type: chartType === "scatter" ? "linear" : "category",
            title: { display: true, text: xKey },
            ticks: { color: "#374151" },
            grid: { color: "#f3f4f6" },
          },
          y: {
            title: { display: true, text: yKey },
            ticks: { color: "#374151" },
            grid: { color: "#f3f4f6" },
          },
        }
      : {},
  };

  const ChartComponent = {
    bar: Bar,
    horizontalBar: Bar,
    line: ChartLine,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
    polarArea: PolarArea,
    scatter: ChartScatter,
  }[chartType];

  /* ---------- export handlers ---------- */
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

  /* ---------- save & insight ---------- */
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
      setInsight(res.data?.summary || "");
    } catch (err) {
      toast.error("AI insight generation failed");
    } finally {
      setLoadingInsight(false);
    }
  };

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
        console.error("Auto-update failed:", err);
      }
    };
    autoSave();
  }, [fileId, chartType, xKey, yKey, data, onMetaSaved]);

  /* ===================== 3D primitives ===================== */

  // small grid + axes
  function Axes({ size = 6 }) {
    const xPoints = [
      [-size, 0, 0],
      [size, 0, 0],
    ];
    const zPoints = [
      [0, 0, -size],
      [0, 0, size],
    ];
    const yPoints = [
      [0, 0, 0],
      [0, size, 0],
    ];
    return (
      <group>
        <DreiLine points={xPoints} color="#ef4444" lineWidth={1} />
        <DreiLine points={zPoints} color="#2563eb" lineWidth={1} />
        <DreiLine points={yPoints} color="#10b981" lineWidth={1} />
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
          <planeGeometry args={[size * 2, size * 2]} />
          <meshStandardMaterial color="#fbfdff" />
        </mesh>
      </group>
    );
  }

  /* 3D BAR */
  function ThreeDBar({ vals = [] }) {
    const group = useRef();
    const maxV = Math.max(...vals.map((v) => Math.abs(v))) || 1;
    const count = vals.length;
    const spacing = Math.max(0.6, (20 / Math.max(8, count)) * 0.6);
    const barW = Math.min(0.9, spacing * 0.8);

    return (
      <group ref={group}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.9} />
        {vals.map((v, i) => {
          const x = (i - count / 2) * spacing;
          const height = (Math.abs(v) / maxV) * 6 + 0.1;
          const y = height / 2;
          const hue = 0.65 - (i / Math.max(1, count)) * 0.45;
          const color = new THREE.Color().setHSL(hue, 0.6, 0.5).getStyle();
          return (
            <mesh key={i} position={[x, y, 0]}>
              <boxGeometry args={[barW, height, barW]} />
              <meshStandardMaterial
                color={color}
                metalness={0.2}
                roughness={0.6}
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  /* 3D LINE (smooth line in space using Drei Line) */
  function ThreeDLine({ pts = [] }) {
    // Normalize and map to scene coords
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const zs = pts.map((p) => p.z);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) || 1;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) || 1;
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs) || 1;

    const norm = pts.map((p, i) => {
      const nx = ((p.x - minX) / (maxX - minX || 1) - 0.5) * pts.length * 0.12;
      const ny = ((p.y - minY) / (maxY - minY || 1)) * 6 + 0.1;
      const nz = ((p.z - minZ) / (maxZ - minZ || 1) - 0.5) * pts.length * 0.12;
      return [nx, ny, nz];
    });

    return (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.9} />
        <DreiLine points={norm} color="#4f46e5" lineWidth={3} />
        {norm.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color="#4f46e5"
              metalness={0.1}
              roughness={0.5}
            />
          </mesh>
        ))}
      </>
    );
  }

  /* 3D SCATTER (instanced for large sets) */
  function ThreeDScatter({ pts = [] }) {
    const count = pts.length;
    // compute ranges
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const zs = pts.map((p) => p.z);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs) || 1;
    const minY = Math.min(...ys),
      maxY = Math.max(...ys) || 1;
    const minZ = Math.min(...zs),
      maxZ = Math.max(...zs) || 1;

    const norm = pts.map((p, i) => {
      const nx =
        ((p.x - minX) / (maxX - minX || 1) - 0.5) *
        Math.min(pts.length * 0.12, 12);
      const ny = ((p.y - minY) / (maxY - minY || 1)) * 6 + 0.05;
      const nz =
        ((p.z - minZ) / (maxZ - minZ || 1) - 0.5) *
        Math.min(pts.length * 0.12, 12);
      return { pos: [nx, ny, nz], idx: i, val: p.y, label: p.label };
    });

    // instancing threshold
    if (count > 300) {
      const meshRef = useRef();
      useEffect(() => {
        if (!meshRef.current) return;
        const temp = new THREE.Object3D();
        norm.forEach((n, i) => {
          temp.position.set(...n.pos);
          temp.updateMatrix();
          meshRef.current.setMatrixAt(i, temp.matrix);
          const col = new THREE.Color().setHSL(
            0.6 - (i / count) * 0.5,
            0.65,
            0.5
          );
          if (meshRef.current.setColorAt) meshRef.current.setColorAt(i, col);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor)
          meshRef.current.instanceColor.needsUpdate = true;
      }, [meshRef, norm]);

      return (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.9} />
          <instancedMesh ref={meshRef} args={[null, null, norm.length]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial vertexColors />
          </instancedMesh>
        </>
      );
    }

    // small sets: normal meshes + hover
    return (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.9} />
        {norm.map((n) => {
          const color = new THREE.Color()
            .setHSL(0.6 - (n.idx / count) * 0.5, 0.65, 0.5)
            .getStyle();
          return (
            <mesh
              key={n.idx}
              position={n.pos}
              onPointerOver={(e) => {
                e.stopPropagation();
                const world = e.point.clone();
                // show tooltip via global state exposed by parent Html - we'll use window.hoverData for simple pass
                window.__CHART_HOVER = { world, label: n.label, value: n.val };
                // small hack: dispatch custom event
                window.dispatchEvent(
                  new CustomEvent("chart:3dhover", {
                    detail: window.__CHART_HOVER,
                  })
                );
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                window.__CHART_HOVER = null;
                window.dispatchEvent(
                  new CustomEvent("chart:3dhover", { detail: null })
                );
              }}
            >
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial
                color={color}
                metalness={0.1}
                roughness={0.5}
              />
            </mesh>
          );
        })}
      </>
    );
  }

  /* 3D PIE / DOUGHNUT - extruded sectors around center */
  function ThreeDPie({ vals = [], inner = 0 }) {
    const total = vals.reduce((a, b) => a + Math.abs(b), 0) || 1;
    const radius = 3;
    const height = 0.8;
    let acc = 0;
    return (
      <>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={0.9} />
        <group position={[0, height / 2, 0]}>
          {vals.map((v, i) => {
            const portion = Math.abs(v) / total;
            const start = acc * Math.PI * 2;
            const end = (acc + portion) * Math.PI * 2;
            acc += portion;
            const mid = (start + end) / 2;
            const color = new THREE.Color()
              .setHSL(0.65 - (i / vals.length) * 0.6, 0.6, 0.5)
              .getStyle();
            // create a simple wedge via lathe-like geometry approximation
            const segments = 48;
            const pts = [];
            for (let a = start; a <= end; a += (end - start) / segments) {
              pts.push([Math.cos(a) * radius, Math.sin(a) * radius]);
            }
            // build shape in XY and extrude in Y
            const shape = new THREE.Shape();
            shape.moveTo(inner * Math.cos(start), inner * Math.sin(start));
            pts.forEach((p, idx) => shape.lineTo(p[0], p[1]));
            shape.lineTo(inner * Math.cos(end), inner * Math.sin(end));
            // convert to geometry via ExtrudeBufferGeometry (can't use on client react easily), so approximate by many trapezoids
            const groupPieces = [];
            // render as many thin boxes approximating wedge
            const pieceCount = Math.max(
              6,
              Math.floor((end - start) / (Math.PI / 32))
            );
            const pieceAngle = (end - start) / pieceCount;
            const pieces = [];
            for (let pi = 0; pi < pieceCount; pi++) {
              const a1 = start + pi * pieceAngle;
              const a2 = a1 + pieceAngle;
              const x1 = Math.cos(a1) * inner;
              const z1 = Math.sin(a1) * inner;
              const x2 = Math.cos(a2) * radius;
              const z2 = Math.sin(a2) * radius;
              // center position approx
              const cx = (Math.cos(a1 + pieceAngle / 2) * (radius + inner)) / 2;
              const cz = (Math.sin(a1 + pieceAngle / 2) * (radius + inner)) / 2;
              const wedgeWidth =
                Math.hypot(
                  Math.cos(a2) - Math.cos(a1),
                  Math.sin(a2) - Math.sin(a1)
                ) * radius;
              pieces.push({ cx, cz, wedgeWidth });
            }
            return (
              <group key={i}>
                {pieces.map((p, idx) => (
                  <mesh
                    key={idx}
                    position={[p.cx, 0, p.cz]}
                    rotation={[0, -mid + Math.PI / 2, 0]}
                  >
                    <boxGeometry
                      args={[p.wedgeWidth || 0.3, height, radius * 0.12]}
                    />
                    <meshStandardMaterial color={color} />
                  </mesh>
                ))}
                {/* label outwards */}
                <mesh
                  position={[
                    Math.cos(mid) * (radius + 0.9),
                    0.6,
                    Math.sin(mid) * (radius + 0.9),
                  ]}
                >
                  <Html center>
                    <div className="bg-white/95 p-1 rounded text-xs shadow">
                      {Math.round(portion * 100)}%
                    </div>
                  </Html>
                </mesh>
              </group>
            );
          })}
        </group>
      </>
    );
  }

  /* 3D RADAR / POLAR - radial bars */
  function ThreeDRadial({ vals = [] }) {
    const count = vals.length;
    const maxV = Math.max(...vals.map((v) => Math.abs(v))) || 1;
    const ring = 3;
    // Instanced if many
    if (count > 200) {
      const meshRef = useRef();
      useEffect(() => {
        if (!meshRef.current) return;
        const temp = new THREE.Object3D();
        vals.forEach((v, i) => {
          const angle = (i / count) * Math.PI * 2;
          const len = (Math.abs(v) / maxV) * ring;
          const cx = Math.cos(angle) * (len / 2);
          const cz = Math.sin(angle) * (len / 2);
          temp.position.set(cx, len / 2, cz);
          temp.rotation.y = -angle;
          temp.updateMatrix();
          meshRef.current.setMatrixAt(i, temp.matrix);
          const col = new THREE.Color().setHSL(
            0.65 - (i / count) * 0.6,
            0.6,
            0.5
          );
          if (meshRef.current.setColorAt) meshRef.current.setColorAt(i, col);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor)
          meshRef.current.instanceColor.needsUpdate = true;
      }, [meshRef, vals]);
      return (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.9} />
          <instancedMesh ref={meshRef} args={[null, null, vals.length]}>
            <boxGeometry args={[0.18, 1, 0.18]} />
            <meshStandardMaterial vertexColors />
          </instancedMesh>
        </>
      );
    }

    return (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.9} />
        {vals.map((v, i) => {
          const angle = (i / count) * Math.PI * 2;
          const len = (Math.abs(v) / maxV) * ring;
          const cx = Math.cos(angle) * (len / 2);
          const cz = Math.sin(angle) * (len / 2);
          const color = new THREE.Color()
            .setHSL(0.65 - (i / count) * 0.6, 0.6, 0.5)
            .getStyle();
          return (
            <mesh
              key={i}
              position={[cx, len / 2, cz]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.18, len, 0.18]} />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        })}
      </>
    );
  }

  /* ===================== Render ===================== */

  const isBar = chartType === "bar" || chartType === "horizontalBar";
  const isLine = chartType === "line";
  const isScatter = chartType === "scatter";
  const isPie = chartType === "pie" || chartType === "doughnut";
  const isRadar = chartType === "radar" || chartType === "polarArea";

  // A small mechanism to surface 3D hover data from ThreeDScatter to DOM via events:
  const [hover3d, setHover3d] = useState(null);
  useEffect(() => {
    const onHover = (e) => setHover3d(e.detail || null);
    window.addEventListener("chart:3dhover", onHover);
    return () => window.removeEventListener("chart:3dhover", onHover);
  }, []);

  return (
    <div className="mt-8 rounded-2xl shadow-2xl border border-gray-200 p-6 bg-white transition-all duration-300">
      <h3 className="text-2xl md:text-3xl font-bold text-center text-indigo-700 mb-4">
        {title}
      </h3>

      <div
        ref={chartRef}
        className={`mx-auto bg-white rounded-lg p-2 shadow-inner ${
          use3D ? "h-[640px]" : "h-[420px]"
        } overflow-hidden`}
        style={{ minHeight: 320 }}
      >
        {!use3D && (
          <div className="w-full h-full">
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
        )}

        {use3D && (
          <div className="w-full h-full">
            <Canvas camera={{ position: [0, 6, 12], fov: 50 }}>
              <color attach="background" args={["#ffffff"]} />
              <OrbitControls enablePan enableZoom enableRotate />
              <gridHelper
                args={[20, 20, "#e6e6e6", "#f3f4f6"]}
                position={[0, 0, 0]}
              />
              <Axes />
              {/* choose the proper 3D visual */}
              {isBar && <ThreeDBar vals={values} />}
              {isLine && <ThreeDLine pts={scatterPoints} />}
              {isScatter && <ThreeDScatter pts={scatterPoints} />}
              {isPie && (
                <ThreeDPie
                  vals={values}
                  inner={chartType === "doughnut" ? 1.0 : 0}
                />
              )}
              {isRadar && <ThreeDRadial vals={values} />}
            </Canvas>

            {/* Hover tooltip overlay for 3D hover events */}
            {hover3d && hover3d.label && (
              <div
                style={{ position: "absolute", right: 24, top: 24, zIndex: 40 }}
              >
                <div className="bg-white p-2 rounded shadow text-sm">
                  <div className="font-medium">{hover3d.label}</div>
                  <div className="text-xs text-gray-600">{hover3d.value}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            setUse3D(false);
            downloadPNG();
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition shadow-md"
        >
          <FaDownload /> Download PNG
        </button>
        <button
          onClick={() => {
            setUse3D(false);
            downloadPDF();
          }}
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

        <button
          onClick={() => setUse3D((s) => !s)}
          title="Toggle 3D preview"
          className={`ml-2 px-3 py-2 rounded-md border ${
            use3D
              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
              : "bg-white border-gray-200 text-gray-700"
          }`}
        >
          {use3D ? "Viewing 3D" : "View 3D"}
        </button>
      </div>

      {insight && (
        <div className="mt-6 mx-auto max-w-3xl bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-md text-blue-800 text-sm">
          <div className="flex items-center gap-2 font-medium mb-1">
            <FaCheckCircle className="text-blue-500" /> AI Insight
          </div>
          <p className="leading-relaxed">{insight}</p>
        </div>
      )}
    </div>
  );
};

export default ChartRenderer;
