import { jsPDF } from "jspdf";

export default function Certificate({ hash, anonCount, proofUrl, timestamp }) {
  const handleDownload = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const pad = 40;

    // Background
    doc.setFillColor(13, 24, 41);
    doc.rect(0, 0, W, H, "F");

    // Border
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(1.5);
    doc.roundedRect(pad, pad, W - pad * 2, 240, 8, 8, "S");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(96, 165, 250);
    doc.text("Trust Certificate", pad + 20, pad + 36);

    // Divider
    doc.setDrawColor(26, 37, 64);
    doc.setLineWidth(0.5);
    doc.line(pad + 20, pad + 48, W - pad - 20, pad + 48);

    const rows = [
      { key: "Document Hash", val: hash.substring(0, 30) + "..." },
      { key: "Anonymized Items", val: `${anonCount} sensitive items replaced` },
      { key: "AI Model", val: "Llama3-8b (Groq)" },
      { key: "Timestamp", val: timestamp },
      { key: "Status", val: "VERIFIED" },
      { key: "Blockchain Proof", val: proofUrl },
    ];

    let y = pad + 72;
    rows.forEach(({ key, val }) => {
      // Key
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(key, pad + 20, y);

      // Value
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      const isStatus = key === "Status";
      doc.setTextColor(
        isStatus ? 52 : 148,
        isStatus ? 211 : 163,
        isStatus ? 153 : 184
      );
      doc.text(val, W - pad - 20, y, { align: "right", maxWidth: 240 });

      // Row divider
      doc.setDrawColor(26, 37, 64);
      doc.setLineWidth(0.4);
      doc.line(pad + 20, y + 10, W - pad - 20, y + 10);

      y += 34;
    });

    doc.save("trust-certificate.pdf");
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0d1829, #0a0e1a)",
      border: "1px solid #1e3a5f",
      borderRadius: "12px",
      padding: "1.25rem",
      marginTop: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#60a5fa" }}>
          🏅 Trust Certificate
        </div>
        <button
          onClick={handleDownload}
          style={{
            background: "transparent",
            border: "1px solid #1e3a5f",
            borderRadius: "6px",
            color: "#60a5fa",
            fontSize: "11px",
            padding: "4px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          ⬇ Download PDF
        </button>
      </div>

      {[
        { key: "Document Hash", val: hash.substring(0, 20) + "..." },
        { key: "Anonymized Items", val: `${anonCount} sensitive items replaced` },
        { key: "AI Model", val: "Llama3-8b (Groq)" },
        { key: "Timestamp", val: timestamp },
        { key: "Status", val: "✅ VERIFIED", green: true },
      ].map(({ key, val, green }) => (
        <div key={key} style={{
          display: "flex", justifyContent: "space-between",
          padding: "6px 0", borderBottom: "1px solid #1a2540",
          fontSize: "12px",
        }}>
          <span style={{ color: "#475569" }}>{key}</span>
          <span style={{
            color: green ? "#34d399" : "#94a3b8",
            fontFamily: "monospace", fontSize: "11px",
            textAlign: "right", maxWidth: "220px",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>{val}</span>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px" }}>
        <span style={{ color: "#475569" }}>Blockchain Proof</span>
        <a href={proofUrl} target="_blank" rel="noreferrer" style={{
          color: "#60a5fa", fontSize: "11px", textDecoration: "none",
        }}>View on Etherscan →</a>
      </div>
    </div>
  );
}