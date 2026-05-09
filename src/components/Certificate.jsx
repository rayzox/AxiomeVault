import { jsPDF } from 'jspdf';

export default function Certificate({ hash, anonCount, proofUrl, timestamp, t, analysis, spans }) {
  const shortHash = hash ? `${hash.substring(0, 22)}...` : 'N/A';
  const pdfHash = hash ? `${hash.substring(0, 30)}...` : 'N/A';

  const ENTITY_CONFIG = {
    PERSON:   { icon: '👤', name: 'Persons' },
    LOCATION: { icon: '📍', name: 'Locations' },
    ORG:      { icon: '🏢', name: 'Organizations' },
    DATE:     { icon: '📅', name: 'Dates' },
    AMOUNT:   { icon: '💰', name: 'Amounts' },
    EMAIL:    { icon: '✉️', name: 'Emails' },
    PHONE:    { icon: '📞', name: 'Phones' },
    CIN:      { icon: '🆔', name: 'IDs' },
    ADDRESS:  { icon: '🏠', name: 'Addresses' },
  };

  const rows = [
    { key: t.certificate.documentHash, val: shortHash, mono: true },
    { key: t.certificate.anonymizedItems, val: `${anonCount} ${t.certificate.replaced}` },
    { key: t.certificate.aiModel, val: 'Llama3-8b (Groq)', mono: true },
    { key: t.certificate.timestamp, val: timestamp },
    { key: t.certificate.status, val: t.certificate.verified, green: true },
  ];

  // Build redaction summary from spans
  const redactionSummary = spans ? spans.reduce((acc, s) => {
    acc[s.label] = (acc[s.label] || 0) + 1;
    return acc;
  }, {}) : {};

  // Calculate privacy score
  const calcPrivacyScore = () => {
    if (!spans) return 100;
    const count = spans.length;
    if (count === 0) return 100;
    if (count <= 2) return 85;
    if (count <= 5) return 70;
    if (count <= 10) return 50;
    if (count <= 20) return 30;
    return 15;
  };

  const privacyScore = calcPrivacyScore();
  const scoreColor = privacyScore >= 70 ? [52, 211, 153] : privacyScore >= 40 ? [251, 191, 36] : [248, 113, 113];
  const scoreLabel = privacyScore >= 70 ? 'Low Risk' : privacyScore >= 40 ? 'Medium Risk' : 'High Risk';

  const handleDownload = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const pad = 40;
      let y = pad;

      // ── Background ──
      doc.setFillColor(6, 10, 20);
      doc.rect(0, 0, W, H, 'F');

      // ── Header bar ──
      doc.setFillColor(13, 24, 41);
      doc.roundedRect(pad, y, W - pad * 2, 60, 8, 8, 'F');
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(1);
      doc.roundedRect(pad, y, W - pad * 2, 60, 8, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(96, 165, 250);
      doc.text('AxiomeVault — Trust Certificate', pad + 20, y + 38);
      y += 80;

      // ── Privacy Score ──
      doc.setFillColor(13, 24, 41);
      doc.roundedRect(pad, y, W - pad * 2, 70, 8, 8, 'F');
      doc.setDrawColor(...scoreColor);
      doc.setLineWidth(1);
      doc.roundedRect(pad, y, W - pad * 2, 70, 8, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('PRIVACY SCORE', pad + 20, y + 22);

      doc.setFontSize(28);
      doc.setTextColor(...scoreColor);
      doc.text(`${privacyScore}/100`, pad + 20, y + 52);

      doc.setFontSize(11);
      doc.setTextColor(...scoreColor);
      doc.text(scoreLabel, pad + 110, y + 52);

      // Score bar
      const barX = W - pad - 160;
      const barW = 140;
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(barX, y + 30, barW, 10, 5, 5, 'F');
      doc.setFillColor(...scoreColor);
      doc.roundedRect(barX, y + 30, barW * (privacyScore / 100), 10, 5, 5, 'F');
      y += 90;

      // ── Document Info ──
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
        { key: t.certificate.documentHash, val: pdfHash },
        { key: t.certificate.anonymizedItems, val: `${anonCount} ${t.certificate.replaced}` },
        { key: t.certificate.aiModel, val: 'Llama3-8b (Groq)' },
        { key: t.certificate.timestamp, val: timestamp },
        { key: t.certificate.status, val: 'VERIFIED' },
        { key: 'Blockchain Proof', val: proofUrl },
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

      // ── Redaction Summary ──
      if (Object.keys(redactionSummary).length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(96, 165, 250);
        doc.text('PROTECTED DATA SUMMARY', pad, y);
        y += 14;

        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(pad, y, W - pad, y);
        y += 16;

        Object.entries(redactionSummary).forEach(([label, count]) => {
          const cfg = ENTITY_CONFIG[label] || { name: label };
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(148, 163, 184);
          doc.text(`${cfg.name || label}`, pad, y);
          doc.setTextColor(52, 211, 153);
          doc.text(`${count} item${count > 1 ? 's' : ''} redacted`, W - pad, y, { align: 'right' });
          doc.setDrawColor(20, 30, 55);
          doc.setLineWidth(0.3);
          doc.line(pad, y + 8, W - pad, y + 8);
          y += 22;
        });

        y += 10;
      }

      // ── AI Analysis ──
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

        const analysisLines = doc.splitTextToSize(analysis, W - pad * 2);
        // Limit to avoid overflow
        const maxLines = Math.min(analysisLines.length, 40);
        analysisLines.slice(0, maxLines).forEach(line => {
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

      // ── Footer ──
      const footerY = H - 30;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('Generated by AxiomeVault — Privacy-First Document Analysis', W / 2, footerY, { align: 'center' });

      doc.save('axiomevault-trust-certificate.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF generation failed: ' + err.message);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(13,24,41,0.9), rgba(6,10,20,0.95))',
      border: '1px solid rgba(30,58,138,0.5)',
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
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'rgba(96,165,250,0.12)',
            border: '1px solid rgba(96,165,250,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
          }}>🏅</span>
          {t.certificate.title.replace('🏅 ', '')}
        </div>

        <button
          onClick={handleDownload}
          style={{
            background: 'rgba(96,165,250,0.08)',
            border: '1px solid rgba(96,165,250,0.22)',
            borderRadius: 8, color: '#60a5fa',
            fontSize: 11, fontWeight: 600,
            padding: '5px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
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
          ⬇ {t.buttons.downloadPdf}
        </button>
      </div>

      {/* Privacy Score */}
      <div style={{
        marginBottom: 16,
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        border: `1px solid rgba(${scoreColor.join(',')},0.2)`,
      }}>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          🛡️ Privacy Score
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: `rgb(${scoreColor.join(',')})` }}>
            {privacyScore}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{
                height: '100%',
                width: `${privacyScore}%`,
                background: `rgb(${scoreColor.join(',')})`,
                borderRadius: 3,
                transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: `rgb(${scoreColor.join(',')})`, fontWeight: 600 }}>
              {scoreLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ key, val, green, mono }) => (
        <div key={key} style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 16,
          padding: '8px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontSize: 12,
        }}>
          <span style={{ color: '#475569', flexShrink: 0 }}>{key}</span>
          <span style={{
            color: green ? '#34d399' : '#94a3b8',
            fontFamily: mono ? 'monospace' : 'inherit',
            fontSize: mono ? 11 : 12,
            textAlign: 'right', maxWidth: 240,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            direction: 'ltr',
          }}>{val}</span>
        </div>
      ))}

      {/* Blockchain link */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 16, padding: '8px 0', fontSize: 12,
      }}>
        <span style={{ color: '#475569', flexShrink: 0 }}>{t.certificate.blockchainProof}</span>
        <a href={proofUrl} target="_blank" rel="noreferrer" style={{
          color: '#60a5fa', fontSize: 11, textDecoration: 'none',
          textAlign: 'right', direction: 'ltr', whiteSpace: 'nowrap',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
          onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
        >
          {t.results.viewOnEtherscan}
        </a>
      </div>
    </div>
  );
}
