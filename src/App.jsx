import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Hero from "./components/Hero.jsx";
import { analyzeRows } from "./utils/dataAnalysis.js";
import { sampleFileName, sampleRows } from "./utils/sampleData.js";

const historyKey = "aida-project-history";
const ProjectShowcase = lazy(() => import("./components/ProjectShowcase.jsx"));
const ContactSection = lazy(() => import("./components/ContactSection.jsx"));

function App() {
  const appRef = useRef(null);
  const [analysisState, setAnalysisState] = useState(null);
  const [projectHistory, setProjectHistory] = useState(() => readHistory());
  const [language, setLanguage] = useState("zh");

  useEffect(() => {
    let context;
    let isCancelled = false;

    async function setupAnimations() {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (isCancelled) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    context = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(".opening-overlay", { autoAlpha: 0, pointerEvents: "none" });
        return;
      }

      const opening = gsap.timeline({ defaults: { ease: "power3.out" } });

      opening
        .set(".opening-overlay", { autoAlpha: 1 })
        .fromTo(".opening-word", { y: 86, opacity: 0, filter: "blur(14px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, stagger: 0.08 })
        .fromTo(".opening-line", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.82 }, "-=0.42")
        .to(".opening-panel-top", { yPercent: -100, duration: 1.05, ease: "expo.inOut" }, "+=0.12")
        .to(".opening-panel-bottom", { yPercent: 100, duration: 1.05, ease: "expo.inOut" }, "<")
        .to(".opening-overlay", { autoAlpha: 0, pointerEvents: "none", duration: 0.2 })
        .fromTo(".hero-title", { y: 110, scaleY: 1.22, opacity: 0, filter: "blur(12px)" }, { y: 0, scaleY: 1, opacity: 1, filter: "blur(0px)", duration: 1.05, ease: "expo.out" }, "-=0.88")
        .fromTo(".hero-copy, .hero-actions", { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.72, stagger: 0.1 }, "-=0.58")
        .fromTo(".hero-preview", { x: 90, scale: 0.94, opacity: 0 }, { x: 0, scale: 1, opacity: 1, duration: 0.9 }, "-=0.62");

      gsap.utils.toArray(".section-heading").forEach((heading) => {
        gsap.fromTo(
          heading.querySelectorAll(".reveal-copy"),
          { y: 72, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.95,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 78%",
              once: true,
            },
          }
        );
      });

      gsap.utils.toArray(".stagger-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 96, opacity: 0, scale: 0.965 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.92,
            delay: index % 2 === 0 ? 0 : 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 84%",
              once: true,
            },
          }
        );
      });

      gsap.utils.toArray(".parallax-layer").forEach((layer) => {
        gsap.to(layer, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: layer.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
    }, appRef);

    }

    setupAnimations();

    return () => {
      isCancelled = true;
      context?.revert();
    };
  }, []);

  const applyDataset = (rows, fileName, source = "upload") => {
    const analysis = analyzeRows(rows);
    const nextState = {
      ...analysis,
      fileName,
      source,
      updatedAt: new Date().toISOString(),
    };
    setAnalysisState(nextState);
    saveProject(nextState, setProjectHistory);
  };

  const handleAnalysisReady = ({ rows, fileName }) => {
    applyDataset(rows, fileName, "upload");
  };

  const loadSampleDataset = () => {
    applyDataset(sampleRows, sampleFileName, "sample");
  };

  const loadHistoryProject = (project) => {
    setAnalysisState(project);
  };

  const toggleLanguage = () => {
    setLanguage((current) => (current === "zh" ? "en" : "zh"));
  };

  return (
    <main ref={appRef} className="light-theme min-h-screen bg-ink text-slate-50">
      <div className="opening-overlay fixed inset-0 z-[100] overflow-hidden bg-ink text-white">
        <div className="opening-panel-top absolute inset-x-0 top-0 h-1/2 bg-[#05070f]" />
        <div className="opening-panel-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#05070f]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="overflow-hidden px-10 text-center">
            <div className="font-mono text-sm uppercase tracking-[0.46em] text-cyanline">
              <span className="opening-word inline-block">AI</span>{" "}
              <span className="opening-word inline-block">DATA</span>{" "}
              <span className="opening-word inline-block">STUDIO</span>
            </div>
            <div className="opening-line mx-auto mt-6 h-px w-[520px] max-w-[72vw] bg-gradient-to-r from-transparent via-cyanline to-transparent" />
          </div>
        </div>
      </div>
      <Hero language={language} onToggleLanguage={toggleLanguage} />
      <LazySection id="workflow" minHeight="1000px">
        <Suspense fallback={<SectionFallback />}>
          <ProjectShowcase
            language={language}
            analysisState={analysisState}
            projectHistory={projectHistory}
            onAnalysisReady={handleAnalysisReady}
            onLoadSample={loadSampleDataset}
            onLoadHistoryProject={loadHistoryProject}
            onDatasetChange={applyDataset}
          />
        </Suspense>
      </LazySection>
      <LazySection id="contact" minHeight="760px">
        <Suspense fallback={<SectionFallback />}>
          <ContactSection language={language} />
        </Suspense>
      </LazySection>
    </main>
  );
}

function LazySection({ id, minHeight, children }) {
  const ref = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "640px 0px", threshold: 0.01 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  if (!isReady) {
    return <section id={id} ref={ref} style={{ minHeight }} aria-hidden="true" />;
  }

  return <div ref={ref}>{children}</div>;
}

function SectionFallback() {
  return <section className="min-h-screen bg-[#f6fdff]" aria-hidden="true" />;
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  } catch {
    return [];
  }
}

function saveProject(project, setProjectHistory) {
  const compactProject = {
    ...project,
    rows: project.rows.slice(0, 500),
  };
  setProjectHistory((current) => {
    const next = [compactProject, ...current.filter((item) => item.updatedAt !== compactProject.updatedAt)].slice(0, 8);
    localStorage.setItem(historyKey, JSON.stringify(next));
    return next;
  });
}

export default App;
