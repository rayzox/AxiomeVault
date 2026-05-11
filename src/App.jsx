import { useEffect, useMemo, useState } from 'react';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import CompanySignup from './pages/CompanySignup';
import CompanyLogin from './pages/CompanyLogin';
import CompanyDashboard from './pages/CompanyDashboard';
import { translations, getLanguageConfig } from './i18n/translations';

const COMPANY_ROUTES = {
  signup: '/company/signup',
  login: '/company/login',
  dashboard: '/company/dashboard',
};

function getInitialViewFromPath() {
  const path = window.location.pathname;

  if (path === COMPANY_ROUTES.signup) return 'company-signup';
  if (path === COMPANY_ROUTES.login) return 'company-login';
  if (path === COMPANY_ROUTES.dashboard) return 'company-dashboard';

  return 'landing';
}

function pathForView(view) {
  if (view === 'company-signup') return COMPANY_ROUTES.signup;
  if (view === 'company-login') return COMPANY_ROUTES.login;
  if (view === 'company-dashboard') return COMPANY_ROUTES.dashboard;
  return '/';
}

export default function App() {
  const [lang, setLang] = useState(
    () => localStorage.getItem('axiomevault_lang') || 'en'
  );
  const [view, setView] = useState(() => getInitialViewFromPath());
  const [companySession, setCompanySession] = useState(null);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('axiomevault_lang', newLang);
  };

  const languageConfig = getLanguageConfig(lang);
  const t = translations[lang];

  const navigateTo = useMemo(() => {
    return (nextView, options = {}) => {
      const targetPath = pathForView(nextView);
      const currentPath = window.location.pathname;

      if (targetPath !== currentPath) {
        if (options.replace) {
          window.history.replaceState({}, '', targetPath);
        } else {
          window.history.pushState({}, '', targetPath);
        }
      }

      setView(nextView);
    };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const nextView = getInitialViewFromPath();
      setView(nextView);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (view === 'company-dashboard' && !companySession) {
      navigateTo('company-login', { replace: true });
    }
  }, [view, companySession, navigateTo]);

  const goHome = () => navigateTo('landing');

  const enterAnalyzer = () => navigateTo('app');

  const handleCompanySignup = (company) => {
    setCompanySession(company);
    navigateTo('company-dashboard');
  };

  const handleCompanyLogin = (company) => {
    setCompanySession(company);
    navigateTo('company-dashboard');
  };

  const handleCompanyLogout = () => {
    setCompanySession(null);
    navigateTo('company-login');
  };

  if (view === 'landing') {
    return (
      <LandingPage
        lang={lang}
        setLang={handleLangChange}
        onEnter={enterAnalyzer}
        onCompanyMode={() => navigateTo('company-login')}
      />
    );
  }

  if (view === 'company-signup') {
    return (
      <CompanySignup
        onSignup={handleCompanySignup}
        onGoToLogin={() => navigateTo('company-login')}
        onBackHome={goHome}
      />
    );
  }

  if (view === 'company-login') {
    return (
      <CompanyLogin
        onLogin={handleCompanyLogin}
        onGoToSignup={() => navigateTo('company-signup')}
        onBackHome={goHome}
      />
    );
  }

  if (view === 'company-dashboard') {
    if (!companySession) return null;

    return (
      <CompanyDashboard
        companySession={companySession}
        onLogout={handleCompanyLogout}
        onBackHome={goHome}
      />
    );
  }

  return (
    <div
      lang={lang}
      dir={languageConfig.dir}
      style={{ background: '#0a0e1a', minHeight: '100vh' }}
    >
      <div
        style={{
          position: 'fixed',
          top: 16,
          ...(languageConfig.dir === 'rtl' ? { right: 16 } : { left: 16 }),
          zIndex: 200,
        }}
      >
        <button
          onClick={() => navigateTo('landing')}
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
