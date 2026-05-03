export default function Certificate({ hash, anonCount, proofUrl, timestamp }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d1829, #0a0e1a)',
      border: '1px solid #1e3a5f',
      borderRadius: '12px',
      padding: '1.25rem',
      marginTop: '12px'
    }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#60a5fa', marginBottom: '12px' }}>
        🏅 Trust Certificate
      </div>

      {[
        { key: 'Document Hash', val: hash.substring(0, 20) + '...' },
        { key: 'Anonymized Items', val: `${anonCount} sensitive items replaced` },
        { key: 'AI Model', val: 'Llama3-8b (Groq)' },
        { key: 'Timestamp', val: timestamp },
        { key: 'Status', val: '✅ VERIFIED', green: true },
      ].map(({ key, val, green }) => (
        <div key={key} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '6px 0', borderBottom: '1px solid #1a2540',
          fontSize: '12px'
        }}>
          <span style={{ color: '#475569' }}>{key}</span>
          <span style={{
            color: green ? '#34d399' : '#94a3b8',
            fontFamily: 'monospace', fontSize: '11px',
            textAlign: 'right', maxWidth: '220px',
            overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{val}</span>
        </div>
      ))}

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '6px 0', fontSize: '12px'
      }}>
        <span style={{ color: '#475569' }}>Blockchain Proof</span>
        <a href={proofUrl} target="_blank" rel="noreferrer" style={{
          color: '#60a5fa', fontSize: '11px', textDecoration: 'none'
        }}>View on Etherscan →</a>
      </div>
    </div>
  );
}