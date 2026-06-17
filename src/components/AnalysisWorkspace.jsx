import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import FieldIntelligence from "./FieldIntelligence.jsx";
import DataQualityPanel from "./DataQualityPanel.jsx";
import ChartRecommendationPanel from "./ChartRecommendationPanel.jsx";
import ChartBuilderPanel from "./ChartBuilderPanel.jsx";
import AnomalyDetectionPanel from "./AnomalyDetectionPanel.jsx";
import AnomalyDetailTable from "./AnomalyDetailTable.jsx";
import DatasetChat from "./DatasetChat.jsx";
import DataCleaningPanel from "./DataCleaningPanel.jsx";
import ReportExportPanel from "./ReportExportPanel.jsx";
import ProjectHistoryPanel from "./ProjectHistoryPanel.jsx";

const copy = {
  zh: {
    eyebrow: "AI Analysis Console",
    title: "选择一个分析模块",
    description: "点击明亮玻璃图标查看对应分析结果，避免所有输出同时堆叠在页面中。",
    emptyTitle: "等待上传数据集",
    emptyDescription: "上传 CSV 或加载示例数据后，这里会解锁完整分析控制台。",
    metrics: ["记录数", "字段数", "数值指标", "质量问题", "异常点"],
    open: "查看模块",
    bridgeTitle: "分析模块已就绪，等待数据接入",
    bridgeDescription: "当前下方没有断开的结果区，而是等待 CSV 数据流进入。加载示例数据可以立即查看字段识别、质量诊断、图表生成、清洗、导出和 AI 问答。",
    upload: "返回上传区",
    sample: "加载示例数据",
    bridgeSteps: ["接入 CSV", "生成分析摘要", "打开专业模块"],
    modules: {
      fields: ["字段智能识别", "理解每一列字段类型、缺失值、唯一值和 AI 解释。"],
      quality: ["数据质量诊断", "定位缺失、重复、混合类型、极端值和日期问题。"],
      charts: ["智能图表推荐", "根据字段组合推荐最合适的图表和业务用途。"],
      chartBuilder: ["图表生成器", "点击推荐后渲染 Bar、Scatter、Pie、Histogram 等图表。"],
      anomaly: ["异常检测", "汇总异常数量、影响字段和检测规则。"],
      anomalyTable: ["异常详情表格", "查看每个异常点的行号、偏离方向和可能解释。"],
      cleaning: ["数据清洗操作", "删除重复、填充缺失、标准化日期并重新分析。"],
      export: ["导出分析报告", "导出 Markdown 或 PDF 格式的 AI 分析报告。"],
      history: ["项目历史", "保存并切换最近分析过的数据集。"],
      chat: ["数据集 AI 问答", "调用 DeepSeek 或使用本地摘要回答数据问题。"],
    },
  },
  en: {
    eyebrow: "AI Analysis Console",
    title: "Choose an analysis module",
    description: "Click a bright glass icon to inspect one analysis output at a time.",
    emptyTitle: "Waiting for a dataset",
    emptyDescription: "Upload a CSV or load the sample dataset to unlock the full analysis console.",
    metrics: ["Rows", "Fields", "Numeric Metrics", "Quality Issues", "Anomalies"],
    open: "Open module",
    bridgeTitle: "Analysis modules are ready for data",
    bridgeDescription:
      "The detail area is now a connected waiting state. Load the sample dataset to preview field intelligence, quality checks, chart building, cleaning, export, and AI Q&A.",
    upload: "Back to upload",
    sample: "Load sample data",
    bridgeSteps: ["Connect CSV", "Build summaries", "Open modules"],
    modules: {
      fields: ["Field Intelligence", "Understand field types, missing values, uniqueness, and AI explanations."],
      quality: ["Data Quality Check", "Find missing, duplicate, mixed type, extreme value, and date issues."],
      charts: ["Smart Chart Recommendation", "Recommend chart types and business use cases from field combinations."],
      chartBuilder: ["Chart Builder", "Render Bar, Scatter, Pie, and Histogram charts from recommendations."],
      anomaly: ["Anomaly Detection", "Summarize anomaly counts, affected fields, and detection rules."],
      anomalyTable: ["Anomaly Detail Table", "Review every anomaly row, direction, and possible explanation."],
      cleaning: ["Data Cleaning", "Remove duplicates, fill missing values, standardize dates, and re-analyze."],
      export: ["Export Report", "Export the current AI report as Markdown or PDF."],
      history: ["Project History", "Save and switch between recently analyzed datasets."],
      chat: ["AI Dataset Q&A", "Call DeepSeek or use local summaries to answer dataset questions."],
    },
  },
};

