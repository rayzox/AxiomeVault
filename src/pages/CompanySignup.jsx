import { useState } from 'react';

export default function CompanySignup({ onSignup, onGoToLogin, onBackHome }) {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!companyName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    onSignup({
      companyId: `company-${Date.now()}`,
      companyName: companyName.trim(),
      email: email.trim(),
    });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backButton} onClick={onBackHome}>← Home</button>
        <div style={styles.brand}>AxiomeVault · Company</div>
      </header>

      <main style={styles.centerWrap}>
        <section style={styles.card}>
          <p style={styles.kicker}>Company Mode</p>
          <h1 style={styles.title}>Create company access</h1>
          <p style={styles.subtitle}>
            MVP simulation only. No backend and no persistent storage.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Company name
              <input
                style={styles.input}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corporation"
              />
            </label>

            <label style={styles.label}>
              Work email
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="company@example.com"
              />
            </label>

            <label style={styles.label}>
              Password
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error ? <p style={styles.error}>{error}</p> : null}

            <button type="submit" style={styles.primaryButton}>
              Continue to Dashboard
            </button>
          </form>

          <p style={styles.footerText}>
            Already have mock access?{' '}
            <button style={styles.linkButton} onClick={onGoToLogin}>
              Company login
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#060a14',
    color: '#e2e8f0',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    padding: '24px',
  },
  header: {
    maxWidth: '980px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  brand: {
    fontWeight: 700,
    color: '#93c5fd',
  },
  backButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#cbd5e1',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  centerWrap: {
    maxWidth: '980px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '28px',
  },
  kicker: {
    color: '#60a5fa',
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: '20px',
    lineHeight: 1.6,
  },
  form: {
    display: 'grid',
    gap: '14px',
  },
  label: {
    display: 'grid',
    gap: '6px',
    fontSize: '14px',
    color: '#cbd5e1',
  },
  input: {
    width: '100%',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(15,23,42,0.7)',
    color: '#e2e8f0',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  error: {
    color: '#fca5a5',
    fontSize: '13px',
  },
  primaryButton: {
    marginTop: '8px',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    color: '#fff',
    background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
  },
  footerText: {
    marginTop: '16px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: 0,
  },
};
