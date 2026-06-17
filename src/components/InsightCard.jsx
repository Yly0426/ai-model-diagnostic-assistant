import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber, generateEnhancedInsights } from "../utils/dataAnalysis.js";

const defaultChart = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 58 },
  { label: "Mar", value: 51 },
  { label: "Apr", value: 76 },
  { label: "May", value: 88 },
  { label: "Jun", value: 81 },
  { label: "Jul", value: 104 },
];

const copy = {
  zh: {
    step: "步骤 02",
    title: "AI 分析反馈",
    generated: "已生成",
    demo: "演示模式",
    report: "增强 AI 洞察报告",
    ready: "AI 已准备好在上传后分析你的数据集。",
    readyNext: "数据质量、字段理解、分析路径、关键风险和下一步建议会出现在这个面板中。",
    sections: ["Data Quality Summary", "Field Understanding", "Recommended Analysis Path", "Key Risk", "Next Step Recommendation"],
  },
  en: {
    step: "Step 02",
    title: "AI analysis feedback",
    generated: "Generated",
    demo: "Demo mode",
    report: "Enhanced AI insight report",
    ready: "AI is ready to analyze your dataset after upload.",
    readyNext: "Data quality, field understanding, analysis path, key risk, and next steps will appear here.",
    sections: ["Data Quality Summary", "Field Understanding", "Recommended Analysis Path", "Key Risk", "Next Step Recommendation"],
  },
};

function InsightCard({ language, analysisState }) {
  const text = copy[language];
  const chartData = analysisState?.chartData?.length ? analysisState.chartData : defaultChart;
  const stats = analysisState?.stats?.slice(0, 3) || [];
  const enhancedInsight = analysisState?.datasetSummary
    ? generateEnhancedInsights(analysisState.datasetSummary, language)
    : null;

  return (
    <motion.article
      className="stagger-card glass-panel border-glow-card min-h-[680px] rounded-[32px] p-8 transition duration-300 hover:scale-[1.01]"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, delay: 0.08 }}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyanline">{text.step}</p>
          <h3 className="mt-4 font-display text-4xl font-bold text-white">{text.title}</h3>
        </div>
        <span className="rounded-full border border-cyanline/20 bg-cyanline/10 px-4 py-2 text-sm text-cyanline">
          {analysisState ? text.generated : text.demo}
        </span>
      </div>

      <div className="mt-9 h-[310px] rounded-[28px] border border-white/10 bg-black/20 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="valueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#43d9ff" stopOpacity={0.72} />
                <stop offset="100%" stopColor="#43d9ff" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(14, 165, 198, 0.14)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#527084", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#527084", fontSize: 12 }} axisLine={false} tickLine={false} width={46} />
            <Tooltip
              contentStyle={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(14, 165, 198, 0.24)",
                borderRadius: 16,
                color: "#0b2436",
                boxShadow: "0 18px 40px rgba(14, 165, 198, 0.14)",
              }}
            />
            <Area type="monotone" dataKey="value" stroke="#0ea5c6" strokeWidth={3} fill="url(#valueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {(stats.length ? stats : demoStats).map((stat) => (
          <div key={stat.column} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <div className="truncate font-mono text-xs uppercase tracking-[0.16em] text-slate-500">{stat.column}</div>
            <div className="mt-4 text-2xl font-bold text-white">{formatNumber(stat.mean)}</div>
            <div className="mt-2 text-sm text-slate-500">
              {formatNumber(stat.min)} - {formatNumber(stat.max)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-cyanline/20 bg-cyanline/[0.055] p-6">
        <div className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-cyanline">{text.report}</div>
        {enhancedInsight ? (
          <div className="space-y-4 text-base leading-7 text-slate-300">
            {[
              enhancedInsight.dataQualitySummary,
              enhancedInsight.fieldUnderstanding,
              enhancedInsight.recommendedAnalysisPath,
              enhancedInsight.keyRisk,
              enhancedInsight.nextStepRecommendation,
            ].map((item, index) => (
              <div key={text.sections[index]} className="rounded-2xl bg-white/45 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyanline">{text.sections[index]}</div>
                <p className="mt-2">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 text-base leading-7 text-slate-400">
            <p>{text.ready}</p>
            <p>{text.readyNext}</p>
          </div>
        )}
      </div>
    </motion.article>
  );
}

const demoStats = [
  { column: "revenue", mean: 72.4, min: 42, max: 104 },
  { column: "orders", mean: 58.2, min: 31, max: 91 },
  { column: "margin", mean: 24.8, min: 12, max: 43 },
];

export default InsightCard;
