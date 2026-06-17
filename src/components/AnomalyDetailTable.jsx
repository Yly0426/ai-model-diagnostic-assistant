import { motion } from "framer-motion";
import { formatNumber } from "../utils/dataAnalysis.js";

const copy = {
  zh: {
    eyebrow: "Anomaly Detail Table",
    title: "异常详情表格",
    description: "展示所有异常点的行号、字段、偏离方向和可能解释。",
    empty: "暂未检测到异常点。",
    headers: ["行号", "字段", "值", "均值", "标准差", "偏离方向", "可能解释"],
  },
  en: {
    eyebrow: "Anomaly Detail Table",
    title: "Anomaly Detail Table",
    description: "Review every anomaly with row index, metric, direction, and possible explanation.",
    empty: "No anomaly detail was detected.",
    headers: ["Row Index", "Column Name", "Value", "Mean", "Std Dev", "Direction", "Possible Explanation"],
  },
};

function AnomalyDetailTable({ language, details = [] }) {
  const text = copy[language];

  return (
    <motion.section
      className="analysis-module glass-panel rounded-[32px] p-7"
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyanline">{text.eyebrow}</p>
      <h3 className="mt-3 font-display text-4xl font-bold text-white">{text.title}</h3>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">{text.description}</p>

      {details.length ? (
        <div className="mt-7 max-h-[420px] overflow-auto rounded-[24px] border border-sky-100/80 bg-white/45">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="sticky top-0 border-b border-sky-100/80 bg-sky-50/90 text-slate-600 backdrop-blur-xl">
              <tr>
                {text.headers.map((header) => (
                  <th key={header} className="px-4 py-4 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/80">
              {details.map((item, index) => (
                <tr key={`${item.row}-${item.column}-${index}`} className="transition hover:bg-white/70">
                  <td className="px-4 py-4 font-semibold text-slate-800">{item.row}</td>
                  <td className="truncate px-4 py-4 text-slate-700">{item.column}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.value)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatNumber(item.mean)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatNumber(item.standardDeviation)}</td>
                  <td className="px-4 py-4 text-[#0284a8]">{item.direction}</td>
                  <td className="px-4 py-4 leading-6 text-slate-600">{item.possibleExplanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-7 rounded-[24px] border border-sky-100/80 bg-white/45 p-6 text-slate-500">{text.empty}</div>
      )}
    </motion.section>
  );
}

export default AnomalyDetailTable;
