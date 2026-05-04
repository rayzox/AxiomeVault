import { useState } from 'react';
import Home from './pages/Home';
import { translations, getLanguageConfig } from './i18n/translations';

export default function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('axiomevault_lang') || 'en';
  });

  const languageConfig = getLanguageConfig(lang);
  const t = translations[lang];

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('axiomevault_lang', newLang);
  };

  return (
    <div
      lang={lang}
      dir={languageConfig.dir}
      style={{
        background: '#0a0e1a',
        minHeight: '100vh',
      }}
    >
      <Home
        lang={lang}
        t={t}
        onLanguageChange={changeLanguage}
      />
    </div>
  );
}