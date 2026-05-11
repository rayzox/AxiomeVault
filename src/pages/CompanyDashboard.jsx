import { getCompanyDocuments } from '../data/companyMockDocuments';

export default function CompanyDashboard({ companySession, onLogout, onBackHome }) {
  const documents = getCompanyDocuments(companySession?.companyId);
  const total = documents.length;
  const verified = documents.filter((doc) => doc.status === 'Verified').length;
  const pending = documents.filter((doc) => doc.status === 'Pending').length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backButton} onClick={onBackHome}>← Home</button>

        <div style={styles.headerRight}>
          <div style={styles.companyTag}>{companySession?.companyName || 'Company'}</div>
          <button style={styles.logoutButton} onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.titleRow}>
          <div>
            <p style={styles.kicker}>Company Mode Dashboard</p>
            <h1 style={styles.title}>Company documents</h1>
            <p style={styles.subtitle}>Manage your company-owned documents in one place.</p>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <StatCard label="Total documents" value={total} />
          <StatCard label="Verified documents" value={verified} />
          <StatCard label="Pending documents" value={pending} />
        </section>

        <section style={styles.privacyNotice}>
          <strong>Privacy notice:</strong> This dashboard does not track user activity. It does not show user names, IP addresses, location, device information, view counts, click history, logs, analytics, or tracking data.
        </section>

        <section style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Document title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Upload date</th>
                <th style={styles.th}>Expiration date</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} style={styles.row}>
                  <td style={styles.td}>{document.title}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusPill,
                        ...(document.status === 'Verified'
                          ? styles.statusVerified
                          : styles.statusPending),
                      }}
                    >
                      {document.status}
                    </span>
                  </td>
                  <td style={styles.td}>{document.uploadDate}</td>
                  <td style={styles.td}>{document.expirationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </article>
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
    maxWidth: '1080px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  companyTag: {
    background: 'rgba(96,165,250,0.12)',
    border: '1px solid rgba(96,165,250,0.3)',
    color: '#bfdbfe',
    borderRadius: '999px',
    padding: '6px 12px',
    fontSize: '13px',
  },
  logoutButton: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  main: {
    maxWidth: '1080px',
    margin: '0 auto',
    display: 'grid',
    gap: '18px',
  },
  titleRow: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '22px',
  },
  kicker: {
    color: '#60a5fa',
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  title: {
    fontSize: '30px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#94a3b8',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '16px',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '30px',
    fontWeight: 700,
    color: '#f1f5f9',
  },
  privacyNotice: {
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '14px',
    padding: '14px 16px',
    color: '#bbf7d0',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  tableWrap: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '8px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  th: {
    textAlign: 'left',
    color: '#93c5fd',
    fontSize: '12px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  row: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  td: {
    padding: '14px',
    color: '#e2e8f0',
    fontSize: '14px',
  },
  statusPill: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: 600,
  },
  statusVerified: {
    background: 'rgba(16,185,129,0.18)',
    color: '#6ee7b7',
    border: '1px solid rgba(16,185,129,0.35)',
  },
  statusPending: {
    background: 'rgba(245,158,11,0.18)',
    color: '#fcd34d',
    border: '1px solid rgba(245,158,11,0.35)',
  },
};
