import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Translations ─── */
const t = {
  en: {
    dir: "ltr",
    nav: {
      brand: "AxiomeVault",
      cta: "Start Analyzing",
      companyCta: "For companies",
    },
    hero: {
      badge: "Privacy-First · Blockchain-Verified",
      title: ["Analyze Documents.", "Trust the Result."],
      sub: "AI-powered document analysis that anonymizes your sensitive data locally before it ever leaves your browser.",
      cta: "Analyze Your Document",
      ctaSub: "No account required",
    },
    services: {
      label: "What We Do",
      title: "End-to-end document trust",
      items: [
        {
          icon: "⚡",
          title: "Local Anonymization",
          desc: "Names, IDs, addresses, phone numbers — all redacted in-browser using Moroccan-specific pattern recognition before any data leaves your device.",
        },
        {
          icon: "🔐",
          title: "Blockchain Proof",
          desc: "A SHA-256 fingerprint of your document is logged immutably on the Ethereum Sepolia network, creating a tamper-proof audit trail.",
        },
        {
          icon: "🤖",
          title: "AI Analysis",
          desc: "Llama 3 via Groq analyzes the anonymized version — surfacing document type, key clauses, risks, and recommendations.",
        },
        {
          icon: "🏅",
          title: "Trust Certificate",
          desc: "Download a verifiable PDF certificate containing the document hash, anonymization count, and Etherscan proof URL.",
        },
      ],
    },
    flow: {
      label: "How It Works",
      title: "Five steps. Zero exposure.",
      steps: [
        {
          n: "01",
          title: "Upload",
          desc: "Drop a PDF or TXT — it never leaves your browser unprotected.",
        },
        {
          n: "02",
          title: "Anonymize",
          desc: "PII is stripped locally using regex tuned for Moroccan documents.",
        },
        {
          n: "03",
          title: "Hash & Prove",
          desc: "SHA-256 fingerprint logged on-chain via smart contract.",
        },
        {
          n: "04",
          title: "AI Insight",
          desc: "Anonymized text analyzed by Llama 3 in multiple languages.",
        },
        {
          n: "05",
          title: "Certify",
          desc: "Download your blockchain-backed trust certificate.",
        },
      ],
    },
    trust: {
      label: "Security",
      title: "Built for trust",
      items: [
        { stat: "100%", label: "Client-side anonymization" },
        { stat: "SHA-256", label: "Cryptographic integrity" },
        { stat: "On-chain", label: "Immutable proof of process" },
        { stat: "EN·FR·AR", label: "Multilingual analysis" },
      ],
    },
    footer: {
      tagline: "Privacy-first AI document trust layer.",
      copy: "© 2026 AxiomeVault. Built for Moroccan legal & administrative documents.",
    },
    langLabel: "Language",
  },
  fr: {
    dir: "ltr",
    nav: {
      brand: "AxiomeVault",
      cta: "Commencer",
      companyCta: "Espace entreprises",
    },
    hero: {
      badge: "Confidentialité d'abord · Vérifié par blockchain",
      title: ["Analysez vos documents.", "Faites confiance au résultat."],
      sub: "Analyse de documents par IA qui anonymise vos données sensibles localement avant qu'elles ne quittent votre navigateur.",
      cta: "Analyser votre document",
      ctaSub: "Aucun compte requis",
    },
    services: {
      label: "Ce que nous faisons",
      title: "Confiance documentaire de bout en bout",
      items: [
        {
          icon: "⚡",
          title: "Anonymisation locale",
          desc: "Noms, CIN, adresses, numéros de téléphone — tout est masqué dans votre navigateur grâce à des patterns spécifiques au Maroc.",
        },
        {
          icon: "🔐",
          title: "Preuve blockchain",
          desc: "Une empreinte SHA-256 de votre document est enregistrée sur le réseau Ethereum Sepolia, créant une piste d'audit infalsifiable.",
        },
        {
          icon: "🤖",
          title: "Analyse par IA",
          desc: "Llama 3 via Groq analyse la version anonymisée — type de document, clauses clés, risques et recommandations.",
        },
        {
          icon: "🏅",
          title: "Certificat de confiance",
          desc: "Téléchargez un certificat PDF vérifiable contenant le hash du document, le compte d'anonymisation et la preuve Etherscan.",
        },
      ],
    },
    flow: {
      label: "Comment ça marche",
      title: "Cinq étapes. Zéro exposition.",
      steps: [
        {
          n: "01",
          title: "Importation",
          desc: "Déposez un PDF ou TXT — il ne quitte jamais votre navigateur sans protection.",
        },
        {
          n: "02",
          title: "Anonymisation",
          desc: "Les données personnelles sont supprimées localement avec des regex adaptées aux documents marocains.",
        },
        {
          n: "03",
          title: "Empreinte & preuve",
          desc: "L'empreinte SHA-256 est enregistrée on-chain via contrat intelligent.",
        },
        {
          n: "04",
          title: "Analyse IA",
          desc: "Le texte anonymisé est analysé par Llama 3 en plusieurs langues.",
        },
        {
          n: "05",
          title: "Certification",
          desc: "Téléchargez votre certificat de confiance ancré dans la blockchain.",
        },
      ],
    },
    trust: {
      label: "Sécurité",
      title: "Conçu pour la confiance",
      items: [
        { stat: "100%", label: "Anonymisation côté client" },
        { stat: "SHA-256", label: "Intégrité cryptographique" },
        { stat: "On-chain", label: "Preuve de processus immuable" },
        { stat: "EN·FR·AR", label: "Analyse multilingue" },
      ],
    },
    footer: {
      tagline:
        "Couche de confiance documentaire IA, axée sur la confidentialité.",
      copy: "© 2026 AxiomeVault. Conçu pour les documents juridiques et administratifs marocains.",
    },
    langLabel: "Langue",
  },
  ar: {
    dir: "rtl",
    nav: { brand: "AxiomeVault", cta: "ابدأ التحليل", companyCta: "للشركات" },
    hero: {
      badge: "الخصوصية أولاً · موثق بالبلوكشين",
      title: ["حلل مستنداتك.", "ثق بالنتيجة."],
      sub: "تحليل المستندات بالذكاء الاصطناعي مع إخفاء بياناتك الحساسة محلياً قبل مغادرة متصفحك.",
      cta: "حلل مستندك",
      ctaSub: "لا يلزم حساب",
    },
    services: {
      label: "ما نقدمه",
      title: "ثقة وثائقية شاملة",
      items: [
        {
          icon: "⚡",
          title: "إخفاء هوية محلي",
          desc: "الأسماء وبطاقات الهوية والعناوين وأرقام الهاتف — يتم حذفها جميعاً داخل المتصفح باستخدام أنماط مخصصة للمستندات المغربية.",
        },
        {
          icon: "🔐",
          title: "إثبات البلوكشين",
          desc: "يتم تسجيل بصمة SHA-256 لمستندك بشكل دائم على شبكة Ethereum Sepolia مما يخلق مساراً تدقيقياً غير قابل للتلاعب.",
        },
        {
          icon: "🤖",
          title: "تحليل الذكاء الاصطناعي",
          desc: "يحلل Llama 3 عبر Groq النسخة المجهولة — نوع المستند والبنود الرئيسية والمخاطر والتوصيات.",
        },
        {
          icon: "🏅",
          title: "شهادة الثقة",
          desc: "حمّل شهادة PDF قابلة للتحقق تحتوي على بصمة المستند وعدد العناصر المجهولة وعنوان إثبات Etherscan.",
        },
      ],
    },
    flow: {
      label: "كيف يعمل",
      title: "خمس خطوات. لا كشف.",
      steps: [
        {
          n: "01",
          title: "رفع الملف",
          desc: "أسقط ملف PDF أو TXT — لن يغادر متصفحك بدون حماية.",
        },
        {
          n: "02",
          title: "إخفاء الهوية",
          desc: "يتم حذف البيانات الشخصية محلياً باستخدام أنماط مخصصة للمستندات المغربية.",
        },
        {
          n: "03",
          title: "البصمة والإثبات",
          desc: "يتم تسجيل بصمة SHA-256 على البلوكشين عبر عقد ذكي.",
        },
        {
          n: "04",
          title: "رؤية الذكاء الاصطناعي",
          desc: "يحلل Llama 3 النص المجهول بلغات متعددة.",
        },
        {
          n: "05",
          title: "الاعتماد",
          desc: "حمّل شهادة ثقتك المرتكزة على البلوكشين.",
        },
      ],
    },
    trust: {
      label: "الأمان",
      title: "مبني للثقة",
      items: [
        { stat: "100%", label: "إخفاء هوية على جهازك" },
        { stat: "SHA-256", label: "تكامل مشفر" },
        { stat: "On-chain", label: "إثبات عملية غير قابل للتغيير" },
        { stat: "EN·FR·AR", label: "تحليل متعدد اللغات" },
      ],
    },
    footer: {
      tagline: "طبقة ثقة وثائقية بالذكاء الاصطناعي مع أولوية للخصوصية.",
      copy: "© 2026 AxiomeVault. مصمم للوثائق القانونية والإدارية المغربية.",
    },
    langLabel: "اللغة",
  },
};

