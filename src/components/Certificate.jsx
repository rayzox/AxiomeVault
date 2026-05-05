export default function Certificate({ hash, anonCount, proofUrl, timestamp, t }) {
  const shortHash = hash ? `${hash.substring(0, 22)}...` : 'N/A';
  const pdfHash = hash ? `${hash.substring(0, 30)}...` : 'N/A';

  const rows = [
    { key: t.certificate.documentHash, val: shortHash, mono: true },
    { key: t.certificate.anonymizedItems, val: `${anonCount} ${t.certificate.replaced}` },
    { key: t.certificate.aiModel, val: 'Llama3-8b (Groq)', mono: true },
    { key: t.certificate.timestamp, val: timestamp },
    { key: t.certificate.status, val: t.certificate.verified, green: true },
  ];

  const handleDownload = async () => {
    const { jsPDF } = await import(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    );
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const pad = 40;

    doc.setFillColor(6, 10, 20);
    doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), 'F');

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(1);
    doc.roundedRect(pad, pad, W - pad * 2, 310, 10, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(96, 165, 250);
    doc.text(t.certificate.title.replace('🏅 ', ''), pad + 20, pad + 38);

    doc.setDrawColor(26, 37, 64);
    doc.setLineWidth(0.5);
    doc.line(pad + 20, pad + 54, W - pad - 20, pad + 54);

    const pdfRows = [
      { key: t.certificate.documentHash, val: pdfHash },
      { key: t.certificate.anonymizedItems, val: `${anonCount} ${t.certificate.replaced}` },
      { key: t.certificate.aiModel, val: 'Llama3-8b (Groq)' },
      { key: t.certificate.timestamp, val: timestamp },
      { key: t.certificate.status, val: t.certificate.verified.replace('✅ ', ''), green: true },
      { key: t.certificate.blockchainProof, val: proofUrl },
    ];

    let y = pad + 86;
    pdfRows.forEach(({ key, val, green }) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(String(key), pad + 20, y);
      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(green ? 52 : 148, green ? 211 : 163, green ? 153 : 184);
      doc.text(String(val), W - pad - 20, y, { align: 'right', maxWidth: 260 });
      doc.setDrawColor(20, 30, 55);
      doc.line(pad + 20, y + 12, W - pad - 20, y + 12);
      y += 38;
    });

    doc.save('axiomevault-trust-certificate.pdf');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(13,24,41,0.9), rgba(6,10,20,0.95))',
      border: '1px solid rgba(30,58,138,0.5)',
      borderRadius: 16, padding: '1.35rem',
      backdropFilter: 'blur(8px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Corner glow accent */}
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
