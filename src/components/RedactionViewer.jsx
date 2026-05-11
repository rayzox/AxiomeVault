import { useEffect, useRef, useState } from 'react';
import {
  Play, RotateCcw, Eye, EyeOff, ScanLine,
  User, MapPin, Building2, Calendar, DollarSign,
  Mail, Phone, CreditCard, Home, Hash,
  Plane, Globe, Link2, Shield
} from 'lucide-react';

const TYPE_ICONS = {
  PERSON: User, LOCATION: MapPin, ORG: Building2, DATE: Calendar,
  AMOUNT: DollarSign, EMAIL: Mail, PHONE: Phone, CIN: Hash,
  ADDRESS: Home, PASSPORT: Plane, CREDIT: CreditCard, IP: Globe, URL: Link2,
};

const TYPE_STYLES = {
  PERSON:   { color: '#f472b6', bg: 'rgba(244,114,182,0.15)', label: { en: 'Person', fr: 'Personne', ar: 'شخص' } },
  LOCATION: { color: '#34d399', bg: 'rgba(52,211,153,0.15)',   label: { en: 'Location', fr: 'Lieu', ar: 'موقع' } },
  ORG:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)',  label: { en: 'Organization', fr: 'Organisation', ar: 'منظمة' } },
  DATE:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',   label: { en: 'Date', fr: 'Date', ar: 'تاريخ' } },
  AMOUNT:   { color: '#f87171', bg: 'rgba(248,113,113,0.15)',  label: { en: 'Amount', fr: 'Montant', ar: 'مبلغ' } },
  EMAIL:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',   label: { en: 'Email', fr: 'Email', ar: 'بريد' } },
  PHONE:    { color: '#2dd4bf', bg: 'rgba(45,212,191,0.15)',   label: { en: 'Phone', fr: 'Téléphone', ar: 'هاتف' } },
  CIN:      { color: '#fb923c', bg: 'rgba(251,146,60,0.15)',   label: { en: 'ID', fr: 'CIN', ar: 'بطاقة' } },
  ADDRESS:  { color: '#a3e635', bg: 'rgba(163,230,53,0.15)',   label: { en: 'Address', fr: 'Adresse', ar: 'عنوان' } },
  PASSPORT: { color: '#e879f9', bg: 'rgba(232,121,249,0.15)',  label: { en: 'Passport', fr: 'Passeport', ar: 'جواز' } },
  CREDIT:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)',    label: { en: 'Card', fr: 'Carte', ar: 'بطاقة' } },
  IP:       { color: '#38bdf8', bg: 'rgba(56,189,248,0.15)',   label: { en: 'IP', fr: 'IP', ar: 'آي بي' } },
  URL:      { color: '#818cf8', bg: 'rgba(129,140,248,0.15)',  label: { en: 'URL', fr: 'URL', ar: 'رابط' } },
};

function getLabel(labelKey, lang) {
  return TYPE_STYLES[labelKey]?.label[lang] || TYPE_STYLES[labelKey]?.label.en || labelKey;
}

function buildSegments(text, spans) {
  if (!text || !spans || spans.length === 0) return [{ text, span: null }];
  const segments = [];
  let cursor = 0;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  for (const span of sorted) {
    if (span.start > cursor) {
      segments.push({ text: text.slice(cursor, span.start), span: null });
    }
    segments.push({ text: span.text, span });
    cursor = span.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), span: null });
  }
  return segments;
}

