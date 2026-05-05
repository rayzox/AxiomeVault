import { languages } from '../i18n/translations';

export default function LanguageToggle({ lang, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 3,
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 8, padding: 3,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {languages.map((language) => {
        const active = lang === language.code;
        return (
          <button
            key={language.code}
            onClick={() => onChange(language.code)}
            style={{
              padding: '5px 12px', borderRadius: 6, border: 'none',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
              cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
              background: active ? 'rgba(96,165,250,0.18)' : 'transparent',
              color: active ? '#60a5fa' : 'rgba(255,255,255,0.38)',
              outline: active ? '1px solid rgba(96,165,250,0.25)' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
