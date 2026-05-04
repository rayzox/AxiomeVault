import { languages } from '../i18n/translations';

export default function LanguageToggle({ lang, onChange }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      marginTop: '14px',
    }}>
      {languages.map((language) => {
        const active = lang === language.code;

        return (
          <button
            key={language.code}
            onClick={() => onChange(language.code)}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: active ? '1px solid #60a5fa' : '1px solid #1e293b',
              background: active ? '#0d1e35' : '#0d1117',
              color: active ? '#60a5fa' : '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}