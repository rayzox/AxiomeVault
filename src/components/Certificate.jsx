import { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Award, Shield, Download, ExternalLink,
  User, MapPin, Building2, Calendar, DollarSign,
  Mail, Phone, CreditCard, Home, Hash,
  Plane, Globe, Link2, AlertCircle, CheckCircle2
} from 'lucide-react';

const ENTITY_CONFIG = {
  PERSON:   { name: 'Persons',        color: '#f472b6', icon: User,      weight: 5 },
  LOCATION: { name: 'Locations',      color: '#34d399', icon: MapPin,    weight: 3 },
  ORG:      { name: 'Organizations',  color: '#a78bfa', icon: Building2, weight: 3 },
  DATE:     { name: 'Dates',          color: '#fbbf24', icon: Calendar,  weight: 1 },
  AMOUNT:   { name: 'Amounts',        color: '#f87171', icon: DollarSign,weight: 2 },
  EMAIL:    { name: 'Emails',         color: '#60a5fa', icon: Mail,      weight: 6 },
  PHONE:    { name: 'Phones',         color: '#2dd4bf', icon: Phone,     weight: 6 },
  CIN:      { name: 'ID Numbers',     color: '#fb923c', icon: Hash,      weight: 10 },
  ADDRESS:  { name: 'Addresses',      color: '#a3e635', icon: Home,      weight: 4 },
  PASSPORT: { name: 'Passports',      color: '#e879f9', icon: Plane,     weight: 10 },
  CREDIT:   { name: 'Cards',          color: '#f43f5e', icon: CreditCard,weight: 10 },
  IP:       { name: 'IP Addresses',   color: '#38bdf8', icon: Globe,     weight: 7 },
  URL:      { name: 'URLs',           color: '#818cf8', icon: Link2,     weight: 4 },
};

function calcPrivacyScore(spans) {
  if (!spans?.length) return 100;
  const rawScore = spans.reduce((sum, s) => sum + (ENTITY_CONFIG[s.label]?.weight || 1), 0);
  // Map 0-50+ weighted score to 0-100 display
  const normalized = Math.max(0, 100 - rawScore * 2.5);
  return Math.round(normalized);
}

function getScoreMeta(score) {
  if (score >= 80) return { label: 'Low Risk',    color: '#34d399', rgb: [52, 211, 153] };
  if (score >= 50) return { label: 'Medium Risk', color: '#fbbf24', rgb: [251, 191, 36] };
  return               { label: 'High Risk',   color: '#f87171', rgb: [248, 113, 113] };
}

