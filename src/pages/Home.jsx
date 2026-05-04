import { useState } from 'react';
import StepBar from '../components/StepBar';
import UploadZone from '../components/UploadZone';
import Certificate from '../components/Certificate';
import LanguageToggle from '../components/LanguageToggle';
import { anonymize } from '../utils/anonymizer';
import { hashDocument } from '../utils/hasher';
import { analyzeDocument } from '../utils/ai';
import { logToBlockchain } from '../utils/blockchain';

export default function Home({ lang, t, onLanguageChange }) {
  const [step, setStep] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileLoaded = (file, content) => {
    setFileContent(content);
    setStep(1);
    setResult(null);
    setError('');
  };

  const handleProcess = async () => {
    if (!fileContent) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
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
      setError(`${t.errorPrefix} ${err.message}`);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

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
        </div>

        <LanguageToggle lang={lang} onChange={onLanguageChange} />
      </div>

      {/* Step Bar */}
      <StepBar currentStep={step} t={t} />

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

        {error && (
          <div
            style={{
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
          </div>

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
}