export default function RedactionViewer({ originalText, spans, lang = 'en' }) {
  const [phase, setPhase] = useState('original');
  const [revealedCount, setRevealedCount] = useState(0);
  const [started, setStarted] = useState(false);
  const timersRef = useRef([]);

  const preview = originalText?.slice(0, 700) || '';
  const previewSpans = spans?.filter(s => s.start < 700) || [];
  const segments = buildSegments(preview, previewSpans);
  const spanSegments = segments.filter(s => s.span);

  const labels = {
    title:    lang === 'ar' ? 'تصور الإخفاء' : lang === 'fr' ? 'Visualisation' : 'Redaction View',
    original: lang === 'ar' ? 'النص الأصلي' : lang === 'fr' ? 'Original' : 'Original',
    redacted: lang === 'ar' ? 'مُخفى' : lang === 'fr' ? 'Anonymisé' : 'Redacted',
    startBtn: lang === 'ar' ? 'شاهد الإخفاء' : lang === 'fr' ? 'Lancer' : 'Watch Redaction',
    resetBtn: lang === 'ar' ? 'إعادة' : lang === 'fr' ? 'Rejouer' : 'Replay',
    detected: lang === 'ar' ? 'عناصر' : lang === 'fr' ? 'Éléments' : 'Entities',
  };

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setPhase('original');
    setRevealedCount(0);
    setStarted(true);

    const t1 = setTimeout(() => setPhase('highlighting'), 400);
    timersRef.current.push(t1);

    spanSegments.forEach((_, i) => {
      const t = setTimeout(() => setRevealedCount(i + 1), 600 + i * 180);
      timersRef.current.push(t);
    });

    const t2 = setTimeout(() => setPhase('redacted'), 600 + spanSegments.length * 180 + 500);
    timersRef.current.push(t2);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScanLine size={16} color="#60a5fa" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {labels.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PhaseTab active={phase === 'original' || phase === 'highlighting'} label={labels.original} icon={<Eye size={12} />} />
          <span style={{ color: '#334155', fontSize: 10 }}>→</span>
          <PhaseTab active={phase === 'redacted'} label={labels.redacted} icon={<EyeOff size={12} />} color="#34d399" />
        </div>
      </div>

      {/* Entity legend */}
      {spans && spans.length > 0 && (
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexWrap: 'wrap', gap: 6,
        }}>
          {Object.entries(
            spans.reduce((acc, s) => { acc[s.label] = (acc[s.label] || 0) + 1; return acc; }, {})
          ).map(([label, count]) => {
            const cfg = TYPE_STYLES[label] || { color: '#93c5fd', bg: 'rgba(96,165,250,0.1)' };
            const IconComp = TYPE_ICONS[label] || Shield;
            return (
              <span key={label} style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 20,
                background: cfg.bg,
                border: `1px solid ${cfg.color}44`,
                color: cfg.color,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <IconComp size={11} strokeWidth={2.5} />
                {count} {getLabel(label, lang)}
              </span>
            );
          })}
        </div>
      )}

      {/* Text display */}
      <div style={{
        padding: '16px',
        minHeight: 140,
        maxHeight: 260,
        overflowY: 'auto',
        fontSize: 13,
        lineHeight: 1.8,
        color: '#94a3b8',
        fontFamily: 'monospace',
        direction: 'ltr',
        textAlign: 'left',
        position: 'relative',
      }}>
        {!started ? (
          <span style={{ color: '#475569' }}>{preview}{originalText?.length > 700 ? '...' : ''}</span>
        ) : (
          segments.map((seg, i) => {
            if (!seg.span) {
              return <span key={i} style={{ color: '#475569' }}>{seg.text}</span>;
            }

            const cfg = TYPE_STYLES[seg.span.label] || { color: '#93c5fd', bg: 'rgba(96,165,250,0.1)' };
            const segIndex = spanSegments.findIndex(s => s.span === seg.span);
            const isHighlighted = phase === 'highlighting' && segIndex < revealedCount;
            const isRedacted = phase === 'redacted';

            if (isRedacted) {
              return (
                <span key={i} style={{
                  display: 'inline-block',
                  background: cfg.color,
                  borderRadius: 3,
                  color: 'transparent',
                  fontSize: 11,
                  padding: '1px 4px',
                  margin: '0 1px',
                  verticalAlign: 'middle',
                  transition: 'all 0.4s ease',
                  userSelect: 'none',
                  minWidth: `${Math.max(seg.text.length * 6, 20)}px`,
                }}>
                  {seg.text}
                </span>
              );
            }

            if (isHighlighted) {
              return (
                <span key={i} style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.color}66`,
                  borderRadius: 4,
                  color: cfg.color,
                  padding: '1px 4px',
                  margin: '0 1px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}>
                  {seg.text}
                </span>
              );
            }

            return <span key={i} style={{ color: '#475569' }}>{seg.text}</span>;
          })
        )}
      </div>

      {/* Progress bar */}
      {started && phase === 'highlighting' && (
        <div style={{ padding: '0 16px', marginBottom: 8 }}>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
              width: `${(revealedCount / Math.max(spanSegments.length, 1)) * 100}%`,
              transition: 'width 0.18s ease',
              borderRadius: 2,
            }} />
          </div>
          <div style={{ fontSize: 10, color: '#334155', marginTop: 4, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
            {revealedCount} / {spanSegments.length} {labels.detected}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={startAnimation}
          className="btn-premium"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 10,
            border: phase === 'redacted'
              ? '1px solid rgba(52,211,153,0.3)'
              : '1px solid rgba(96,165,250,0.3)',
            background: phase === 'redacted'
              ? 'rgba(52,211,153,0.08)'
              : 'rgba(96,165,250,0.08)',
            color: phase === 'redacted' ? '#34d399' : '#60a5fa',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {phase === 'redacted' ? (
            <><RotateCcw size={15} /> {labels.resetBtn}</>
          ) : (
            <><Play size={15} /> {labels.startBtn}</>
          )}
        </button>
      </div>
    </div>
  );
}

function PhaseTab({ active, label, icon, color = '#60a5fa' }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '3px 8px',
      borderRadius: 6,
      background: active ? `${color}22` : 'transparent',
      color: active ? color : '#334155',
      border: `1px solid ${active ? color + '44' : 'transparent'}`,
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {icon} {label}
    </span>
  );
}