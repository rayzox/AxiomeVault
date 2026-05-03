import { useState } from 'react';

export default function UploadZone({ onFileLoaded }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => onFileLoaded(f, e.target.result);
    reader.readAsText(f);
  };

  return (
    <div>
      <div
        onClick={() => document.getElementById('file-input').click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          border: `2px dashed ${dragging ? '#3b82f6' : '#1e3a5f'}`,
          borderRadius: '12px',
          padding: '2.5rem 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#0d1e35' : '#0d1829',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>📁</div>
        <div style={{ fontSize: '15px', fontWeight: 500, color: '#cbd5e1', marginBottom: '4px' }}>
          Drop your document here
        </div>
        <div style={{ fontSize: '12px', color: '#475569' }}>
          TXT, PDF, DOCX — anonymized before leaving your browser
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        accept=".txt,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {file && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px', background: '#0d1829',
          borderRadius: '8px', marginTop: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>{file.name}</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <span style={{
            fontSize: '11px', color: '#34d399',
            background: '#0a2318', padding: '3px 8px',
            borderRadius: '6px', border: '1px solid #134e2a'
          }}>🔒 Local only</span>
        </div>
      )}
    </div>
  );
}