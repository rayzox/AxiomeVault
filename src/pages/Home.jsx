import { useState } from 'react';
import StepBar from '../components/StepBar';
import UploadZone from '../components/UploadZone';
import Certificate from '../components/Certificate';
import LanguageToggle from '../components/LanguageToggle';
import { anonymize } from '../utils/anonymizer';
import { hashDocument } from '../utils/hasher';
import { analyzeDocument } from '../utils/ai';
import { logToBlockchain } from '../utils/blockchain';
import { createAppError } from '../utils/errorHandler';

export default function Home({ lang, t, onLanguageChange }) {
  const [step, setStep] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileLoaded = (file, content) => {
    setFileContent(content);
    setStep(1);
    setResult(null);
    setError(null);
  };

  const handleUploadError = (err, phase = 'file') => {
    setFileContent('');
    setResult(null);
    setStep(0);
    setError(createAppError(err, lang, phase));
  };

  const handleProcess = async () => {
    if (!fileContent) return;

<<<<<<< HEAD
=======
    let currentPhase = 'process';

>>>>>>> 05b97ff (Improve error handling without changing blockchain module)
    setLoading(true);
    setError(null);
    setResult(null);

    try {
<<<<<<< HEAD
      // Step 2: Anonymize document locally
      setStep(2);
      const { anonymized, count } = anonymize(fileContent);

      // Step 3: Generate hash and send blockchain proof
      setStep(3);
      const hash = await hashDocument(fileContent);
      const { proofUrl } = await logToBlockchain(hash);

      // Step 4: Analyze anonymized document with AI
      setStep(4);
      const analysis = await analyzeDocument(anonymized, lang);

      // Step 5: Generate final result and certificate
=======
      currentPhase = 'anonymization';
      setStep(2);
      const { anonymized, count } = anonymize(fileContent);

      currentPhase = 'hashing';
      const hash = await hashDocument(fileContent);

      currentPhase = 'blockchain';
      setStep(3);

      const blockchainResult = await logToBlockchain(hash);

      if (!blockchainResult?.success || !blockchainResult?.proofUrl) {
        const blockchainError = new Error('Blockchain proof could not be created');
        blockchainError.code = 'BLOCKCHAIN_PROOF_FAILED';
        throw blockchainError;
      }

      const { proofUrl } = blockchainResult;

      currentPhase = 'ai';
      setStep(4);
      const analysis = await analyzeDocument(anonymized, lang);

>>>>>>> 05b97ff (Improve error handling without changing blockchain module)
      setStep(5);
      setResult({
        analysis,
        hash,
        proofUrl,
        anonCount: count,
        anonymized,
        timestamp: new Date().toLocaleString(
          lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-MA' : 'en-US'
        ),
      });
    } catch (err) {
      console.error('Process error:', err);
      setError(createAppError(err, lang, currentPhase));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, sans-serif',
        color: '#e2e8f0',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🔐 AxiomeVault
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#64748b',
            marginTop: '4px',
          }}
        >
          {t.subtitle}
=======
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

  const technicalDetailsLabel =
    lang === 'ar'
      ? 'التفاصيل التقنية'
      : lang === 'fr'
      ? 'Détails techniques'
      : 'Technical details';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060a14',
        color: '#e2e8f0',
        direction: dir,
        fontFamily: '"DM Sans", system-ui, sans-serif',
        position: 'relative',
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}
      </style>

      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(30,64,175,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(1rem,4vw,3rem)',
          height: 60,
          background: 'rgba(6,10,20,0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          🔐 AxiomeVault
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageToggle lang={lang} onChange={onLanguageChange} />
>>>>>>> 05b97ff (Improve error handling without changing blockchain module)
        </div>

        <LanguageToggle lang={lang} onChange={onLanguageChange} />
      </div>

<<<<<<< HEAD
      {/* Step Bar */}
      <StepBar currentStep={step} t={t} />
=======
      {/* Main */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 760,
          margin: '0 auto',
          padding: '92px clamp(1rem,4vw,2rem) 4rem',
        }}
      >
        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 100,
              background: 'rgba(96,165,250,0.08)',
              border: '1px solid rgba(96,165,250,0.2)',
              fontSize: 11,
              color: '#93c5fd',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#60a5fa',
                display: 'inline-block',
              }}
            />
            {lang === 'ar'
              ? 'خصوصية أولاً · موثق بالبلوكشين'
              : lang === 'fr'
              ? "Confidentialité d'abord · Vérifié blockchain"
              : 'Privacy-First · Blockchain-Verified'}
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.6rem,4vw,2.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              background: 'linear-gradient(135deg, #f1f5f9 40%, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 10,
            }}
          >
            {lang === 'ar'
              ? 'حلل مستندك بأمان'
              : lang === 'fr'
              ? 'Analysez votre document'
              : 'Analyze Your Document'}
          </h1>

          <p
            style={{
              fontSize: 14,
              color: 'rgba(148,163,184,0.6)',
              lineHeight: 1.7,
            }}
          >
            {t.subtitle}
          </p>
        </div>
>>>>>>> 05b97ff (Improve error handling without changing blockchain module)

      {/* Upload Card */}
      <div
        style={{
          background: '#111827',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '16px',
        }}
      >
        <UploadZone onFileLoaded={handleFileLoaded} t={t} />

<<<<<<< HEAD
        <button
          onClick={handleProcess}
          disabled={!fileContent || loading}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '11px 24px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: fileContent && !loading ? 'pointer' : 'not-allowed',
            background:
              fileContent && !loading
                ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                : '#1e293b',
            color: fileContent && !loading ? 'white' : '#475569',
            transition: 'all 0.15s',
          }}
        >
          {loading ? t.buttons.processing : t.buttons.analyze}
        </button>