const moduleOrder = ["fields", "quality", "charts", "chartBuilder", "anomaly", "anomalyTable", "cleaning", "export", "history", "chat"];

function AnalysisWorkspace({
  language,
  analysisState,
  projectHistory = [],
  onLoadSample,
  onLoadHistoryProject,
  onDatasetChange,
}) {
  const text = copy[language];
  const summary = analysisState?.datasetSummary;
  const [activeModule, setActiveModule] = useState("fields");
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const modules = useMemo(
    () =>
      moduleOrder.map((key, index) => ({
        key,
        index: String(index + 1).padStart(2, "0"),
        title: text.modules[key][0],
        description: text.modules[key][1],
      })),
    [text]
  );

  const openModule = (key) => {
    setActiveModule(key);
    window.requestAnimationFrame(() => {
      document.getElementById("analysis-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="mt-9 space-y-7">
      <motion.section
        className="analysis-module glass-panel rounded-[32px] p-7"
        initial={{ opacity: 0, y: 42 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyanline">{text.eyebrow}</p>
        <h3 className="mt-3 font-display text-4xl font-bold text-white">{summary ? text.title : text.emptyTitle}</h3>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          {summary ? text.description : text.emptyDescription}
        </p>

        <div className="mt-7 grid grid-cols-5 gap-4">
          {buildMetrics(summary, analysisState, text.metrics).map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-sky-100/80 bg-white/48 p-5 shadow-lg shadow-sky-100/40">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-cyanline">{metric.label}</div>
              <div className="mt-4 text-3xl font-bold text-slate-800">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="glass-icon-grid mt-7">
          {modules.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-label={item.title}
              onClick={() => openModule(item.key)}
              className={`glass-icon-card glass-icon-card--${item.key} group ${activeModule === item.key ? "is-active" : ""}`}
            >
              <span className="glass-icon-back" />
              <span className="glass-icon-front">
                <GlassIcon type={item.key} />
              </span>
              <span className="glass-icon-label">{item.title}</span>
            </button>
          ))}
        </div>
      </motion.section>

      <div id="analysis-detail" className="scroll-mt-28">
        {summary ? (
          renderActiveModule({
            activeModule,
            language,
            analysisState,
            selectedRecommendation,
            setSelectedRecommendation,
            projectHistory,
            onLoadHistoryProject,
            onDatasetChange,
          })
        ) : (
          <EmptyAnalysisBridge text={text} onLoadSample={onLoadSample} />
        )}
      </div>
    </div>
  );
}

function EmptyAnalysisBridge({ text, onLoadSample }) {
  const scrollToUpload = () => {
    document.getElementById("insights")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <motion.section
      className="analysis-module empty-bridge-panel rounded-[32px] p-7"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <div className="grid grid-cols-[0.82fr_1.18fr] gap-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyanline">Dataset Bridge</p>
          <h3 className="mt-3 font-display text-4xl font-bold text-ink">{text.bridgeTitle}</h3>
          <p className="mt-4 text-base leading-7 text-slate-500">{text.bridgeDescription}</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <button type="button" onClick={scrollToUpload} className="gradient-button rounded-full px-7 py-3 text-sm font-bold text-white transition hover:scale-[1.03]">
              {text.upload}
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className="rounded-full border border-sky-200/80 bg-white/50 px-7 py-3 text-sm font-bold text-slate-700 transition hover:border-[#0ea5c6] hover:bg-[#0ea5c6] hover:text-white"
            >
              {text.sample}
            </button>
          </div>
        </div>

        <div className="empty-bridge-flow">
          {text.bridgeSteps.map((step, index) => (
            <div key={step} className="empty-bridge-node">
              <span className="font-mono text-xs text-cyanline">0{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function renderActiveModule({
  activeModule,
  language,
  analysisState,
  selectedRecommendation,
  setSelectedRecommendation,
  projectHistory,
  onLoadHistoryProject,
  onDatasetChange,
}) {
  const props = { language };

  const moduleMap = {
    fields: <FieldIntelligence {...props} fields={analysisState?.fieldInsights || []} />,
    quality: <DataQualityPanel {...props} issues={analysisState?.qualityIssues || []} />,
    charts: (
      <ChartRecommendationPanel
        {...props}
        recommendations={analysisState?.chartRecommendations || []}
        onSelectRecommendation={setSelectedRecommendation}
      />
    ),
    chartBuilder: (
      <ChartBuilderPanel
        {...props}
        rows={analysisState?.rows || []}
        recommendation={selectedRecommendation || analysisState?.chartRecommendations?.[0]}
      />
    ),
    anomaly: <AnomalyDetectionPanel {...props} anomalies={analysisState?.anomalies || []} />,
    anomalyTable: <AnomalyDetailTable {...props} details={analysisState?.anomalyDetails || []} />,
    cleaning: <DataCleaningPanel {...props} analysisState={analysisState} onDatasetChange={onDatasetChange} />,
    export: <ReportExportPanel {...props} analysisState={analysisState} />,
    history: <ProjectHistoryPanel {...props} history={projectHistory} onLoadHistoryProject={onLoadHistoryProject} />,
    chat: <DatasetChat {...props} analysisState={analysisState} />,
  };

  return moduleMap[activeModule] || moduleMap.fields;
}

function GlassIcon({ type }) {
  const paths = {
    fields: "M8 7h16M8 13h10M8 19h16M26 7h4M22 13h8M26 19h4",
    quality: "M18 6l10 4v7c0 7-4.5 11-10 13-5.5-2-10-6-10-13v-7l10-4zM13 18l3 3 7-8",
    charts: "M8 26V10M8 26h22M13 22v-6M19 22V9M25 22v-10",
    chartBuilder: "M7 25c4-10 8-10 12-4s7 5 10-6M8 8h20v20H8z",
    anomaly: "M18 6l13 23H5L18 6zM18 14v7M18 25h.01",
    anomalyTable: "M7 8h22v20H7V8zM7 14h22M7 20h22M14 8v20M22 8v20",
    cleaning: "M10 26l16-16M13 9l14 14M7 29l5-2 15-15-3-3L9 24l-2 5z",
    export: "M18 6v14M12 14l6 6 6-6M8 26h20v4H8z",
    history: "M18 7a11 11 0 1 1-9 4.7M8 7v6h6M18 12v7l5 3",
    chat: "M7 9h22v14H14l-7 5V9zM12 15h12M12 20h7",
  };

  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className="h-12 w-12">
      <path d={paths[type]} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function buildMetrics(summary, analysisState, labels) {
  return [
    { label: labels[0], value: summary?.rowCount ?? analysisState?.rowCount ?? 0 },
    { label: labels[1], value: summary?.columnCount ?? analysisState?.columns?.length ?? 0 },
    { label: labels[2], value: summary?.numericMetricCount ?? analysisState?.numericColumns?.length ?? 0 },
    { label: labels[3], value: summary?.qualityIssueCount ?? 0 },
    { label: labels[4], value: summary?.anomalyCount ?? analysisState?.anomalies?.length ?? 0 },
  ];
}

export default AnalysisWorkspace;
