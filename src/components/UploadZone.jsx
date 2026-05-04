import { useState } from 'react';
import { extractTextFromPDF } from '../utils/pdfReader';

export default function UploadZone({ onFileLoaded, t }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [reading, setReading] = useState(false);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setReading(true);

    try {
      let text = '';

      if (f.type === 'application/pdf') {
        text = await extractTextFromPDF(f);
      } else {
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(f);
        });
      }

      onFileLoaded(f, text);
    } catch (err) {
      console.error('File reading error:', err);
    } finally {
      setReading(false);
    }
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
          {t.upload.drop}
        </div>
        <div style={{ fontSize: '12px', color: '#475569' }}>
          {t.upload.hint}
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        accept=".txt,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {reading && (
        <div style={{
          marginTop: '10px', padding: '10px',
          background: '#0d1829', borderRadius: '8px',
          fontSize: '13px', color: '#60a5fa', textAlign: 'center'
        }}>
         {t.upload.reading}
        </div>
      )}

      {file && !reading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px', background: '#0d1829',
          borderRadius: '8px', marginTop: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>
            {file.type === 'application/pdf' ? '📕' : '📄'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>
              {file.name}
            </div>
            <div style={{ fontSize: '11px', color: '#475569' }}>
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <span style={{
            fontSize: '11px', color: '#34d399',
            background: '#0a2318', padding: '3px 8px',
            borderRadius: '6px', border: '1px solid #134e2a'
          }}>{t.upload.localOnly}</span>
        </div>
      )}
    </div>
  );
}