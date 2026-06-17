import { motion } from "framer-motion";

const copy = {
  zh: {
    eyebrow: "Data Quality Check",
    title: "数据质量诊断",
    description: "检查缺失值、重复行、混合类型、极端值和日期解析问题。",
    empty: "上传 CSV 后将展示数据质量诊断结果。",
    clean: "暂未发现明显质量问题。建议在正式分析前继续确认字段定义。",
  },
  en: {
    eyebrow: "Data Quality Check",
    title: "Data Quality Check",
    description: "Detect missing values, duplicates, mixed types, extreme values, and date parsing issues.",
    empty: "Upload a CSV to show data quality diagnostics.",
    clean: "No obvious data quality issue was found. Confirm field definitions before final analysis.",
  },
};

const severityStyle = {
  High: "border-red-200 bg-red-50/70 text-red-700",
  Medium: "border-amber-200 bg-amber-50/70 text-amber-700",
  Low: "border-sky-200 bg-sky-50/70 text-sky-700",
};

function DataQualityPanel({ language, issues = [] }) {
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

      {issues.length ? (
        <div className="mt-7 grid grid-cols-3 gap-4">
          {issues.map((issue, index) => (
            <article key={`${issue.issueType}-${issue.affectedColumn}-${index}`} className="rounded-[24px] border border-sky-100/80 bg-white/48 p-5 shadow-lg shadow-sky-100/40 transition hover:-translate-y-1 hover:bg-white/70">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${severityStyle[issue.severity]}`}>
                {issue.severity}
              </span>
              <h4 className="mt-4 text-lg font-bold text-slate-800">{issue.issueType}</h4>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-cyanline">{issue.affectedColumn}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{issue.description}</p>
              <p className="mt-4 rounded-2xl bg-sky-50/70 p-4 text-sm leading-6 text-slate-700">{issue.suggestedFix}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[24px] border border-sky-100/80 bg-white/45 p-6 text-slate-500">{text.empty}</div>
      )}
    </motion.section>
  );
}

export default DataQualityPanel;
