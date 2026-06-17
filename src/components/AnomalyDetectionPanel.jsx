import { motion } from "framer-motion";

const copy = {
  zh: {
    eyebrow: "Anomaly Detection",
    title: "异常检测",
    description: "使用两倍标准差规则识别偏离正常范围的数值点。",
    total: "异常数量",
    columns: "影响字段",
    method: "检测规则",
    methodValue: "Mean ± 2 × Std",
    empty: "暂未发现异常点。",
  },
  en: {
    eyebrow: "Anomaly Detection",
    title: "Anomaly Detection",
    description: "Identify numeric values outside the normal range using a two-standard-deviation rule.",
    total: "Anomaly Count",
    columns: "Affected Columns",
    method: "Detection Rule",
    methodValue: "Mean ± 2 × Std",
    empty: "No anomaly signal was detected.",
  },
};

function AnomalyDetectionPanel({ language, anomalies = [] }) {
  const text = copy[language];
  const affectedColumns = [...new Set(anomalies.map((item) => item.column))];

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

      <div className="mt-7 grid grid-cols-3 gap-4">
        <Metric label={text.total} value={anomalies.length} />
        <Metric label={text.columns} value={affectedColumns.length || 0} />
        <Metric label={text.method} value={text.methodValue} />
      </div>

      {anomalies.length ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {affectedColumns.map((column) => (
            <span key={column} className="rounded-full border border-sky-200 bg-sky-50/80 px-4 py-2 text-sm font-semibold text-[#0284a8]">
              {column}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-sky-100/80 bg-white/45 p-6 text-slate-500">{text.empty}</div>
      )}
    </motion.section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-[24px] border border-sky-100/80 bg-white/48 p-5 shadow-lg shadow-sky-100/40">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-cyanline">{label}</div>
      <div className="mt-4 text-3xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

export default AnomalyDetectionPanel;
