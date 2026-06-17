import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const copy = {
  zh: {
    nav: [
      ["overview", "首页"],
      ["workflow", "工作流"],
      ["insights", "AI 洞察"],
      ["contact", "联系"],
    ],
    contact: "联系我",
    eyebrow: "AI + CSV 数据分析工作台",
    titleTop: "AI DATA",
    titleBottom: "ANALYST",
    badge: "Dashboard",
    demo: "Demo",
    subtitle: "上传数据集，快速发现趋势、异常与业务机会。",
    primary: "上传数据集",
    secondary: "查看工作流",
    lang: "EN",
    cards: [
      ["01", "CSV 上传", "解析表头、行数与样本数据"],
      ["02", "趋势识别", "自动选择数值字段生成图表"],
      ["03", "异常检测", "定位偏离均值的风险点"],
      ["04", "AI 报告", "输出清晰的业务建议"],
    ],
  },
  en: {
    nav: [
      ["overview", "Overview"],
      ["workflow", "Workflow"],
      ["insights", "AI Insights"],
      ["contact", "Contact"],
    ],
    contact: "Contact",
    eyebrow: "AI + CSV data analysis workspace",
    titleTop: "AI DATA",
    titleBottom: "ANALYST",
    badge: "Dashboard",
    demo: "Demo",
    subtitle: "Upload a dataset to surface trends, anomalies, and business opportunities.",
    primary: "Upload Dataset",
    secondary: "View Workflow",
    lang: "中",
    cards: [
      ["01", "CSV Upload", "Parse headers, rows, and sample data"],
      ["02", "Trend Scan", "Select numeric fields for charts"],
      ["03", "Anomaly Check", "Find values outside normal range"],
      ["04", "AI Report", "Generate clear business guidance"],
    ],
  },
};

function Hero({ language, onToggleLanguage }) {
  const text = copy[language];
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const updateDockState = () => {
      setIsDocked(window.scrollY > window.innerHeight * 0.82);
    };

    updateDockState();
    window.addEventListener("scroll", updateDockState, { passive: true });

    return () => window.removeEventListener("scroll", updateDockState);
  }, []);

  return (
    <section id="overview" className="relative min-h-screen overflow-hidden">
      <video
        className="reveal-media parallax-layer absolute inset-0 h-full w-full object-cover opacity-[0.86]"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=80"
      >
        <source src="/videos/hero-robot.mp4" type="video/mp4" />
      </video>

      <div className="video-vignette absolute inset-0" />
      <div className="data-grid absolute inset-x-0 top-0 h-[72vh] opacity-60" />

      <header
        className={`glass-nav-shell fixed left-1/2 top-6 z-50 w-[min(1180px,calc(100%-96px))] -translate-x-1/2 px-4 py-3 transition-all duration-500 ${
          isDocked ? "is-docked" : ""
        }`}
      >
        <div className="relative z-10 flex w-full items-center justify-between gap-5">
          <a href="#overview" className="glass-nav-logo">
            AIDA
          </a>

          <nav className="glass-nav-center">
            {text.nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="glass-nav-link">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onToggleLanguage} className="glass-nav-action">
              {text.lang}
            </button>
            <a href="#contact" className="glass-nav-action glass-nav-contact">
              {text.contact}
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-shell flex-col justify-center px-10 pb-32 pt-28">
        <motion.div
          className="max-w-[1060px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="hero-copy mb-7 inline-flex items-center gap-3 rounded-full border border-sky-200/80 bg-white/45 px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#0284a8] shadow-lg shadow-sky-200/20 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_16px_rgba(56,189,248,0.8)]" />
            {text.demo}
          </div>
          <h1 className="hero-title font-display text-[118px] font-black uppercase leading-[0.84] tracking-[-0.07em] text-[#082033]">
            <span className="block">{text.titleTop}</span>
            <span className="block">
              {text.titleBottom}
              <span className="ml-5 align-middle text-[38px] font-semibold normal-case tracking-[-0.03em] text-[#0ea5c6]">
                {text.badge}
              </span>
            </span>
          </h1>

          <p className="hero-copy mt-8 max-w-2xl text-2xl font-medium leading-10 text-slate-700">
            {text.subtitle}
          </p>

          <div className="hero-actions mt-10 flex items-center gap-5">
            <a
              href="#workflow"
              className="gradient-button rounded-full px-8 py-4 text-base font-bold text-white transition duration-300 hover:scale-[1.03]"
            >
              {text.primary}
            </a>
            <a
              href="#workflow"
              className="rounded-full border border-sky-200/80 bg-white/45 px-8 py-4 text-base font-semibold text-slate-700 shadow-lg shadow-sky-200/20 backdrop-blur-md transition duration-300 hover:border-[#0ea5c6] hover:bg-[#0ea5c6] hover:text-white"
            >
              {text.secondary}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero-preview absolute bottom-8 left-10 right-10 mx-auto grid max-w-[1500px] grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
        >
          {text.cards.map(([index, title, description]) => (
            <div
              key={index}
              className="feature-tile rounded-[28px] border border-white/65 bg-white/42 p-5 shadow-xl shadow-sky-200/20 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/70"
            >
              <div className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#0ea5c6]">{index}</div>
              <div className="mt-5 text-xl font-bold text-[#082033]">{title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
