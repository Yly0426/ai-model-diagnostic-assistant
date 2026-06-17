import { motion } from "framer-motion";
import { cleanDataset } from "../utils/dataAnalysis.js";

const copy = {
  zh: {
    eyebrow: "Cleaning Suggestions",
    title: "数据清洗操作",
    description: "在前端对当前数据集执行轻量清洗，并立即重新生成统计、图表、质量诊断和 AI 摘要。",
    actions: [
      ["removeDuplicates", "删除重复行", "移除完全重复的记录，降低重复统计带来的偏差。"],
      ["fillMissingMedian", "数值缺失填充中位数", "对数值指标的空值使用中位数填充，适合快速探索分析。"],
      ["fillMissingUnknown", "文本缺失标记 Unknown", "把空文本或空分类统一标记为 Unknown，便于后续分组统计。"],
      ["standardizeDates", "标准化日期格式", "将可解析日期转换为 YYYY-MM-DD，减少日期字段混乱。"],
    ],
    disabled: "请先上传或加载示例数据。",
  },
  en: {
    eyebrow: "Cleaning Suggestions",
    title: "Data Cleaning Actions",
    description: "Run lightweight frontend cleaning actions and regenerate statistics, charts, quality checks, and AI summaries.",
    actions: [
      ["removeDuplicates", "Remove duplicate rows", "Remove fully duplicated records to reduce counting bias."],
      ["fillMissingMedian", "Fill numeric missing values", "Use median values for missing numeric metrics during quick exploration."],
      ["fillMissingUnknown", "Mark text missing as Unknown", "Replace blank text or categories with Unknown for cleaner grouping."],
      ["standardizeDates", "Standardize date format", "Convert parseable dates to YYYY-MM-DD to reduce date inconsistencies."],
    ],
    disabled: "Upload or load a sample dataset first.",
  },
};

function DataCleaningPanel({ language, analysisState, onDatasetChange }) {
  const text = copy[language];

  const runAction = (action) => {
    if (!analysisState?.rows?.length) return;
    const dateColumns = (analysisState.fieldInsights || [])
      .filter((field) => field.detectedType === "Date Field")
      .map((field) => field.name);
    const cleanedRows = cleanDataset(analysisState.rows, action, {
      numericColumns: analysisState.numericColumns,
      dateColumns,
    });
    onDatasetChange(cleanedRows, `${analysisState.fileName || "dataset"} - cleaned`, "cleaned");
  };

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

      <div className="mt-7 grid gap-4 lg:grid-cols-4">
        {text.actions.map(([action, title, description]) => (
          <button
            key={action}
            type="button"
            disabled={!analysisState?.rows?.length}
            onClick={() => runAction(action)}
            className="rounded-[24px] border border-sky-100/80 bg-white/45 p-5 text-left transition hover:-translate-y-1 hover:border-[#0ea5c6] hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <h4 className="text-lg font-bold text-slate-800">{title}</h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          </button>
        ))}
      </div>
      {!analysisState?.rows?.length && <div className="mt-5 text-sm text-slate-500">{text.disabled}</div>}
    </motion.section>
  );
}

export default DataCleaningPanel;
