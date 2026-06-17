import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { answerDatasetQuestion, buildSuggestedQuestions } from "../utils/aiMock.js";
import { askDeepSeek } from "../utils/deepseekClient.js";

const copy = {
  zh: {
    eyebrow: "Ask AI About This Dataset",
    title: "数据集 AI 问答",
    description: "优先调用本地 DeepSeek 代理接口，根据字段、质量、异常和统计摘要回答问题；接口不可用时自动回退本地模拟。",
    placeholder: "例如：这个数据集有什么数据质量问题？",
    button: "提问",
    asking: "分析中",
    empty: "请先上传 CSV，或输入一个关于当前数据集的问题。",
    userLabel: "你",
    aiLabel: "AI Analyst",
    deepseekBadge: "DeepSeek 实时回答",
    mockBadge: "本地模拟回答",
    fallback: "DeepSeek 暂时不可用，已使用本地模拟分析回答。",
  },
  en: {
    eyebrow: "Ask AI About This Dataset",
    title: "AI Dataset Q&A",
    description:
      "Ask questions through the local DeepSeek proxy first. If the API is unavailable, the interface falls back to local analysis.",
    placeholder: "Example: Which column has the most missing values?",
    button: "Ask",
    asking: "Asking",
    empty: "Upload a CSV or ask a question about the current dataset.",
    userLabel: "You",
    aiLabel: "AI Analyst",
    deepseekBadge: "DeepSeek live answer",
    mockBadge: "Local mock answer",
    fallback: "DeepSeek is unavailable, so this answer was generated locally.",
  },
};

function DatasetChat({ language, analysisState }) {
  const text = copy[language];
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const suggestions = useMemo(() => buildSuggestedQuestions(language), [language]);

  const askQuestion = async (inputQuestion = question) => {
    const trimmed = inputQuestion.trim();
    if (!trimmed || isAsking) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setQuestion("");
    setIsAsking(true);

    try {
      const result = await askDeepSeek({
        question: trimmed,
        datasetSummary: analysisState?.datasetSummary,
        fieldInsights: analysisState?.fieldInsights,
        qualityIssues: analysisState?.qualityIssues,
        anomalies: analysisState?.anomalies,
        language,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.answer,
          source: "deepseek",
        },
      ]);
    } catch (error) {
      const fallbackAnswer = answerDatasetQuestion({
        question: trimmed,
        datasetSummary: analysisState?.datasetSummary,
        fieldInsights: analysisState?.fieldInsights,
        qualityIssues: analysisState?.qualityIssues,
        anomalies: analysisState?.anomalies,
        stats: analysisState?.stats,
        language,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${fallbackAnswer}\n\n${text.fallback}`,
          source: "mock",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
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

      <div className="mt-7 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[24px] border border-sky-100/80 bg-white/45 p-5">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-cyanline">Suggested questions</div>
          <div className="mt-4 space-y-3">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => askQuestion(item)}
                disabled={isAsking}
                className="w-full rounded-2xl border border-sky-100/80 bg-white/55 px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:border-[#0ea5c6] hover:bg-[#0ea5c6] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-sky-100/80 bg-white/45 p-5">
          <div className="max-h-[320px] space-y-4 overflow-auto pr-2">
            {messages.length ? (
              messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyanline">
                    {message.role === "user" ? text.userLabel : text.aiLabel}
                    {message.role === "assistant" && (
                      <span className="ml-2 rounded-full bg-sky-50 px-2 py-1 text-[9px] text-slate-500">
                        {message.source === "deepseek" ? text.deepseekBadge : text.mockBadge}
                      </span>
                    )}
                  </div>
                  <div
                    className={`inline-block max-w-[82%] whitespace-pre-line rounded-3xl px-5 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-[#0ea5c6] text-white"
                        : "border border-sky-100/80 bg-sky-50/80 text-slate-700"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl bg-sky-50/70 p-5 text-sm leading-6 text-slate-500">{text.empty}</div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") askQuestion();
              }}
              placeholder={text.placeholder}
              className="min-w-0 flex-1 rounded-full border border-sky-100/90 bg-white/75 px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0ea5c6] focus:ring-4 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={() => askQuestion()}
              disabled={isAsking}
              className="gradient-button rounded-full px-7 py-3 text-sm font-bold text-white transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAsking ? text.asking : text.button}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default DatasetChat;
