import { motion } from "framer-motion";

const copy = {
  zh: {
    eyebrow: "Project History",
    title: "上传历史 / 项目管理",
    description: "从本地浏览器历史中切换最近分析过的数据集，适合演示多个项目案例。",
    empty: "暂无历史记录。上传或加载示例数据后会自动保存。",
    open: "打开",
    rows: "行",
    fields: "字段",
  },
  en: {
    eyebrow: "Project History",
    title: "Upload History / Project Management",
    description: "Switch between recently analyzed datasets stored in this browser.",
    empty: "No history yet. Upload or load a sample dataset to save one automatically.",
    open: "Open",
    rows: "rows",
    fields: "fields",
  },
};

function ProjectHistoryPanel({ language, history = [], onLoadHistoryProject }) {
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
      <h3 className="mt-3 font-display text-4xl font-bold text-ink">{text.title}</h3>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">{text.description}</p>

      {history.length ? (
        <div className="mt-7 grid gap-4 lg:grid-cols-4">
          {history.map((project) => (
            <button
              key={project.updatedAt}
              type="button"
              onClick={() => onLoadHistoryProject(project)}
              className="rounded-[24px] border border-sky-100/80 bg-white/45 p-5 text-left transition hover:-translate-y-1 hover:border-[#0ea5c6] hover:bg-white/70"
            >
              <h4 className="truncate text-lg font-bold text-slate-800">{project.fileName || "Dataset"}</h4>
              <p className="mt-3 text-sm text-slate-600">
                {project.rowCount} {text.rows} / {project.columns?.length || 0} {text.fields}
              </p>
              <span className="mt-5 inline-flex rounded-full bg-sky-50/80 px-4 py-2 text-xs font-bold text-[#0284a8]">
                {text.open}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[24px] border border-sky-100/80 bg-white/45 p-6 text-slate-500">{text.empty}</div>
      )}
    </motion.section>
  );
}

export default ProjectHistoryPanel;
