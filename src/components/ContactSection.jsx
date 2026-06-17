import { motion } from "framer-motion";
import Iridescence from "./Iridescence.jsx";

const contact = {
  wechat: "buleyi170",
  email: "2895005619@qq.com",
};

const copy = {
  zh: {
    eyebrow: "联系入口",
    title: "欢迎交流 AI 数据分析项目、前端作品与后续合作。",
    description:
      "当前项目已完成 CSV 上传、字段识别、质量诊断、图表生成、数据清洗、报告导出和 AI 问答能力，后续可继续接入真实后端、用户系统和项目存储。",
    wechat: "WeChat",
    email: "Email",
    top: "返回顶部",
    stack: "项目技术栈",
    active: "已启用",
  },
  en: {
    eyebrow: "Contact endpoint",
    title: "Let’s talk about AI analytics, frontend work, and future collaboration.",
    description:
      "This project now supports CSV upload, field intelligence, quality checks, chart building, data cleaning, report export, and AI dataset Q&A. It is ready for backend, user system, and project storage integration.",
    wechat: "WeChat",
    email: "Email",
    top: "Back to top",
    stack: "Project stack",
    active: "Active",
  },
};

function ContactSection({ language }) {
  const text = copy[language];

  return (
    <section id="contact" className="relative flex min-h-screen items-center overflow-hidden px-10 py-24">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fbfeff_0%,#effaff_46%,#f8fdff_100%)]" />
      <Iridescence
        className="parallax-layer opacity-65"
        color={[0.46, 0.76, 1]}
        amplitude={0.06}
        speed={0.58}
        mouseReact={false}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,254,255,0.72)_0%,rgba(239,250,255,0.28)_44%,rgba(248,253,255,0.82)_100%)]" />
      <div className="data-grid absolute inset-x-0 top-0 h-full opacity-50" />

      <motion.div
        className="section-heading relative z-10 mx-auto grid max-w-shell grid-cols-[1fr_0.72fr] items-center gap-16"
        initial={{ opacity: 0, y: 38 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div>
          <p className="reveal-copy font-mono text-sm uppercase tracking-[0.28em] text-cyanline">{text.eyebrow}</p>
          <h2 className="reveal-copy mt-6 max-w-4xl font-display text-7xl font-bold leading-[0.95] tracking-[-0.04em] text-white">
            {text.title}
          </h2>
          <p className="reveal-copy mt-8 max-w-3xl text-xl leading-9 text-slate-400">
            {text.description}
          </p>

          <div className="reveal-copy mt-10 grid max-w-3xl grid-cols-2 gap-4">
            <ContactItem label={text.wechat} value={contact.wechat} />
            <a
              href={`mailto:${contact.email}`}
              className="rounded-[28px] border border-sky-200/80 bg-white/45 px-6 py-5 transition hover:border-[#0ea5c6] hover:bg-[#0ea5c6] hover:text-white"
            >
              <span className="block font-mono text-xs uppercase tracking-[0.2em] text-cyanline">{text.email}</span>
              <strong className="mt-3 block text-xl text-slate-800">{contact.email}</strong>
            </a>
          </div>

          <div className="reveal-copy mt-6 flex items-center gap-5">
            <a href="#overview" className="gradient-button rounded-full px-8 py-4 font-bold text-white transition hover:scale-[1.03]">
              {text.top}
            </a>
          </div>
        </div>

        <div className="stagger-card glass-panel rounded-[32px] p-8">
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">{text.stack}</div>
          <div className="mt-8 space-y-4">
            {["React + Vite", "Tailwind CSS", "Framer Motion", "PapaParse", "Recharts"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.045] px-5 py-4">
                <span className="font-semibold text-white">{item}</span>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-cyanline">{text.active}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ContactItem({ label, value }) {
  return (
    <div className="rounded-[28px] border border-sky-200/80 bg-white/45 px-6 py-5">
      <span className="block font-mono text-xs uppercase tracking-[0.2em] text-cyanline">{label}</span>
      <strong className="mt-3 block text-xl text-slate-800">{value}</strong>
    </div>
  );
}

export default ContactSection;
