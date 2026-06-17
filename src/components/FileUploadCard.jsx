import { useEffect, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { analyzeRows } from "../utils/dataAnalysis.js";

const copy = {
  zh: {
    step: "步骤 01",
    title: "数据集上传",
    badge: "CSV 就绪",
    drop: "上传你的 CSV",
    helper: "选择一个文件，快速生成数据画像、预览行数据，并准备 AI 反馈面板。",
    button: "上传数据集",
    sample: "加载示例数据",
    error: "CSV 文件解析失败，请尝试其他数据集。",
    meta: {
      file: "文件",
      rows: "行数",
      columns: "列数",
    },
    empty: "上传 CSV 或加载示例数据后，这里会展示前五行数据预览。",
  },
  en: {
    step: "Step 01",
    title: "Dataset upload",
    badge: "CSV ready",
    drop: "Drop in your CSV",
    helper: "Choose a file to generate a quick profile, preview rows, and prepare the AI feedback panel.",
    button: "Upload Dataset",
    sample: "Load Sample Dataset",
    error: "The CSV file could not be parsed. Please try another dataset.",
    meta: {
      file: "File",
      rows: "Rows",
      columns: "Columns",
    },
    empty: "Upload a CSV or load the sample dataset to preview the first five rows here.",
  },
};

function FileUploadCard({ language, analysisState, onAnalysisReady, onLoadSample }) {
  const text = copy[language];
  const [fileMeta, setFileMeta] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!analysisState?.rows?.length) {
      setFileMeta(null);
      setPreviewRows([]);
      return;
    }

    setFileMeta({
      name: analysisState.fileName || "Dataset",
      rows: analysisState.rowCount || analysisState.rows.length,
      columns: analysisState.columns?.length || Object.keys(analysisState.rows[0] || {}).length,
    });
    setPreviewRows(analysisState.rows.slice(0, 5));
  }, [analysisState]);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.filter((row) => Object.values(row).some((value) => value !== ""));
        const analysis = analyzeRows(rows);

        setFileMeta({
          name: file.name,
          rows: rows.length,
          columns: analysis.columns.length,
        });
        setPreviewRows(rows.slice(0, 5));
        onAnalysisReady({ rows, fileName: file.name, analysis });
      },
      error: () => {
        setError(text.error);
      },
    });
  };

  return (
    <motion.article
      className="stagger-card glass-panel border-glow-card min-h-[680px] rounded-[32px] p-8 transition duration-300 hover:scale-[1.01]"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyanline">{text.step}</p>
          <h3 className="mt-4 font-display text-4xl font-bold text-white">{text.title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
          {text.badge}
        </span>
      </div>

      <label className="upload-glow-zone mt-10 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-cyanline/35 bg-cyanline/[0.055] p-8 text-center transition hover:border-cyanline hover:bg-cyanline/[0.09]">
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        <span className="font-display text-3xl font-bold text-white">{text.drop}</span>
        <span className="mt-4 max-w-md text-base leading-7 text-slate-400">{text.helper}</span>
        <span className="gradient-button mt-8 rounded-full px-7 py-3 font-semibold text-white transition duration-300 hover:scale-[1.03]">
          {text.button}
        </span>
      </label>

      <button
        type="button"
        onClick={onLoadSample}
        className="mt-4 w-full rounded-full border border-sky-200/80 bg-white/45 px-6 py-3 font-semibold text-slate-700 transition hover:border-[#0ea5c6] hover:bg-[#0ea5c6] hover:text-white"
      >
        {text.sample}
      </button>

      {error && <p className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-600">{error}</p>}

      {fileMeta && previewRows.length ? (
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-3">
            <MetaItem label={text.meta.file} value={fileMeta.name} />
            <MetaItem label={text.meta.rows} value={fileMeta.rows} />
            <MetaItem label={text.meta.columns} value={fileMeta.columns} />
          </div>

          <div className="mt-7 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-white/[0.06] text-slate-300">
                <tr>
                  {Object.keys(previewRows[0] || {}).slice(0, 4).map((column) => (
                    <th key={column} className="truncate px-4 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-400">
                {previewRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.keys(previewRows[0] || {}).slice(0, 4).map((column) => (
                      <td key={column} className="truncate px-4 py-3">
                        {String(row[column] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-slate-400">
          {text.empty}
        </div>
      )}
    </motion.article>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-3 truncate text-lg font-bold text-white">{value}</div>
    </div>
  );
}

export default FileUploadCard;