export default function Certificate({ hash, anonCount, proofUrl, timestamp, t, analysis, spans }) {
  const [pdfError, setPdfError] = useState(null);

  const shortHash = hash ? `${hash.substring(0, 22)}…` : 'N/A';
  const pdfHash   = hash ? `${hash.substring(0, 30)}…` : 'N/A';

  const privacyScore = calcPrivacyScore(spans);
  const meta = getScoreMeta(privacyScore);

  const summary = spans?.reduce((acc, s) => {
    acc[s.label] = (acc[s.label] || 0) + 1;
    return acc;
  }, {}) ?? {};

  const rows = [
    { key: t.certificate?.documentHash   ?? 'Document Hash',     val: shortHash, mono: true },
    { key: t.certificate?.anonymizedItems?? 'Anonymized Items',  val: `${anonCount} ${t.certificate?.replaced ?? 'replaced'}` },
    { key: t.certificate?.aiModel        ?? 'AI Model',          val: 'Llama 3.1-8B (Groq)', mono: true },
    { key: t.certificate?.timestamp      ?? 'Timestamp',         val: timestamp },
    { key: t.certificate?.status         ?? 'Status',            val: 'VERIFIED', green: true },
  ];

  const handleDownload = () => {
    setPdfError(null);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const pad = 40;
      let y = pad;

      // Background
      doc.setFillColor(6, 10, 20);
      doc.rect(0, 0, W, H, 'F');

      // Header
      doc.setFillColor(13, 24, 41);
      // Safe rounded rect (fallback to rect if method missing)
      if (doc.roundedRect) {
        doc.roundedRect(pad, y, W - pad * 2, 60, 8, 8, 'F');
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(1);
        doc.roundedRect(pad, y, W - pad * 2, 60, 8, 8, 'S');
      } else {
        doc.rect(pad, y, W - pad * 2, 60, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(96, 165, 250);
      doc.text('AxiomeVault — Trust Certificate', pad + 20, y + 38);
      y += 80;

      // Privacy Score
      doc.setFillColor(13, 24, 41);
      if (doc.roundedRect) doc.roundedRect(pad, y, W - pad * 2, 70, 8, 8, 'F');
      else doc.rect(pad, y, W - pad * 2, 70, 'F');

      doc.setDrawColor(...meta.rgb);
      doc.setLineWidth(1);
      if (doc.roundedRect) doc.roundedRect(pad, y, W - pad * 2, 70, 8, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('PRIVACY SCORE', pad + 20, y + 22);

      doc.setFontSize(28);
      doc.setTextColor(...meta.rgb);
      doc.text(`${privacyScore}/100`, pad + 20, y + 52);

      doc.setFontSize(11);
      doc.setTextColor(...meta.rgb);
      doc.text(meta.label, pad + 110, y + 52);

      const barX = W - pad - 160;
      const barW = 140;
      doc.setFillColor(30, 41, 59);
      if (doc.roundedRect) doc.roundedRect(barX, y + 30, barW, 10, 5, 5, 'F');
      else doc.rect(barX, y + 30, barW, 10, 'F');

      doc.setFillColor(...meta.rgb);
      if (doc.roundedRect) doc.roundedRect(barX, y + 30, barW * (privacyScore / 100), 10, 5, 5, 'F');
      else doc.rect(barX, y + 30, barW * (privacyScore / 100), 10, 'F');
      y += 90;

      // Document Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(96, 165, 250);
      doc.text('DOCUMENT INFORMATION', pad, y);
      y += 14;
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.5);
      doc.line(pad, y, W - pad, y);
      y += 16;

      const pdfRows = [
        { key: t.certificate?.documentHash    ?? 'Document Hash',    val: pdfHash },
        { key: t.certificate?.anonymizedItems ?? 'Anonymized Items', val: `${anonCount} ${t.certificate?.replaced ?? 'replaced'}` },
        { key: t.certificate?.aiModel         ?? 'AI Model',         val: 'Llama 3.1-8B (Groq)' },
        { key: t.certificate?.timestamp       ?? 'Timestamp',        val: timestamp },
        { key: t.certificate?.status          ?? 'Status',           val: 'VERIFIED' },
        { key: 'Blockchain Proof',                                  val: proofUrl },
      ];

      pdfRows.forEach(({ key, val }) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(String(key), pad, y);

        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        const lines = doc.splitTextToSize(String(val), 220);
        doc.text(lines, W - pad, y, { align: 'right' });

        doc.setDrawColor(20, 30, 55);
        doc.setLineWidth(0.3);
        const lineY = y + (lines.length * 11);
        doc.line(pad, lineY, W - pad, lineY);
        y += lines.length * 11 + 14;
      });

      y += 10;

      // Redaction Summary
      if (Object.keys(summary).length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(96, 165, 250);
        doc.text('PROTECTED DATA SUMMARY', pad, y);
        y += 14;
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(pad, y, W - pad, y);
        y += 16;

        Object.entries(summary).forEach(([label, count]) => {
          const cfg = ENTITY_CONFIG[label] || { name: label };
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(148, 163, 184);
          doc.text(cfg.name || label, pad, y);
          doc.setTextColor(52, 211, 153);
          doc.text(`${count} item${count > 1 ? 's' : ''} redacted`, W - pad, y, { align: 'right' });
          doc.setDrawColor(20, 30, 55);
          doc.setLineWidth(0.3);
          doc.line(pad, y + 8, W - pad, y + 8);
          y += 22;
        });
        y += 10;
      }

      // AI Analysis
      if (analysis) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(96, 165, 250);
        doc.text('AI ANALYSIS', pad, y);
        y += 14;
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(pad, y, W - pad, y);
        y += 16;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(148, 163, 184);

        const lines = doc.splitTextToSize(analysis, W - pad * 2);
        const maxLines = Math.min(lines.length, 40);
        lines.slice(0, maxLines).forEach(line => {
          if (y > H - 60) {
            doc.addPage();
            doc.setFillColor(6, 10, 20);
            doc.rect(0, 0, W, H, 'F');
            y = pad;
          }
          doc.text(line, pad, y);
          y += 13;
        });
      }

      // Footer
      const footerY = H - 30;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('Generated by AxiomeVault — Privacy-First Document Analysis', W / 2, footerY, { align: 'center' });

      doc.save('axiomevault-trust-certificate.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfError('PDF generation failed. Please try again.');
    }
  };

  return (
    <div className="glow-border holo-card fade-in" style={{
      background: 'linear-gradient(135deg, rgba(13,24,41,0.9), rgba(6,10,20,0.95))',
      borderRadius: 16, padding: '1.35rem',
      backdropFilter: 'blur(8px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(99,102,241,0.1)', filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 12, marginBottom: 16,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#60a5fa',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'rgba(96,165,250,0.12)',
            border: '1px solid rgba(96,165,250,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Award size={14} strokeWidth={2.5} />
          </div>
          {t.certificate?.title?.replace(/🏅\s*/, '') ?? 'Trust Certificate'}
        </div>

        <button
          onClick={handleDownload}
          className="btn-premium"
          style={{
            background: 'rgba(96,165,250,0.08)',
            border: '1px solid rgba(96,165,250,0.22)',
            borderRadius: 8, color: '#60a5fa',
            fontSize: 11, fontWeight: 600,
            padding: '6px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(96,165,250,0.15)';
            e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(96,165,250,0.08)';
            e.currentTarget.style.borderColor = 'rgba(96,165,250,0.22)';
          }}
        >
          <Download size={14} /> {t.buttons?.downloadPdf ?? 'Download PDF'}
        </button>
      </div>

      {pdfError && (
        <div className="fade-in" style={{
          marginBottom: 12, padding: '10px 12px',
          background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, fontSize: 12, color: '#fca5a5',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={14} />
          {pdfError}
        </div>
      )}

      {/* Privacy Score */}
      <div style={{
        marginBottom: 16,
        padding: '14px 16px',
        background: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        border: `1px solid ${meta.color}22`,
      }}>
        <div style={{
          fontSize: 10, color: '#475569', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Shield size={12} color={meta.color} />
          Privacy Score
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            fontSize: 32, fontWeight: 800, color: meta.color,
            fontFamily: 'var(--font-mono)', lineHeight: 1,
            textShadow: `0 0 20px ${meta.color}40`,
          }}>
            {privacyScore}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%', width: `${privacyScore}%`,
                background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
                borderRadius: 4, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 0 12px ${meta.color}50`,
              }} />
            </div>
            <div style={{ fontSize: 12, color: meta.color, fontWeight: 700, letterSpacing: '0.02em' }}>
              {meta.label}
            </div>
          </div>
        </div>
      </div>

      {/* Info Rows */}
      {rows.map(({ key, val, green, mono }) => (
        <div key={key} style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 16,
          padding: '9px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontSize: 12,
        }}>
          <span style={{ color: '#475569', flexShrink: 0, fontWeight: 500 }}>{key}</span>
          <span style={{
            color: green ? '#34d399' : '#94a3b8',
            fontFamily: mono ? 'var(--font-mono)' : 'inherit',
            fontSize: mono ? 11 : 12,
            textAlign: 'right', maxWidth: 240,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            direction: 'ltr', letterSpacing: mono ? '0.02em' : 'inherit',
          }}>{val}</span>
        </div>
      ))}

      {/* Redaction Summary (visible in card) */}
      {Object.keys(summary).length > 0 && (
        <div style={{ marginTop: 14, marginBottom: 8 }}>
          <div style={{
            fontSize: 10, color: '#475569', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 10,
          }}>
            Protected Data
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(summary).map(([label, count]) => {
              const cfg = ENTITY_CONFIG[label] || { name: label, color: '#93c5fd', icon: Shield };
              const IconComp = cfg.icon;
              return (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 20,
                  background: `${cfg.color}10`, border: `1px solid ${cfg.color}25`,
                  color: cfg.color, fontSize: 11, fontWeight: 600,
                }}>
                  <IconComp size={11} strokeWidth={2.5} />
                  <span>{count}</span>
                  <span style={{ opacity: 0.8 }}>{cfg.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blockchain Link */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 16, padding: '10px 0 0', marginTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: 12,
      }}>
        <span style={{ color: '#475569', flexShrink: 0, fontWeight: 500 }}>
          {t.certificate?.blockchainProof ?? 'Blockchain Proof'}
        </span>
        <a href={proofUrl} target="_blank" rel="noreferrer" style={{
          color: '#60a5fa', fontSize: 11, textDecoration: 'none',
          textAlign: 'right', direction: 'ltr', whiteSpace: 'nowrap',
          transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 5,
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
          onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
        >
          <ExternalLink size={12} />
          {t.results?.viewOnEtherscan ?? 'View on Etherscan'}
        </a>
      </div>
    </div>
  );
}