/* ─── Language Toggle ─── */
function LangToggle({ lang, onChange }) {
  const langs = ["en", "fr", "ar"];
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 8,
        padding: "3px",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          style={{
            padding: "5px 13px",
            borderRadius: 6,
            border: "none",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "all 0.2s",
            background: lang === l ? "rgba(96,165,250,0.2)" : "transparent",
            color: lang === l ? "#60a5fa" : "rgba(255,255,255,0.45)",
            fontFamily: "inherit",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ─── Service Card ─── */
function ServiceCard({ icon, title, desc, index }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    gsap.fromTo(
      el,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        delay: index * 0.12,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "2rem",
        transition: "border-color 0.3s, transform 0.3s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(96,165,250,0.4)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          fontSize: 28,
          marginBottom: 16,
          width: 52,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(96,165,250,0.1)",
          borderRadius: 12,
          border: "1px solid rgba(96,165,250,0.2)",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: "#e2e8f0",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "rgba(148,163,184,0.85)",
          lineHeight: 1.75,
        }}
      >
        {desc}
      </div>
    </div>
  );
}

/* ─── Step Row ─── */
function StepRow({ n, title, desc, isLast, dir }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { x: dir === "rtl" ? 50 : -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      },
    );
  }, [dir]);

  return (
    <div
      ref={ref}
      style={{ display: "flex", gap: 24, alignItems: "flex-start" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1e40af, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#bfdbfe",
            letterSpacing: "0.05em",
            flexShrink: 0,
          }}
        >
          {n}
        </div>
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 40,
              background:
                "linear-gradient(to bottom, rgba(59,130,246,0.5), rgba(59,130,246,0.05))",
              margin: "8px 0",
            }}
          />
        )}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 32 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#e2e8f0",
            marginBottom: 6,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(148,163,184,0.8)",
            lineHeight: 1.7,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

