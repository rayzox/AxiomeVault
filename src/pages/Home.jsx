import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, FileText, Scissors, Copy, Download, RefreshCw,
  Upload, AlertTriangle, Sparkles, Lock, Eye, EyeOff,
  ChevronRight, Globe, Link2, Hash, Calendar, DollarSign,
  Mail, Phone, CreditCard, Home as HomeIcon, MapPin, Building2,
  User, Plane, Loader2, ArrowUpDown, X
} from 'lucide-react';
import StepBar from '../components/StepBar';
import UploadZone from '../components/UploadZone';
import Certificate from '../components/Certificate';
import LanguageToggle from '../components/LanguageToggle';
import RedactionViewer from '../components/RedactionViewer';
import { nerAnonymize as anonymize, getRedactionSummary } from '../utils/nerAnonymizer';
import { hashDocument } from '../utils/hasher';
import { analyzeDocument } from '../utils/ai';
import { logToBlockchain } from '../utils/blockchain';
import { createAppError } from '../utils/errorHandler';

const ENTITY_CONFIG = {
  PERSON: { name: 'Names', color: '#f472b6', glow: 'rgba(244,114,182,0.25)', icon: User },
  LOCATION: { name: 'Locations', color: '#34d399', glow: 'rgba(52,211,153,0.25)', icon: MapPin },
  ORG: { name: 'Organizations', color: '#a78bfa', glow: 'rgba(167,139,250,0.25)', icon: Building2 },
  DATE: { name: 'Dates', color: '#fbbf24', glow: 'rgba(251,191,36,0.25)', icon: Calendar },
  AMOUNT: { name: 'Amounts', color: '#f87171', glow: 'rgba(248,113,113,0.25)', icon: DollarSign },
  EMAIL: { name: 'Emails', color: '#60a5fa', glow: 'rgba(96,165,250,0.25)', icon: Mail },
  PHONE: { name: 'Phones', color: '#2dd4bf', glow: 'rgba(45,212,191,0.25)', icon: Phone },
  CIN: { name: 'ID Numbers', color: '#fb923c', glow: 'rgba(251,146,60,0.25)', icon: Hash },
  ADDRESS: { name: 'Addresses', color: '#a3e635', glow: 'rgba(163,230,53,0.25)', icon: HomeIcon },
  PASSPORT: { name: 'Passports', color: '#e879f9', glow: 'rgba(232,121,249,0.25)', icon: Plane },
  CREDIT: { name: 'Cards', color: '#f43f5e', glow: 'rgba(244,63,94,0.25)', icon: CreditCard },
  IP: { name: 'IP Addresses', color: '#38bdf8', glow: 'rgba(56,189,248,0.25)', icon: Globe },
  URL: { name: 'URLs', color: '#818cf8', glow: 'rgba(129,140,248,0.25)', icon: Link2 },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function generateRedactionNarrative(spans, lang) {
  if (!spans?.length) {
    return lang === 'fr' ? 'Aucune donnée sensible détectée.' : lang === 'ar' ? 'لم يتم اكتشاف أي بيانات حساسة.' : 'No sensitive data detected.';
  }
  const counts = spans.reduce((acc, s) => { acc[s.label] = (acc[s.label] || 0) + 1; return acc; }, {});
  const items = Object.entries(counts).map(([label, num]) => {
    const cfg = ENTITY_CONFIG[label] || { name: label };
    return `${num} ${cfg.name || label}`;
  });
  const list = items.join(lang === 'ar' ? '، ' : ', ');
  if (lang === 'fr') return `${items.length} type${items.length > 1 ? 's' : ''} de données sensibles identifiés : ${list}.`;
  if (lang === 'ar') return `تم اكتشاف ${items.length} نوع من البيانات الحساسة: ${list}.`;
  return `${items.length} sensitive data type${items.length > 1 ? 's' : ''} identified: ${list}.`;
}

function formatNumber(n) {
  return new Intl.NumberFormat().format(n);
}

export default function Home({ lang, t, onLanguageChange }) {
  const [step, setStep] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [docTab, setDocTab] = useState('original');
  const canvasRef = useRef(null);

  const handleFileLoaded = (file, content) => {
    if (file.size > MAX_FILE_SIZE) {
      const msg = lang === 'fr' ? 'Fichier trop volumineux (max 5 Mo)' : lang === 'ar' ? 'الملف كبير جدًا (الحد الأقصى 5 ميجابايت)' : 'File too large (max 5MB)';
      setError(createAppError(new Error(msg), lang, 'file'));
      return;
    }
    setFileName(file.name || 'document.txt');
    setFileContent(content);
    setStep(1);
    setResult(null);
    setError(null);
    setDocTab('original');
  };

  const handleUploadError = (err, phase = 'file') => {
    setFileContent('');
    setFileName('');
    setResult(null);
    setStep(0);
    setError(createAppError(err, lang, phase));
  };

  const handleProcess = useCallback(async () => {
    if (!fileContent) return;
    let currentPhase = 'process';
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      currentPhase = 'anonymization';
      setStep(2);
      const { anonymized, count, spans } = anonymize(fileContent);

      currentPhase = 'hashing';
      const hash = await hashDocument(fileContent);

      currentPhase = 'blockchain';
      setStep(3);
      const blockchainResult = await logToBlockchain(hash);

      if (!blockchainResult?.success || !blockchainResult?.proofUrl) {
        const err = new Error('Blockchain proof could not be created');
        err.code = 'BLOCKCHAIN_PROOF_FAILED';
        throw err;
      }

      currentPhase = 'ai';
      setStep(4);
      const analysis = await analyzeDocument(anonymized, lang, userPrompt.trim() || null);

      setStep(5);
      setResult({
        analysis,
        hash,
        proofUrl: blockchainResult.proofUrl,
        anonCount: count,
        anonymized,
        spans,
        wordCount: fileContent.trim().split(/\s+/).filter(Boolean).length,
        redactedWordCount: anonymized.trim().split(/\s+/).filter(Boolean).length,
        timestamp: new Date().toLocaleString(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-MA' : 'en-US'),
      });
    } catch (err) {
      console.error('Process error:', err);
      setError(createAppError(err, lang, currentPhase));
      setStep(1);
    } finally {
      setLoading(false);
    }
  }, [fileContent, lang, userPrompt]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && !!fileContent && !loading && !result) {
        e.preventDefault();
        handleProcess();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fileContent, loading, result, handleProcess]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const particles = [];
    const N = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.4,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        baseAlpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${p.alpha})`;
        ctx.fill();
      });
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
      window.removeEventListener('resize', resize);
    };
  }, []);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isReady = !!fileContent && !loading;

  const copyRedacted = async () => {
    if (!result?.anonymized) return;
    try { await navigator.clipboard.writeText(result.anonymized); } catch { }
  };

  const exportReport = () => {
    if (!result) return;
    const report = {
      generatedAt: new Date().toISOString(),
      language: lang,
      fileName,
      stats: { wordCount: result.wordCount, redactedCount: result.anonCount },
      redactions: result.spans?.map((s) => ({ type: s.label, original: s.text })),
      blockchain: { hash: result.hash, proofUrl: result.proofUrl },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axiome-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060a14',
      color: '#e2e8f0',
      direction: dir,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      position: 'relative',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(30,64,175,0.15) 0%, transparent 70%)' }} />

      {/* ═══ HEADER ═══ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1rem,4vw,3rem)', height: 60,
        background: 'rgba(6,10,20,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.3)',
          }}>
            <Lock size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
            Axiome<span style={{ color: '#60a5fa' }}>Vault</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageToggle lang={lang} onChange={onLanguageChange} />
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: result ? 1200 : 720, margin: '0 auto', padding: '88px clamp(1rem,4vw,2rem) 4rem', transition: 'max-width 0.4s ease' }}>

        {/* Hero */}
        {!result && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 100,
              background: 'rgba(96,165,250,0.08)',
              border: '1px solid rgba(96,165,250,0.2)',
              fontSize: 11, color: '#93c5fd',
              letterSpacing: '0.08em', fontWeight: 600,
              marginBottom: 24,
            }}>
              <Shield size={12} color="#60a5fa" />
              {lang === 'ar' ? 'خصوصية أولاً · موثق بالبلوكشين' : lang === 'fr' ? "Confidentialité d'abord · Vérifié blockchain" : 'Privacy-First · Blockchain-Verified'}
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem,5.5vw,3.8rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: 20,
              maxWidth: 800,
              margin: '0 auto 20px',
            }}>
              <span style={{ color: '#f1f5f9' }}>{lang === 'ar' ? 'حلل مستندك' : lang === 'fr' ? 'Analysez vos documents' : 'Analyze Documents'}</span>
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{lang === 'ar' ? 'بأمان تام' : lang === 'fr' ? 'en toute confiance' : 'with Confidence'}</span>
            </h1>

            <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.75)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 32px' }}>
              {t.subtitle}
            </p>
          </div>
        )}

        <StepBar currentStep={step} t={t} />

        {/* Upload Card */}
        <div className="glow-border" style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 20,
          padding: '1.5rem',
          marginBottom: result ? 24 : 16,
          backdropFilter: 'blur(12px)',
        }}>
          {!fileContent ? (
            <UploadZone onFileLoaded={handleFileLoaded} onError={handleUploadError} t={t} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(96,165,250,0.1)',
                  border: '1px solid rgba(96,165,250,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#60a5fa', flexShrink: 0,
                }}>
                  <FileText size={20} strokeWidth={1.5} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {formatNumber(fileContent.length)} chars · {formatNumber(fileContent.trim().split(/\s+/).filter(Boolean).length)} words
                  </div>
                </div>
              </div>
              <button onClick={() => { setFileContent(''); setFileName(''); setResult(null); setStep(0); }} className="btn-premium" style={{
                fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <ArrowUpDown size={14} /> {lang === 'fr' ? 'Changer' : lang === 'ar' ? 'تغيير' : 'Change'}
              </button>
            </div>
          )}

          {fileContent && !result && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={14} color="#60a5fa" strokeWidth={2} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {lang === 'ar' ? 'تعليمات الذكاء الاصطناعي' : lang === 'fr' ? 'Instruction IA' : 'AI Instruction'}
                </span>
              </div>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={2}
                placeholder={lang === 'ar' ? 'مثال: ركز على البنود القانونية...' : lang === 'fr' ? 'Ex: Concentre-toi sur les clauses...' : 'e.g. Focus on legal clauses...'}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(96,165,250,0.15)',
                  borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', fontSize: 13,
                  fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none',
                  direction: lang === 'ar' ? 'rtl' : 'ltr',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.15)'}
              />
              <p style={{ fontSize: 11, color: '#334155', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Ctrl + Enter</span>
                <span>{lang === 'fr' ? 'pour lancer' : lang === 'ar' ? 'للتحليل' : 'to analyze'}</span>
              </p>
            </div>
          )}

          {!result && (
            <button
              onClick={handleProcess}
              disabled={!isReady}
              className="btn-premium"
              style={{
                width: '100%', marginTop: 16, padding: '14px 24px', borderRadius: 12,
                border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                cursor: isReady ? 'pointer' : 'not-allowed',
                background: isReady ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)' : 'rgba(255,255,255,0.04)',
                color: isReady ? '#fff' : 'rgba(148,163,184,0.35)',
                boxShadow: isReady ? '0 4px 24px rgba(37,99,235,0.4)' : 'none',
                transition: 'all 0.25s', letterSpacing: '0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
              onMouseEnter={e => {
                if (isReady) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.5)';
                }
              }}
              onMouseLeave={e => {
                if (isReady) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.4)';
                }
              }}
            >
              {loading ? (
                <><Loader2 size={18} className="spin" /> {t.buttons.processing}</>
              ) : (
                <><Sparkles size={18} strokeWidth={2.5} /> {t.buttons.analyze}</>
              )}
            </button>
          )}

          {error && (
            <div className="fade-in" style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, fontSize: 13, color: '#fca5a5', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ flexShrink: 0, marginTop: 2 }}><AlertTriangle size={16} /></span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{typeof error === 'string' ? error : error.title}</div>
                {typeof error !== 'string' && <div style={{ color: 'rgba(252,165,165,0.85)' }}>{error.message}</div>}
              </div>
            </div>
          )}
        </div>

        {/* ═══ RESULT DASHBOARD ═══ */}
        {result && (
          <>
            {/* Stats Bar */}
            <div className="glow-border fade-in-up" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, flexWrap: 'wrap', marginBottom: 24,
              padding: '14px 20px', background: 'rgba(6,10,20,0.5)',
              backdropFilter: 'blur(20px)', borderRadius: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <StatPill icon={<Shield size={18} strokeWidth={2} />} label={lang === 'fr' ? 'Protégé' : lang === 'ar' ? 'محمي' : 'Protected'} value={`${result.anonCount}`} sub={lang === 'fr' ? 'éléments' : lang === 'ar' ? 'عناصر' : 'items'} color="#34d399" />
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.06)' }} />
                <StatPill icon={<FileText size={18} strokeWidth={2} />} label={lang === 'fr' ? 'Mots' : lang === 'ar' ? 'كلمات' : 'Words'} value={formatNumber(result.wordCount)} color="#60a5fa" />
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.06)' }} />
                <StatPill icon={<Scissors size={18} strokeWidth={2} />} label={lang === 'fr' ? 'Réduction' : lang === 'ar' ? 'تخفيض' : 'Reduction'} value={`${Math.round((1 - result.redactedWordCount / result.wordCount) * 100)}%`} color="#a78bfa" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionBtn onClick={copyRedacted} icon={<Copy size={15} />} label={lang === 'fr' ? 'Copier' : lang === 'ar' ? 'نسخ' : 'Copy'} />
                <ActionBtn onClick={exportReport} icon={<Download size={15} />} label={lang === 'fr' ? 'Rapport' : lang === 'ar' ? 'تقرير' : 'Report'} />
                <ActionBtn onClick={() => { setResult(null); setStep(1); }} icon={<RefreshCw size={15} />} label={lang === 'fr' ? 'Nouveau' : lang === 'ar' ? 'جديد' : 'New'} primary />
              </div>
            </div>

            {/* Grid */}
            <div className="axiome-grid" style={{ display: 'grid', gap: 20 }}>
              {/* LEFT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Card label={lang === 'fr' ? 'Document' : lang === 'ar' ? 'المستند' : 'Document'} icon={<FileText size={14} strokeWidth={2.5} />}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                    {[
                      { key: 'original', label: lang === 'fr' ? 'Original' : lang === 'ar' ? 'أصلي' : 'Original', icon: <Eye size={14} /> },
                      { key: 'redacted', label: lang === 'fr' ? 'Anonymisé' : lang === 'ar' ? 'مُخفى' : 'Redacted', icon: <EyeOff size={14} /> },
                      { key: 'replay', label: 'Replay', icon: <RefreshCw size={14} /> },
                    ].map((tab) => (
                      <button key={tab.key} onClick={() => setDocTab(tab.key)} style={{
                        fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
                        border: 'none', fontFamily: 'inherit', cursor: 'pointer',
                        background: docTab === tab.key ? 'rgba(96,165,250,0.12)' : 'transparent',
                        color: docTab === tab.key ? '#93c5fd' : '#475569',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                        position: 'relative',
                      }}>
                        {tab.icon} {tab.label}
                        {docTab === tab.key && (
                          <div style={{
                            position: 'absolute', bottom: -10, left: '20%', right: '20%',
                            height: 2, borderRadius: 2,
                            background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)',
                          }} />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="terminal-block scanlines" style={{
                    minHeight: 240, maxHeight: 480, overflow: 'auto',
                    direction: 'ltr', textAlign: 'left',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    fontSize: 13,
                  }}>
                    {docTab === 'original' && <OriginalHighlight text={fileContent} spans={result.spans} />}
                    {docTab === 'redacted' && (
                      <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        {result.anonymized}
                      </span>
                    )}
                    {docTab === 'replay' && <RedactionViewer originalText={fileContent} spans={result.spans} lang={lang} />}
                  </div>

                  <div style={{ marginTop: 14, fontSize: 13, color: '#94a3b8', lineHeight: 1.7, padding: '12px 14px', background: 'rgba(96,165,250,0.03)', borderRadius: 10, borderLeft: '2px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ flexShrink: 0, marginTop: 2, color: '#60a5fa' }}><Shield size={16} /></span>
                    {generateRedactionNarrative(result.spans, lang)}
                  </div>
                </Card>

                <Card label={lang === 'fr' ? 'Données protégées' : lang === 'ar' ? 'البيانات المحمية' : 'Protected Data'} icon={<Lock size={14} strokeWidth={2.5} />}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {Object.entries(getRedactionSummary(result.spans)).map(([label, num]) => {
                      const cfg = ENTITY_CONFIG[label] || { name: label, color: '#93c5fd', glow: 'rgba(96,165,250,0.2)', icon: Shield };
                      const IconComp = cfg.icon;
                      return (
                        <EntityBadge key={label} label={cfg.name} count={num} color={cfg.color} glow={cfg.glow} icon={<IconComp size={12} strokeWidth={2.5} />} />
                      );
                    })}
                  </div>
                  <details>
                    <summary style={{ fontSize: 12, color: '#475569', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                      <ChevronRight size={14} style={{ transition: 'transform 0.2s' }} />
                      {lang === 'fr' ? 'Voir les détails' : lang === 'ar' ? 'عرض التفاصيل' : 'View details'}
                    </summary>
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {result.spans.map((span, idx) => {
                        const cfg = ENTITY_CONFIG[span.label] || { color: '#93c5fa', name: span.label, icon: Shield };
                        const IconComp = cfg.icon;
                        const preview = span.text.length > 30 ? span.text.slice(0, 30) + '…' : span.text;
                        return (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: 12, padding: '7px 12px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.02)', direction: 'ltr', textAlign: 'left',
                            border: '1px solid rgba(255,255,255,0.04)',
                          }}>
                            <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{preview}</span>
                            <span style={{
                              color: cfg.color, fontWeight: 600, fontSize: 10,
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                              display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                              <span className="entity-orb" style={{ background: cfg.color, color: cfg.color }} />
                              {cfg.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </Card>
              </div>

              {/* RIGHT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Card label={t.results.aiAnalysis} icon={<Sparkles size={14} strokeWidth={2.5} />}>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {result.analysis}
                  </div>
                </Card>

                <Card label={t.results.blockchainProof} icon={<Link2 size={14} strokeWidth={2.5} />}>
                  <a href={result.proofUrl} target="_blank" rel="noreferrer" style={{
                    fontSize: 12, color: '#60a5fa', wordBreak: 'break-all',
                    direction: 'ltr', display: 'flex', alignItems: 'center', gap: 8,
                    textAlign: 'left', textDecoration: 'none', lineHeight: 1.6,
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    padding: '10px 12px', background: 'rgba(96,165,250,0.05)',
                    borderRadius: 8, border: '1px solid rgba(96,165,250,0.1)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.05)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.1)'; }}
                  >
                    <Globe size={14} />
                    {result.proofUrl}
                  </a>
                </Card>

                <Certificate
                  hash={result.hash}
                  anonCount={result.anonCount}
                  proofUrl={result.proofUrl}
                  timestamp={result.timestamp}
                  analysis={result.analysis}
                  spans={result.spans}
                  t={t}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Card({ label, icon, children }) {
  return (
    <div className="glow-border holo-card fade-in" style={{
      background: 'rgba(255,255,255,0.015)',
      borderRadius: 16, padding: '1.25rem',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        fontSize: 10, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.14em',
        fontWeight: 700, marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#60a5fa', display: 'flex', alignItems: 'center' }}>{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function StatPill({ icon, label, value, sub, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="stat-number" style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
          {sub && <span style={{ fontSize: 11, color: '#475569' }}>{sub}</span>}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, icon, label, primary }) {
  return (
    <button onClick={onClick} className="btn-premium" style={{
      fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 10,
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.08)',
      background: primary ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)' : 'rgba(255,255,255,0.03)',
      color: primary ? '#fff' : '#94a3b8', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      transition: 'all 0.2s', letterSpacing: '0.01em',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>{icon}</span>
      {label}
    </button>
  );
}

function EntityBadge({ label, count, color, glow, icon }) {
  return (
    <div className="lift" style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 20,
      background: `${color}10`, border: `1px solid ${color}20`,
      color, fontWeight: 600, fontSize: 12,
      cursor: 'default', transition: 'all 0.2s',
    }}>
      <span className="entity-orb" style={{ background: color, color, boxShadow: `0 0 8px ${glow}` }} />
      <span style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>{icon}</span>
      <span>{count}</span>
      <span style={{ opacity: 0.85 }}>{label}</span>
    </div>
  );
}

function OriginalHighlight({ text, spans }) {
  if (!spans?.length) return <span style={{ color: '#94a3b8' }}>{text}</span>;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const segments = [];
  let cursor = 0;
  for (const s of sorted) {
    if (s.start > cursor) segments.push({ text: text.slice(cursor, s.start), span: null });
    segments.push({ text: text.slice(s.start, s.end), span: s });
    cursor = s.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), span: null });

  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.span) return <span key={i} style={{ color: '#64748b' }}>{seg.text}</span>;
        const cfg = ENTITY_CONFIG[seg.span.label] || { color: '#93c5fa', glow: 'rgba(96,165,250,0.2)' };
        return (
          <span key={i} style={{
            background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
            borderRadius: 4, color: cfg.color, padding: '1px 5px', fontWeight: 600,
            fontSize: 12, boxShadow: `0 0 12px ${cfg.glow}`,
            transition: 'all 0.2s', cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${cfg.color}28`; e.currentTarget.style.boxShadow = `0 0 20px ${cfg.glow}`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${cfg.color}18`; e.currentTarget.style.boxShadow = `0 0 12px ${cfg.glow}`; }}
          >
            {seg.text}
          </span>
        );
      })}
    </>
  );
}