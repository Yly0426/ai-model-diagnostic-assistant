import { motion } from "framer-motion";
import { buildReportMarkdown } from "../utils/dataAnalysis.js";

const copy = {
  zh: {
    eyebrow: "Export AI Report",
    title: "导出分析报告",
    description: "将当前 AI 分析摘要导出为 Markdown 或 PDF，方便提交作品集、实习项目或业务复盘。",
    markdown: "导出 Markdown",
    pdf: "导出 PDF",
    disabled: "请先上传或加载示例数据。",
  },
  en: {
    eyebrow: "Export AI Report",
    title: "Export AI Report",
    description: "Export the current AI analysis summary as Markdown or PDF for portfolio, internship, or business review use.",
    markdown: "Export Markdown",
    pdf: "Export PDF",
    disabled: "Upload or load a sample dataset first.",
  },
};

function ReportExportPanel({ language, analysisState }) {
  const text = copy[language];
  const disabled = !analysisState?.datasetSummary;

  const exportMarkdown = () => {
    const markdown = buildReportMarkdown(analysisState, language);
    downloadFile(markdown, "ai-data-analysis-report.md", "text/markdown;charset=utf-8");
  };

  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const markdown = buildReportMarkdown(analysisState, language);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const lines = doc.splitTextToSize(markdown.replace(/^#+\s/gm, ""), 500);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(lines, 48, 48);
    doc.save("ai-data-analysis-report.pdf");
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

      <div className="mt-7 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={exportMarkdown}
          className="gradient-button rounded-full px-7 py-3 font-bold text-white transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {text.markdown}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={exportPdf}
          className="rounded-full border border-sky-200/80 bg-white/45 px-7 py-3 font-bold text-slate-700 transition hover:border-[#0ea5c6] hover:bg-[#0ea5c6] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {text.pdf}
        </button>
      </div>
      {disabled && <div className="mt-5 text-sm text-slate-500">{text.disabled}</div>}
    </motion.section>
  );
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default ReportExportPanel;
