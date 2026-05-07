import { useState } from 'react';
import { extractTextFromPDF } from '../utils/pdfReader';

export default function UploadZone({ onFileLoaded, onError, t }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [reading, setReading] = useState(false);

  const handleFile = async (f) => {
    if (!f) return;

    const fileName = f.name.toLowerCase();
    const isPdf = f.type === 'application/pdf' || fileName.endsWith('.pdf');
    const isTxt = f.type === 'text/plain' || fileName.endsWith('.txt');

    if (!isPdf && !isTxt) {
      setFile(null);

      const fileError = new Error(
        'Unsupported file type. Only TXT and PDF files are allowed.'
      );
      fileError.code = 'UNSUPPORTED_FILE_TYPE';

      onError?.(fileError, 'file');
      return;
    }

    setFile(f);
    setReading(true);

    try {
      let text = '';

      if (isPdf) {
        text = await extractTextFromPDF(f);
      } else {
        const reader = new FileReader();

        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result || '');
          reader.onerror = () =>
            reject(reader.error || new Error('FileReader failed'));
          reader.readAsText(f);
        });
      }

      if (!text || !text.trim()) {
        const emptyError = new Error(
          'The selected document is empty or does not contain readable text.'
        );
        emptyError.code = 'EMPTY_DOCUMENT';

        setFile(null);
        onError?.(emptyError, 'file');
        return;
      }

      onFileLoaded(f, text);
    } catch (err) {
      console.error('File reading error:', err);
      setFile(null);
      onError?.(err, 'file');
    } finally {
      setReading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => document.getElementById('file-input')?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          border: `2px dashed ${
            dragging ? '#3b82f6' : 'rgba(96,165,250,0.2)'
          }`,
          borderRadius: 14,
          padding: '2.5rem 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging
            ? 'rgba(29,78,216,0.08)'
            : 'rgba(96,165,250,0.03)',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!dragging) {
            e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!dragging) {
            e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)';
          }
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            margin: '0 auto 14px',
            background: 'rgba(96,165,250,0.08)',
            border: '1px solid rgba(96,165,250,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          📁
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#cbd5e1',
            marginBottom: 5,
          }}
        >
          {t.upload.drop}
        </div>

        <div
          style={{
            fontSize: 12,
            color: 'rgba(100,116,139,0.8)',
          }}
        >
          {t.upload.hint}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontSize: 10,
            color: '#34d399',
            background: 'rgba(10,35,24,0.8)',
            padding: '3px 9px',
            borderRadius: 6,
            border: '1px solid rgba(52,211,153,0.2)',
            letterSpacing: '0.04em',
            fontWeight: 600,
          }}
        >
          {t.upload.localOnly}
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
        <div
          style={{
            marginTop: 10,
            padding: '10px 14px',
            background: 'rgba(96,165,250,0.06)',
            borderRadius: 10,
            fontSize: 13,
            color: '#60a5fa',
            textAlign: 'center',
            border: '1px solid rgba(96,165,250,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <LoadingDots /> {t.upload.reading}
        </div>
      )}

      {file && !reading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>
            {file.name.toLowerCase().endsWith('.pdf') ? '📕' : '📄'}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                color: '#cbd5e1',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </div>

            <div style={{ fontSize: 11, color: '#475569' }}>
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>

          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34d399',
              flexShrink: 0,
            }}
          />
        </div>
      )}
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#60a5fa',
            display: 'inline-block',
            animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}

      <style>
        {
          '@keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}'
        }
      </style>
    </span>
  );
}