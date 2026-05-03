import { useState } from 'react';
import StepBar from '../components/StepBar';
import UploadZone from '../components/UploadZone';
import Certificate from '../components/Certificate';
import { anonymize } from '../utils/anonymizer';
import { hashDocument } from '../utils/hasher';
import { analyzeDocument } from '../utils/ai';
import { logToBlockchain } from '../utils/blockchain';

export default function Home() {
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

  const process = async () => {
    if (!fileContent) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Step 2: Anonymize
      setStep(2);
      const { anonymized, mapping, count } = anonymize(fileContent);

      // Step 3: Hash + Blockchain
      setStep(3);
      const hash = await hashDocument(fileContent);
      const { proofUrl } = await logToBlockchain(hash);

      // Step 4: AI Analysis
      setStep(4);
      const analysis = await analyzeDocument(anonymized);

      // Step 5: Done
      setStep(5);
      setResult({
        analysis,
        hash,
        proofUrl,
        anonCount: count,
        anonymized,
        timestamp: new Date().toLocaleString('fr-MA'),
      });
    } catch (err) {
      setError('Error: ' + err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '720px', margin: '0 auto',
      padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          fontSize: '28px', fontWeight: 700,
          background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>🔐 AxiomeTrust</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          AI document analysis with blockchain-verified privacy
        </div>
      </div>

      {/* Step Bar */}
      <StepBar currentStep={step} />

      {/* Upload Card */}
      <div style={{
        background: '#111827', border: '1px solid #1e293b',
        borderRadius: '16px', padding: '1.5rem', marginBottom: '16px'
      }}>
        <UploadZone onFileLoaded={handleFileLoaded} />
        <button
          onClick={process}
          disabled={!fileContent || loading}
          style={{
            width: '100%', marginTop: '12px', padding: '11px 24px',
            borderRadius: '10px', border: 'none', fontSize: '14px',
            fontWeight: 500, cursor: fileContent && !loading ? 'pointer' : 'not-allowed',
            background: fileContent && !loading
              ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
              : '#1e293b',
            color: fileContent && !loading ? 'white' : '#475569',
            transition: 'all 0.15s'
          }}
        >
          {loading ? '⏳ Processing...' : '🔐 Analyze Securely'}
        </button>
        {error && (
          <div style={{
            marginTop: '10px', padding: '10px', background: '#1f0a0a',
            border: '1px solid #7f1d1d', borderRadius: '8px',
            fontSize: '12px', color: '#fca5a5'
          }}>{error}</div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div>
          {/* Anonymization preview */}
          <div style={{
            background: '#111827', border: '1px solid #1e293b',
            borderRadius: '12px', padding: '1.25rem', marginBottom: '12px'
          }}>
            <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              🔍 Anonymization Preview
            </div>
            <div style={{
              background: '#0a0e1a', borderRadius: '8px', padding: '10px',
              fontSize: '12px', color: '#64748b', fontFamily: 'monospace',
              lineHeight: 1.6, maxHeight: '80px', overflow: 'hidden'
            }}>
              {result.anonymized.substring(0, 300)}...
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
              ✅ {result.anonCount} sensitive items anonymized before sending to AI
            </div>
          </div>

          {/* AI Analysis */}
          <div style={{
            background: '#111827', border: '1px solid #1e293b',
            borderRadius: '12px', padding: '1.25rem', marginBottom: '12px'
          }}>
            <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              🤖 AI Analysis
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {result.analysis}
            </div>
          </div>

          {/* Blockchain proof */}
          <div style={{
            background: '#111827', border: '1px solid #1e293b',
            borderRadius: '12px', padding: '1.25rem', marginBottom: '12px'
          }}>
            <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              ⛓️ Blockchain Proof
            </div>
            <a href={result.proofUrl} target="_blank" rel="noreferrer"
              style={{ fontSize: '12px', color: '#60a5fa', wordBreak: 'break-all' }}>
              {result.proofUrl}
            </a>
          </div>

          {/* Certificate */}
          <Certificate
            hash={result.hash}
            anonCount={result.anonCount}
            proofUrl={result.proofUrl}
            timestamp={result.timestamp}
          />
        </div>
      )}
    </div>
  );
}