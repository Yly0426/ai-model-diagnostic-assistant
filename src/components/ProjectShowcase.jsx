import { motion } from "framer-motion";
import FileUploadCard from "./FileUploadCard.jsx";
import InsightCard from "./InsightCard.jsx";
import Iridescence from "./Iridescence.jsx";
import AnalysisWorkspace from "./AnalysisWorkspace.jsx";

const copy = {
  zh: {
    eyebrow: "AI 数据分析工作流",
    title: "上传数据，在同一个工作台获得专业分析反馈。",
  },
  en: {
    eyebrow: "AI Data Analysis Workflow",
    title: "Upload data. Get analyst-grade feedback in one workspace.",
  },
};

function ProjectShowcase({
  language,
  analysisState,
  projectHistory,
  onAnalysisReady,
  onLoadSample,
  onLoadHistoryProject,
  onDatasetChange,
}) {
  const text = copy[language];

  return (
    <section id="workflow" className="relative min-h-screen overflow-hidden px-10 py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(67,217,255,0.12),transparent_30rem),radial-gradient(circle_at_78%_60%,rgba(139,125,255,0.12),transparent_32rem)]" />
      <Iridescence
        className="parallax-layer opacity-90"
        color={[0.58, 0.89, 0.91]}
        amplitude={0.08}
        speed={0.72}
        mouseReact={false}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,253,255,0.5)_0%,rgba(241,250,255,0.08)_44%,rgba(250,254,255,0.48)_100%)]" />

      <div className="relative z-10 mx-auto max-w-shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="section-heading mb-12 flex items-end justify-between gap-8"
        >
          <div>
            <p className="reveal-copy font-mono text-sm uppercase tracking-[0.28em] text-cyanline">{text.eyebrow}</p>
            <h2 className="reveal-copy mt-5 max-w-4xl font-display text-6xl font-bold tracking-[-0.035em] text-white">
              {text.title}
            </h2>
          </div>
        </motion.div>

        <div id="insights" className="grid grid-cols-[0.92fr_1.08fr] gap-7">
          <FileUploadCard
            language={language}
            analysisState={analysisState}
            onAnalysisReady={onAnalysisReady}
            onLoadSample={onLoadSample}
          />
          <InsightCard language={language} analysisState={analysisState} />
        </div>

        <AnalysisWorkspace
          language={language}
          analysisState={analysisState}
          projectHistory={projectHistory}
          onLoadSample={onLoadSample}
          onLoadHistoryProject={onLoadHistoryProject}
          onDatasetChange={onDatasetChange}
        />
      </div>
    </section>
  );
}

export default ProjectShowcase;
