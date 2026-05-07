import { useState } from 'react';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import { translations, getLanguageConfig } from './i18n/translations';

export default function App() {
  const [lang, setLang] = useState(
    () => localStorage.getItem('axiomevault_lang') || 'en'
  );
  const [view, setView] = useState('landing'); // 'landing' | 'app'

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('axiomevault_lang', newLang);
  };

  const languageConfig = getLanguageConfig(lang);
  const t = translations[lang];

  if (view === 'landing') {
    return (
      <LandingPage
        lang={lang}
        setLang={handleLangChange}
        onEnter={() => setView('app')}
      />
    );
  }

  return (
    <div
      lang={lang}
      dir={languageConfig.dir}
      style={{ background: '#0a0e1a', minHeight: '100vh' }}
    >
      {/* Back to landing */}
      <div style={{
        position: 'fixed', top: 16,
        ...(languageConfig.dir === 'rtl' ? { right: 16 } : { left: 16 }),
        zIndex: 200,
      }}>
        <button
          onClick={() => setView('landing')}
          style={{
            padding: '7px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(148,163,184,0.8)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            backdropFilter: 'blur(8px)',
          }}
        >
          ← {lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}
        </button>
      </div>

      <Home lang={lang} t={t} onLanguageChange={handleLangChange} />
    </div>
  );
}