import { motion } from "framer-motion";

const copy = {
  zh: {
    eyebrow: "Smart Chart Recommendation",
    title: "智能图表推荐",
    description: "根据字段类型和数据结构，推荐最适合的可视化方式。",
    empty: "上传 CSV 后将生成图表推荐。",
    labels: {
      x: "建议 X 轴",
      y: "建议 Y 轴",
      reason: "推荐理由",
      useCase: "业务用途",
    },
  },
  en: {
    eyebrow: "Smart Chart Recommendation",
    title: "Smart Chart Recommendation",
    description: "Recommend visualization types based on detected fields and dataset structure.",
    empty: "Upload a CSV to generate chart recommendations.",
    labels: {
      x: "Suggested X Axis",
      y: "Suggested Y Axis",
      reason: "Reason",
      useCase: "Business Use Case",
    },
  },
};

function ChartRecommendationPanel({ language, recommendations = [], onSelectRecommendation }) {
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

      {recommendations.length ? (
        <div className="mt-7 grid grid-cols-5 gap-4">
          {recommendations.map((item) => (
            <button
              key={`${item.chartType}-${item.xAxis}-${item.yAxis}`}
              type="button"
              onClick={() => onSelectRecommendation?.(item)}
              className="rounded-[24px] border border-sky-100/80 bg-white/48 p-5 text-left shadow-lg shadow-sky-100/40 transition hover:-translate-y-1 hover:border-[#0ea5c6] hover:bg-white/70"
            >
              <h4 className="text-xl font-bold text-slate-800">{item.chartType}</h4>
              <div className="mt-5 space-y-3 text-sm">
                <Meta label={text.labels.x} value={item.xAxis} />
                <Meta label={text.labels.y} value={item.yAxis} />
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                <strong className="text-slate-800">{text.labels.reason}: </strong>
                {item.reason}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                <strong className="text-slate-800">{text.labels.useCase}: </strong>
                {item.businessUseCase}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[24px] border border-sky-100/80 bg-white/45 p-6 text-slate-500">{text.empty}</div>
      )}
    </motion.section>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-2xl bg-sky-50/70 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyanline">{label}</div>
      <div className="mt-1 truncate font-semibold text-slate-700">{value}</div>
    </div>
  );
}

export default ChartRecommendationPanel;