/* ─── Main LandingPage ─── */
export default function LandingPage({
  lang,
  setLang,
  onEnter,
  onCompanyMode,
  onDevDashboard,
}) {
  const copy = t[lang] || t.en;
  const dir = copy.dir;

  /* ── Refs ── */
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const h1Ref = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const canvasRef = useRef(null);
  const tlRef = useRef(null);

  /* ── Hero entrance ── */
  useEffect(() => {
    if (tlRef.current) tlRef.current.kill();
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;

    tl.fromTo(
      badgeRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
    )
      .fromTo(
        h1Ref.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.3",
      )
      .fromTo(
        subRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.5",
      )
      .fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.4",
      );

    return () => tl.kill();
  }, [lang]);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const particles = [];
    const N = 55;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${p.alpha})`;
        ctx.fill();
      });
      // Connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${0.07 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Styles ── */
  const styles = {
    page: {
      background: "#060a14",
      color: "#e2e8f0",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      minHeight: "100vh",
      overflowX: "hidden",
      direction: dir,
    },
    nav: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 clamp(1.5rem,5vw,4rem)",
      height: 64,
      background: "rgba(6,10,20,0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    brand: {
      fontSize: 18,
      fontWeight: 700,
      background: "linear-gradient(135deg, #60a5fa, #818cf8)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.02em",
    },
    hero: {
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "120px clamp(1.5rem,8vw,8rem) 80px",
      overflow: "hidden",
    },
    section: {
      padding: "clamp(4rem,10vh,7rem) clamp(1.5rem,8vw,8rem)",
      maxWidth: 1100,
      margin: "0 auto",
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "#60a5fa",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: "clamp(1.8rem,4vw,2.6rem)",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.03em",
      color: "#f1f5f9",
      marginBottom: "3rem",
    },
  };

  return (
    <div style={styles.page}>
      {/* ── Particle bg ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── Radial glow ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,64,175,0.18) 0%, transparent 70%)",
        }}
      />

      {/* ── Nav ── */}
      <nav style={styles.nav}>
        <div style={styles.brand}>🔐 {copy.nav.brand}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LangToggle lang={lang} onChange={setLang} />
          <button
            onClick={() => onDevDashboard?.()}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid rgba(96,165,250,0.2)",
              background: "rgba(96,165,250,0.06)",
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.04em",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(96,165,250,0.12)";
              e.currentTarget.style.borderColor = "rgba(96,165,250,0.4)";
              e.currentTarget.style.color = "#93c5fd";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(96,165,250,0.06)";
              e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)";
              e.currentTarget.style.color = "#475569";
            }}
          >
            Dev
          </button>
          <button
            onClick={() => onCompanyMode?.()}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid rgba(96,165,250,0.35)",
              background: "rgba(96,165,250,0.08)",
              color: "#93c5fd",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(96,165,250,0.14)";
              e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(96,165,250,0.08)";
              e.currentTarget.style.borderColor = "rgba(96,165,250,0.35)";
            }}
          >
            {copy.nav.companyCta}
          </button>
          <button
            onClick={onEnter}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
              transition: "opacity 0.2s, transform 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = 0.88;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = 1;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {copy.nav.cta}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{ ...styles.hero, position: "relative", zIndex: 1 }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `
            linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 70% 80% at 50% 50%, black, transparent)",
          }}
        />

        <div
          ref={badgeRef}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 100,
            background: "rgba(96,165,250,0.1)",
            border: "1px solid rgba(96,165,250,0.25)",
            fontSize: 12,
            color: "#93c5fd",
            letterSpacing: "0.06em",
            fontWeight: 500,
            marginBottom: 28,
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#60a5fa",
              display: "inline-block",
            }}
          />
          {copy.hero.badge}
        </div>

        <h1
          ref={h1Ref}
          style={{
            fontSize: "clamp(2.8rem,7vw,5.5rem)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.04em",
            marginBottom: 24,
            position: "relative",
            zIndex: 1,
            maxWidth: 860,
          }}
        >
          <span style={{ color: "#f1f5f9" }}>{copy.hero.title[0]} </span>
          <span
            style={{
              background:
                "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {copy.hero.title[1]}
          </span>
        </h1>

        <p
          ref={subRef}
          style={{
            fontSize: "clamp(1rem,2vw,1.2rem)",
            color: "rgba(148,163,184,0.9)",
            maxWidth: 600,
            lineHeight: 1.8,
            marginBottom: 40,
            position: "relative",
            zIndex: 1,
          }}
        >
          {copy.hero.sub}
        </p>

        <div
          ref={ctaRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            zIndex: 1,
          }}
        >
          <button
            onClick={onEnter}
            style={{
              padding: "16px 44px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.01em",
              boxShadow: "0 8px 40px rgba(37,99,235,0.4)",
              transition: "all 0.25s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(37,99,235,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 8px 40px rgba(37,99,235,0.4)";
            }}
          >
            {copy.hero.cta} →
          </button>
          <span
            style={{
              fontSize: 12,
              color: "rgba(148,163,184,0.5)",
              letterSpacing: "0.04em",
            }}
          >
            {copy.hero.ctaSub}
          </span>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: 0.35,
            zIndex: 1,
          }}
        >
          <div
            style={{ fontSize: 11, letterSpacing: "0.12em", color: "#94a3b8" }}
          >
            SCROLL
          </div>
          <div
            style={{
              width: 1,
              height: 40,
              background: "linear-gradient(to bottom, #60a5fa, transparent)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ ...styles.section, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
          <div style={styles.sectionLabel}>{copy.services.label}</div>
          <div style={styles.sectionTitle}>{copy.services.title}</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {copy.services.items.map((s, i) => (
            <ServiceCard
              key={i}
              index={i}
              icon={s.icon}
              title={s.title}
              desc={s.desc}
            />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...styles.section, position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          {/* Left: title */}
          <div style={{ position: "sticky", top: 100 }}>
            <div style={styles.sectionLabel}>{copy.flow.label}</div>
            <div style={{ ...styles.sectionTitle, marginBottom: 16 }}>
              {copy.flow.title}
            </div>
            <p
              style={{
                fontSize: 14,
                color: "rgba(148,163,184,0.7)",
                lineHeight: 1.8,
              }}
            >
              {lang === "ar"
                ? "كل خطوة مصممة لضمان بقاء بياناتك الحساسة دائماً تحت سيطرتك."
                : lang === "fr"
                  ? "Chaque étape est conçue pour garder vos données sensibles sous votre contrôle."
                  : "Every step is engineered to keep your sensitive data always under your control."}
            </p>
          </div>
          {/* Right: steps */}
          <div style={{ paddingTop: 8 }}>
            {copy.flow.steps.map((step, i) => (
              <StepRow
                key={i}
                n={step.n}
                title={step.title}
                desc={step.desc}
                isLast={i === copy.flow.steps.length - 1}
                dir={dir}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STATS ── */}
      <section style={{ ...styles.section, position: "relative", zIndex: 1 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 24,
            padding: "clamp(2rem,5vw,4rem)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner glow */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.12)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={styles.sectionLabel}>{copy.trust.label}</div>
            <div style={styles.sectionTitle}>{copy.trust.title}</div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 24,
            }}
          >
            {copy.trust.items.map((item, i) => (
              <TrustStat
                key={i}
                stat={item.stat}
                label={item.label}
                index={i}
              />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
            <button
              onClick={onEnter}
              style={{
                padding: "14px 40px",
                borderRadius: 12,
                border: "1px solid rgba(96,165,250,0.35)",
                background: "rgba(96,165,250,0.08)",
                color: "#60a5fa",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.25s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(96,165,250,0.16)";
                e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(96,165,250,0.08)";
                e.currentTarget.style.borderColor = "rgba(96,165,250,0.35)";
              }}
            >
              {copy.nav.cta} →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "3rem clamp(1.5rem,8vw,8rem)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
            background: "linear-gradient(135deg, #60a5fa, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🔐 {copy.nav.brand}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(148,163,184,0.6)",
            marginBottom: 6,
          }}
        >
          {copy.footer.tagline}
        </div>
        <div style={{ fontSize: 12, color: "rgba(100,116,139,0.7)" }}>
          {copy.footer.copy}
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.35} 50%{opacity:0.8} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #060a14; }
      `}</style>
    </div>
  );
}

/* ─── TrustStat ─── */
function TrustStat({ stat, label, index }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      },
    );
  }, [index]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: "clamp(1.6rem,4vw,2.4rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #60a5fa, #818cf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}
      >
        {stat}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(148,163,184,0.7)",
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </div>
  );
}
