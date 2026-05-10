import { useState, useEffect, useRef, useCallback } from 'react';
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
  PERSON: { name: 'Names', icon: '👤', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  LOCATION: { name: 'Locations', icon: '📍', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  ORG: { name: 'Organizations', icon: '🏢', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  DATE: { name: 'Dates', icon: '📅', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  AMOUNT: { name: 'Amounts', icon: '💰', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  EMAIL: { name: 'Emails', icon: '✉️', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  PHONE: { name: 'Phones', icon: '📞', color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)' },
  CIN: { name: 'ID Numbers', icon: '🆔', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  ADDRESS: { name: 'Addresses', icon: '🏠', color: '#a3e635', bg: 'rgba(163,230,53,0.12)' },
  PASSPORT: { name: 'Passports', icon: '🛂', color: '#e879f9', bg: 'rgba(232,121,249,0.12)' },
  CREDIT: { name: 'Cards', icon: '💳', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  IP: { name: 'IP Addresses', icon: '🌐', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  URL: { name: 'URLs', icon: '🔗', color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
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
  const [docTab, setDocTab] = useState('original'); // 'original' | 'redacted' | 'replay'
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

  // Keyboard shortcut
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

  // Canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const particles = [];
    const N = 40;

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
        r: Math.random() * 1.4 + 0.3,
        dx: (Math.random() - 0.5) * 0.28,
        dy: (Math.random() - 0.5) * 0.28,
        alpha: Math.random() * 0.45 + 0.08,
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
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${0.06 * (1 - dist / 120)})`;
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
    try {
      await navigator.clipboard.writeText(result.anonymized);
    } catch { }
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

  // ── RENDER ──
  return (
    <div style={{
      minHeight: '100vh',
      background: '#060a14',
      color: '#e2e8f0',
      direction: dir,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      position: 'relative',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(30,64,175,0.15) 0%, transparent 70%)' }} />

      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1rem,4vw,3rem)', height: 56,
        background: 'rgba(6,10,20,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
          🔐 AxiomeVault
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageToggle lang={lang} onChange={onLanguageChange} />
        </div>
      </div>

      {/* Main */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: result ? 1200 : 760, margin: '0 auto', padding: '80px clamp(1rem,4vw,2rem) 4rem', transition: 'max-width 0.4s ease' }}>

        {/* Hero (hide when result exists) */}
        {!result && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', fontSize: 11, color: '#93c5fd', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 14 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
              {lang === 'ar' ? 'خصوصية أولاً · موثق بالبلوكشين' : lang === 'fr' ? "Confidentialité d'abord · Vérifié blockchain" : 'Privacy-First · Blockchain-Verified'}
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, background: 'linear-gradient(135deg, #f1f5f9 40%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 10 }}>
              {lang === 'ar' ? 'حلل مستندك بأمان' : lang === 'fr' ? 'Analysez votre document' : 'Analyze Your Document'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.6)', lineHeight: 1.7 }}>{t.subtitle}</p>
          </div>
        )}

        <StepBar currentStep={step} t={t} />

        {/* Upload / Controls Card */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '1.5rem',
          marginBottom: result ? 20 : 14,
          backdropFilter: 'blur(8px)',
        }}>
          {!fileContent ? (
            <UploadZone onFileLoaded={handleFileLoaded} onError={handleUploadError} t={t} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 20 }}>📄</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{formatNumber(fileContent.length)} chars · {formatNumber(fileContent.trim().split(/\s+/).filter(Boolean).length)} words</div>
                </div>
              </div>
              <button onClick={() => { setFileContent(''); setFileName(''); setResult(null); setStep(0); }} style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {lang === 'fr' ? 'Changer' : lang === 'ar' ? 'تغيير' : 'Change'}
              </button>
            </div>
          )}

          {/* Prompt */}
          {fileContent && !result && (
            <div style={{ marginTop: 14 }}>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={2}
                placeholder={lang === 'ar' ? 'طلبك للذكاء الاصطناعي (اختياري)...' : lang === 'fr' ? "Instruction pour l'IA (optionnel)..." : 'Your instruction for the AI (optional)...'}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(96,165,250,0.15)',
                  borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', fontSize: 13,
                  fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none',
                  direction: lang === 'ar' ? 'rtl' : 'ltr',
                }}
              />
              <p style={{ fontSize: 11, color: '#334155', marginTop: 5 }}>
                {lang === 'ar' ? 'اتركه فارغاً للتحليل الافتراضي. اضغط Ctrl+Enter للتحليل' : lang === 'fr' ? 'Laissez vide pour l\'analyse par défaut. Ctrl+Enter pour lancer' : 'Leave empty for default analysis. Press Ctrl+Enter to run'}
              </p>
            </div>
          )}

          {/* Analyze Button */}
          {!result && (
            <button
              onClick={handleProcess}
              disabled={!isReady}
              style={{
                width: '100%', marginTop: 14, padding: '13px 24px', borderRadius: 12,
                border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                cursor: isReady ? 'pointer' : 'not-allowed',
                background: isReady ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)' : 'rgba(255,255,255,0.04)',
                color: isReady ? '#fff' : 'rgba(148,163,184,0.35)',
                boxShadow: isReady ? '0 4px 24px rgba(37,99,235,0.35)' : 'none',
                transition: 'all 0.2s', letterSpacing: '0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? <><Spinner /> {t.buttons.processing}</> : <>{t.buttons.analyze} <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>Ctrl+↵</span></>}
            </button>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(127,29,29,0.22)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: 13, color: '#fca5a5', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{typeof error === 'string' ? error : error.title}</div>
              {typeof error !== 'string' && <><div>{error.message}</div>{error.hint && <div style={{ marginTop: 6, color: '#fecaca' }}>💡 {error.hint}</div>}</>}
            </div>
          )}
        </div>

        {/* ═══════ RESULT DASHBOARD ═══════ */}
        {result && (
          <>
            {/* Stats Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, flexWrap: 'wrap', marginBottom: 20,
              padding: '10px 16px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <StatPill icon="🛡️" label={lang === 'fr' ? 'Protégé' : lang === 'ar' ? 'محمي' : 'Protected'} value={`${result.anonCount} items`} color="#34d399" />
                <StatPill icon="📝" label={lang === 'fr' ? 'Mots' : lang === 'ar' ? 'كلمات' : 'Words'} value={formatNumber(result.wordCount)} color="#60a5fa" />
                <StatPill icon="✂️" label={lang === 'fr' ? 'Réduction' : lang === 'ar' ? 'تخفيض' : 'Reduction'} value={`${Math.round((1 - result.redactedWordCount / result.wordCount) * 100)}%`} color="#a78bfa" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionBtn onClick={copyRedacted} icon="📋" label={lang === 'fr' ? 'Copier' : lang === 'ar' ? 'نسخ' : 'Copy'} />
                <ActionBtn onClick={exportReport} icon="📥" label={lang === 'fr' ? 'Rapport' : lang === 'ar' ? 'تقرير' : 'Report'} />
                <ActionBtn onClick={() => { setResult(null); setStep(1); }} icon="🔄" label={lang === 'fr' ? 'Nouveau' : lang === 'ar' ? 'جديد' : 'New'} primary />
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="axiome-grid" style={{ display: 'grid', gap: 16 }}>
              {/* LEFT COLUMN: Document */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Document Viewer */}
                <Card label={lang === 'fr' ? 'Document' : lang === 'ar' ? 'المستند' : 'Document'}>
                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
                    {[
                      { key: 'original', label: lang === 'fr' ? 'Original' : lang === 'ar' ? 'أصلي' : 'Original' },
                      { key: 'redacted', label: lang === 'fr' ? 'Anonymisé' : lang === 'ar' ? 'مُخفى' : 'Redacted' },
                      { key: 'replay', label: lang === 'fr' ? 'Replay' : lang === 'ar' ? 'إعادة' : 'Replay' },
                    ].map((tab) => (
                      <button key={tab.key} onClick={() => setDocTab(tab.key)} style={{
                        fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6,
                        border: 'none', fontFamily: 'inherit', cursor: 'pointer',
                        background: docTab === tab.key ? 'rgba(96,165,250,0.15)' : 'transparent',
                        color: docTab === tab.key ? '#93c5fd' : '#475569',
                        transition: 'all 0.2s',
                      }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div style={{
                    background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '12px 14px',
                    fontSize: 13, lineHeight: 1.8, fontFamily: 'monospace',
                    color: '#94a3b8', minHeight: 200, maxHeight: 420, overflow: 'auto',
                    direction: 'ltr', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {docTab === 'original' && <OriginalHighlight text={fileContent} spans={result.spans} />}
                    {docTab === 'redacted' && result.anonymized}
                    {docTab === 'replay' && <RedactionViewer originalText={fileContent} spans={result.spans} lang={lang} />}
                  </div>

                  {/* Narrative */}
                  <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.7, padding: '10px 12px', background: 'rgba(96,165,250,0.04)', borderRadius: 8, borderLeft: '2px solid rgba(96,165,250,0.3)' }}>
                    {generateRedactionNarrative(result.spans, lang)}
                  </div>
                </Card>

                {/* Protected Data */}
                <Card label={lang === 'fr' ? 'Données protégées' : lang === 'ar' ? 'البيانات المحمية' : 'Protected Data'}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {Object.entries(getRedactionSummary(result.spans)).map(([label, num]) => {
                      const cfg = ENTITY_CONFIG[label] || { icon: '🔒', color: '#93c5fd', bg: 'rgba(96,165,250,0.1)', name: label };
                      return (
                        <span key={label} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.color}33`, color: cfg.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {cfg.icon} {num} {cfg.name}
                        </span>
                      );
                    })}
                  </div>
                  <details>
                    <summary style={{ fontSize: 11, color: '#475569', cursor: 'pointer', userSelect: 'none' }}>{lang === 'fr' ? 'Voir les détails' : lang === 'ar' ? 'عرض التفاصيل' : 'View details'}</summary>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {result.spans.map((span, idx) => {
                        const cfg = ENTITY_CONFIG[span.label] || { icon: '🔒', color: '#93c5fd' };
                        const preview = span.text.length > 28 ? span.text.slice(0, 28) + '…' : span.text;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', direction: 'ltr', textAlign: 'left' }}>
                            <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{preview}</span>
                            <span style={{ color: cfg.color, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.icon} {span.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </Card>
              </div>

              {/* RIGHT COLUMN: Intelligence */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Card label={t.results.aiAnalysis}>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {result.analysis}
                  </div>
                </Card>

                <Card label={t.results.blockchainProof}>
                  <a href={result.proofUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#60a5fa', wordBreak: 'break-all', direction: 'ltr', display: 'block', textAlign: 'left', textDecoration: 'none', lineHeight: 1.6 }}>
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

// ── Sub-components ──

function Card({ label, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem', backdropFilter: 'blur(8px)' }}>
      <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function StatPill({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, icon, label, primary }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8,
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.08)',
      background: primary ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)' : 'rgba(255,255,255,0.04)',
      color: primary ? '#fff' : '#94a3b8', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }}>
      {icon} {label}
    </button>
  );
}

function OriginalHighlight({ text, spans }) {
  if (!spans?.length) return <span>{text}</span>;
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
        if (!seg.span) return <span key={i} style={{ color: '#94a3b8' }}>{seg.text}</span>;
        const cfg = ENTITY_CONFIG[seg.span.label] || { color: '#93c5fd', bg: 'rgba(96,165,250,0.15)' };
        return (
          <span key={i} style={{
            background: cfg.bg, border: `1px solid ${cfg.color}55`, borderRadius: 4,
            color: cfg.color, padding: '0 3px', fontWeight: 600,
          }}>
            {seg.text}
          </span>
        );
      })}
    </>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}