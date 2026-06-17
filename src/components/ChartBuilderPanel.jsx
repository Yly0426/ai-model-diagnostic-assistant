import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = ["#0ea5c6", "#38bdf8", "#7dd3fc", "#67e8f9", "#bae6fd", "#a78bfa"];

const copy = {
  zh: {
    eyebrow: "Chart Builder",
    title: "多图表生成器",
    description: "点击智能图表推荐后，在这里直接生成柱状图、散点图、饼图或直方图。",
    empty: "上传数据后，可从智能图表推荐中点击一张卡片生成对应图表。",
  },
  en: {
    eyebrow: "Chart Builder",
    title: "Chart Builder",
    description: "Click a smart chart recommendation to render bar, scatter, pie, donut, or histogram charts.",
    empty: "Upload data, then click a recommendation card to render a chart here.",
  },
};

function ChartBuilderPanel({ language, rows = [], recommendation }) {
  const text = copy[language];
  const chartData = buildChartData(rows, recommendation);

  return (
    <motion.section
      className="analysis-module glass-panel rounded-[32px] p-7"
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyanline">{text.eyebrow}</p>
      <h3 className="mt-3 font-display text-4xl font-bold text-ink">{text.title}</h3>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">{text.description}</p>

      {recommendation && chartData.length ? (
        <div className="mt-7 h-[420px] rounded-[28px] border border-sky-100/80 bg-white/35 p-5">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart(recommendation, chartData)}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-7 rounded-[24px] border border-sky-100/80 bg-white/45 p-6 text-slate-500">{text.empty}</div>
      )}
    </motion.section>
  );
}

function renderChart(recommendation, data) {
  if (recommendation.chartType.includes("Bar")) {
    return (
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(14,165,198,0.16)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#527084", fontSize: 12 }} />
        <YAxis tick={{ fill: "#527084", fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" fill="#0ea5c6" radius={[10, 10, 0, 0]} />
      </BarChart>
    );
  }

  if (recommendation.chartType.includes("Scatter")) {
    return (
      <ScatterChart>
        <CartesianGrid stroke="rgba(14,165,198,0.16)" />
        <XAxis type="number" dataKey="x" name={recommendation.xAxis} tick={{ fill: "#527084", fontSize: 12 }} />
        <YAxis type="number" dataKey="y" name={recommendation.yAxis} tick={{ fill: "#527084", fontSize: 12 }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill="#0ea5c6" />
      </ScatterChart>
    );
  }

  if (recommendation.chartType.includes("Pie") || recommendation.chartType.includes("Donut")) {
    return (
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={132} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  }

  return (
    <BarChart data={data}>
      <CartesianGrid stroke="rgba(14,165,198,0.16)" vertical={false} />
      <XAxis dataKey="name" tick={{ fill: "#527084", fontSize: 12 }} />
      <YAxis tick={{ fill: "#527084", fontSize: 12 }} />
      <Tooltip />
      <Bar dataKey="value" fill="#38bdf8" radius={[10, 10, 0, 0]} />
    </BarChart>
  );
}

function buildChartData(rows, recommendation) {
  if (!rows?.length || !recommendation) return [];

  if (recommendation.chartType.includes("Scatter")) {
    return rows
      .map((row) => ({ x: toNumber(row[recommendation.xAxis]), y: toNumber(row[recommendation.yAxis]) }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
      .slice(0, 120);
  }

  if (recommendation.yAxis === "Record count") {
    return groupCount(rows, recommendation.xAxis);
  }

  if (recommendation.chartType.includes("Histogram")) {
    const values = rows.map((row) => toNumber(row[recommendation.xAxis])).filter(Number.isFinite);
    return buildHistogram(values);
  }

  return groupSum(rows, recommendation.xAxis, recommendation.yAxis);
}

function groupCount(rows, xAxis) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = String(row[xAxis] || "Unknown");
    groups.set(key, (groups.get(key) || 0) + 1);
  });
  return [...groups.entries()].map(([name, value]) => ({ name, value })).slice(0, 12);
}

function groupSum(rows, xAxis, yAxis) {
  const groups = new Map();
  rows.forEach((row, index) => {
    const key = xAxis === "Record count" ? `Row ${index + 1}` : String(row[xAxis] || `Row ${index + 1}`);
    groups.set(key, (groups.get(key) || 0) + (toNumber(row[yAxis]) || 0));
  });
  return [...groups.entries()].map(([name, value]) => ({ name, value })).slice(0, 28);
}

function buildHistogram(values) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bucketCount = 8;
  const size = (max - min || 1) / bucketCount;
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    name: `${Math.round(min + index * size)}-${Math.round(min + (index + 1) * size)}`,
    value: 0,
  }));
  values.forEach((value) => {
    const index = Math.min(bucketCount - 1, Math.floor((value - min) / size));
    buckets[index].value += 1;
  });
  return buckets;
}

function toNumber(value) {
  return Number(String(value ?? "").replace(/,/g, "").replace(/%$/, ""));
}

export default ChartBuilderPanel;