=======
        {/* Upload card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '1.75rem',
            marginBottom: 14,
            backdropFilter: 'blur(8px)',
          }}
        >
          <UploadZone
            onFileLoaded={handleFileLoaded}
            onError={handleUploadError}
            t={t}
          />
>>>>>>> 05b97ff (Improve error handling without changing blockchain module)

        {error && (
          <div
            style={{
<<<<<<< HEAD
              marginTop: '10px',
              padding: '10px',
              background: '#1f0a0a',
              border: '1px solid #7f1d1d',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div>
          {/* Anonymization preview */}
          <div
            style={{
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              {t.results.anonymizationPreview}
            </div>

            <div
              style={{
                background: '#0a0e1a',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                color: '#64748b',
                fontFamily: 'monospace',
                lineHeight: 1.6,
                maxHeight: '80px',
                overflow: 'hidden',
                direction: 'ltr',
                textAlign: 'left',
              }}
            >
              {result.anonymized.substring(0, 300)}...
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#475569',
                marginTop: '6px',
              }}
            >
              ✅ {result.anonCount} {t.results.sensitiveItems}
            </div>
          </div>

          {/* AI Analysis */}
          <div
            style={{
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              {t.results.aiAnalysis}
            </div>

            <div
              style={{
                fontSize: '13px',
                color: '#94a3b8',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {result.analysis}
            </div>
          </div>

          {/* Blockchain proof */}
          <div
            style={{
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              {t.results.blockchainProof}
            </div>

            <a
              href={result.proofUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '12px',
                color: '#60a5fa',
                wordBreak: 'break-all',
                direction: 'ltr',
                display: 'block',
                textAlign: 'left',
              }}
            >
              {result.proofUrl}
            </a>
=======
              width: '100%',
              marginTop: 14,
              padding: '13px 24px',
              borderRadius: 12,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: isReady ? 'pointer' : 'not-allowed',
              background: isReady
                ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)'
                : 'rgba(255,255,255,0.04)',
              color: isReady ? '#fff' : 'rgba(148,163,184,0.35)',
              boxShadow: isReady ? '0 4px 24px rgba(37,99,235,0.35)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (isReady) {
                e.currentTarget.style.boxShadow =
                  '0 8px 32px rgba(37,99,235,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (isReady) {
                e.currentTarget.style.boxShadow =
                  '0 4px 24px rgba(37,99,235,0.35)';
              }
            }}
          >
            {loading ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <Spinner /> {t.buttons.processing}
              </span>
            ) : (
              t.buttons.analyze
            )}
          </button>

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: '12px 14px',
                background: 'rgba(127,29,29,0.22)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10,
                fontSize: 13,
                color: '#fca5a5',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {typeof error === 'string' ? error : error.title}
              </div>

              {typeof error !== 'string' && (
                <>
                  <div>{error.message}</div>

                  {error.hint && (
                    <div style={{ marginTop: 6, color: '#fecaca' }}>
                      💡 {error.hint}
                    </div>
                  )}

                  {error.technical && (
                    <details style={{ marginTop: 8, color: '#94a3b8' }}>
                      <summary style={{ cursor: 'pointer' }}>
                        {technicalDetailsLabel}
                      </summary>

                      <pre
                        style={{
                          marginTop: 6,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: 11,
                          color: '#64748b',
                          direction: 'ltr',
                          textAlign: 'left',
                        }}
                      >
                        {error.technical}
                      </pre>
                    </details>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ResultCard label={t.results.anonymizationPreview}>
              <div
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 12,
                  color: '#475569',
                  fontFamily: 'monospace',
                  lineHeight: 1.7,
                  maxHeight: 88,
                  overflow: 'hidden',
                  direction: 'ltr',
                  textAlign: 'left',
                }}
              >
                {result.anonymized.substring(0, 300)}...
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: '#34d399',
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#34d399',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {result.anonCount} {t.results.sensitiveItems}
              </div>
            </ResultCard>

            <ResultCard label={t.results.aiAnalysis}>
              <div
                style={{
                  fontSize: 13,
                  color: '#94a3b8',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {result.analysis}
              </div>
            </ResultCard>

            <ResultCard label={t.results.blockchainProof}>
              <a
                href={result.proofUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  color: '#60a5fa',
                  wordBreak: 'break-all',
                  direction: 'ltr',
                  display: 'block',
                  textAlign: 'left',
                  textDecoration: 'none',
                  lineHeight: 1.6,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#93c5fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#60a5fa';
                }}
              >
                {result.proofUrl}
              </a>
            </ResultCard>

            <Certificate
              hash={result.hash}
              anonCount={result.anonCount}
              proofUrl={result.proofUrl}
              timestamp={result.timestamp}
              t={t}
            />
>>>>>>> 05b97ff (Improve error handling without changing blockchain module)
          </div>

<<<<<<< HEAD
          {/* Certificate */}
          <Certificate
            hash={result.hash}
            anonCount={result.anonCount}
            proofUrl={result.proofUrl}
            timestamp={result.timestamp}
            t={t}
          />
        </div>
      )}
    </div>
  );
=======
function ResultCard({ label, children }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '1.25rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    >
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
      />
      <path
        d="M8 2 A6 6 0 0 1 14 8"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
>>>>>>> 05b97ff (Improve error handling without changing blockchain module)
}