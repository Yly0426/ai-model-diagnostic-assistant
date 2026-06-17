import { motion } from "framer-motion";

const copy = {
  zh: {
    eyebrow: "Field Intelligence",
    title: "字段智能识别",
    description: "自动判断字段类型、唯一值、缺失情况和可用于分析的业务含义。",
    empty: "上传 CSV 后将自动识别字段类型。",
    headers: ["字段名", "识别类型", "唯一值", "缺失值", "示例值", "AI 解释"],
  },
  en: {
    eyebrow: "Field Intelligence",
    title: "Field Intelligence",
    description: "Automatically profile field types, uniqueness, missing values, and analysis meaning.",
    empty: "Upload a CSV to detect field types automatically.",
    headers: ["Field Name", "Detected Type", "Unique Values", "Missing Values", "Example Value", "AI Explanation"],
  },
};

function FieldIntelligence({ language, fields = [] }) {
  const text = copy[language];

  return (
    <motion.section
      className="analysis-module glass-panel rounded-[32px] p-7"
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <ModuleHeader text={text} />

      {fields.length ? (
        <div className="mt-7 overflow-hidden rounded-[24px] border border-sky-100/80 bg-white/45">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-sky-100/80 bg-sky-50/60 text-slate-600">
              <tr>
                {text.headers.map((header) => (
                  <th key={header} className="px-4 py-4 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/80">
              {fields.map((field) => (
                <tr key={field.name} className="transition hover:bg-white/70">
                  <td className="truncate px-4 py-4 font-semibold text-slate-800">{field.name}</td>
                  <td className="px-4 py-4">
                    <TypeBadge type={field.detectedType} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">{field.uniqueValues}</td>
                  <td className="px-4 py-4 text-slate-600">{field.missingValues}</td>
                  <td className="truncate px-4 py-4 text-slate-600">{String(field.exampleValue || "-")}</td>
                  <td className="px-4 py-4 leading-6 text-slate-600">{field.aiExplanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>{text.empty}</EmptyState>
      )}
    </motion.section>
  );
}

function ModuleHeader({ text }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyanline">{text.eyebrow}</p>
      <h3 className="mt-3 font-display text-4xl font-bold text-ink">{text.title}</h3>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">{text.description}</p>
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex rounded-full border border-sky-200/80 bg-sky-50/80 px-3 py-1 text-xs font-semibold text-[#0284a8]">
      {type}
    </span>
  );
}

function EmptyState({ children }) {
  return (
    <div className="mt-7 rounded-[24px] border border-sky-100/80 bg-white/45 p-6 text-slate-500">
      {children}
    </div>
  );
}

export default FieldIntelligence;
