export default function Certificate({ hash, anonCount, proofUrl, timestamp, t }) {
  const shortHash = hash ? `${hash.substring(0, 20)}...` : 'N/A';
  const pdfHash = hash ? `${hash.substring(0, 30)}...` : 'N/A';

  const rows = [
    {
      key: t.certificate.documentHash,
      val: shortHash,
    },
    {
      key: t.certificate.anonymizedItems,
      val: `${anonCount} ${t.certificate.replaced}`,
    },
    {
      key: t.certificate.aiModel,
      val: 'Llama3-8b (Groq)',
    },
    {
      key: t.certificate.timestamp,
      val: timestamp,
    },
    {
      key: t.certificate.status,
      val: t.certificate.verified,
      green: true,
    },
  ];

  const handleDownload = async () => {
    const { jsPDF } = await import(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    );

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const pad = 40;

    // Background
    doc.setFillColor(13, 24, 41);
    doc.rect(0, 0, W, H, 'F');

    // Certificate border
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(1.5);
    doc.roundedRect(pad, pad, W - pad * 2, 300, 8, 8, 'S');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(96, 165, 250);
    doc.text(t.certificate.title.replace('🏅 ', ''), pad + 20, pad + 36);

    // Divider
    doc.setDrawColor(26, 37, 64);
    doc.setLineWidth(0.5);
    doc.line(pad + 20, pad + 52, W - pad - 20, pad + 52);

    const pdfRows = [
      {
        key: t.certificate.documentHash,
        val: pdfHash,
      },
      {
        key: t.certificate.anonymizedItems,
        val: `${anonCount} ${t.certificate.replaced}`,
      },
      {
        key: t.certificate.aiModel,
        val: 'Llama3-8b (Groq)',
      },
      {
        key: t.certificate.timestamp,
        val: timestamp,
      },
      {
        key: t.certificate.status,
        val: t.certificate.verified.replace('✅ ', ''),
        green: true,
      },
      {
        key: t.certificate.blockchainProof,
        val: proofUrl,
      },
    ];

    let y = pad + 80;

    pdfRows.forEach(({ key, val, green }) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(String(key), pad + 20, y);

      doc.setFont('courier', 'normal');
      doc.setFontSize(9);

      if (green) {
        doc.setTextColor(52, 211, 153);
      } else {
        doc.setTextColor(148, 163, 184);
      }

      doc.text(String(val), W - pad - 20, y, {
        align: 'right',
        maxWidth: 250,
      });

      doc.setDrawColor(26, 37, 64);
      doc.line(pad + 20, y + 10, W - pad - 20, y + 10);

      y += 36;
    });

    doc.save('axiomevault-trust-certificate.pdf');
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0d1829, #0a0e1a)',
        border: '1px solid #1e3a5f',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#60a5fa',
          }}
        >
          {t.certificate.title}
        </div>

        <button
          onClick={handleDownload}
          style={{
            background: 'transparent',
            border: '1px solid #1e3a5f',
            borderRadius: '6px',
            color: '#60a5fa',
            fontSize: '11px',
            padding: '4px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          {t.buttons.downloadPdf}
        </button>
      </div>

      {/* Certificate rows */}
      {rows.map(({ key, val, green }) => (
        <div
          key={key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '6px 0',
            borderBottom: '1px solid #1a2540',
            fontSize: '12px',
          }}
        >
          <span style={{ color: '#475569' }}>{key}</span>

          <span
            style={{
              color: green ? '#34d399' : '#94a3b8',
              fontFamily: 'monospace',
              fontSize: '11px',
              textAlign: 'right',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              direction: 'ltr',
            }}
          >
            {val}
          </span>
        </div>
      ))}

      {/* Blockchain proof */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '6px 0',
          fontSize: '12px',
        }}
      >
        <span style={{ color: '#475569' }}>
          {t.certificate.blockchainProof}
        </span>

        <a
          href={proofUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#60a5fa',
            fontSize: '11px',
            textDecoration: 'none',
            textAlign: 'right',
            direction: 'ltr',
            whiteSpace: 'nowrap',
          }}
        >
          {t.results.viewOnEtherscan}
        </a>
      </div>
    </div>
  );
}