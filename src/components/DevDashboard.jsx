import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

  .dev-shell * { box-sizing: border-box; }

  .dev-shell {
    font-family: 'DM Sans', sans-serif;
    background: #0f0f10;
    min-height: 100vh;
    color: #e2e0d8;
    display: flex;
    flex-direction: column;
  }

  /* Topbar */
  .dev-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: #161618;
    border-bottom: 1px solid #2a2a2e;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .dev-topbar-left { display: flex; align-items: center; gap: 10px; }
  .dev-badge-dev {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    background: #FAC775;
    color: #1a0e00;
    letter-spacing: 0.06em;
  }
  .dev-app-name { font-size: 13px; font-weight: 500; color: #e2e0d8; }
  .dev-badge-env {
    font-size: 11px;
    color: #666;
    font-family: 'IBM Plex Mono', monospace;
  }
  .dev-status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #639922;
    display: inline-block;
    margin-right: 5px;
  }
  .dev-status-dot.warn { background: #EF9F27; }
  .dev-status-dot.err  { background: #E24B4A; }

  /* Tabs */
  .dev-tabs {
    display: flex;
    gap: 0;
    padding: 0 20px;
    background: #161618;
    border-bottom: 1px solid #2a2a2e;
    overflow-x: auto;
  }
  .dev-tab {
    font-size: 12px;
    font-weight: 500;
    padding: 9px 14px;
    cursor: pointer;
    color: #666;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color 0.15s;
    user-select: none;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    font-family: 'DM Sans', sans-serif;
  }
  .dev-tab:hover { color: #c2c0b6; }
  .dev-tab.active { color: #e2e0d8; border-bottom-color: #378ADD; }

  /* Content */
  .dev-content { flex: 1; padding: 20px; overflow-y: auto; }

  /* Metric grid */
  .dev-metric-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  @media (max-width: 768px) { .dev-metric-row { grid-template-columns: 1fr 1fr; } }
  .dev-metric-card {
    background: #1a1a1c;
    border: 1px solid #2a2a2e;
    border-radius: 8px;
    padding: 14px 16px;
  }
  .dev-metric-label { font-size: 11px; color: #666; margin-bottom: 6px; }
  .dev-metric-value {
    font-size: 22px;
    font-weight: 500;
    font-family: 'IBM Plex Mono', monospace;
    color: #e2e0d8;
  }
  .dev-metric-sub { font-size: 11px; color: #555; margin-top: 4px; }
  .dev-up   { color: #639922 !important; }
  .dev-down { color: #E24B4A !important; }

  /* Section title */
  .dev-section-title {
    font-size: 10px;
    font-weight: 500;
    color: #555;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 18px 0 8px;
  }

  /* Log/table box */
  .dev-log-box {
    background: #1a1a1c;
    border: 1px solid #2a2a2e;
    border-radius: 8px;
    overflow: hidden;
    font-family: 'IBM Plex Mono', monospace;
  }
  .dev-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    border-bottom: 1px solid #2a2a2e;
    font-size: 11px;
    color: #555;
  }
  .dev-log-col-row {
    display: grid;
    gap: 10px;
    padding: 5px 14px;
    font-size: 10px;
    color: #444;
    background: #141416;
    border-bottom: 1px solid #2a2a2e;
  }
  .dev-log-row {
    display: grid;
    gap: 10px;
    padding: 7px 14px;
    border-bottom: 1px solid #1e1e20;
    align-items: center;
    font-size: 11px;
    color: #a0a0a0;
    transition: background 0.1s;
  }
  .dev-log-row:last-child { border-bottom: none; }
  .dev-log-row:hover { background: #202024; }

  /* Pills */
  .dev-pill {
    display: inline-block;
    font-size: 10px;
    font-weight: 500;
    padding: 1px 7px;
    border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace;
  }
  .dev-pill-ok      { background: #1a2e10; color: #97C459; }
  .dev-pill-pending { background: #2a1e00; color: #FAC775; }
  .dev-pill-fail    { background: #2a0f0f; color: #F09595; }
  .dev-pill-cold    { background: #1a1a30; color: #85B7EB; }

  /* Info card */
  .dev-info-card {
    background: #1a1a1c;
    border: 1px solid #2a2a2e;
    border-radius: 8px;
    overflow: hidden;
  }
  .dev-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 14px;
    border-bottom: 1px solid #1e1e20;
    font-size: 12px;
  }
  .dev-info-row:last-child { border-bottom: none; }
  .dev-info-key { color: #555; }
  .dev-info-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #c2c0b6;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dev-info-val.ok   { color: #639922; }
  .dev-info-val.warn { color: #EF9F27; }
  .dev-info-val.err  { color: #E24B4A; }

  /* Two col */
  .dev-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 680px) { .dev-two-col { grid-template-columns: 1fr; } }

  /* Buttons */
  .dev-btn {
    font-size: 11px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #2a2a2e;
    background: #1a1a1c;
    color: #c2c0b6;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.12s, border-color 0.12s;
    white-space: nowrap;
  }
  .dev-btn:hover { background: #222226; border-color: #3a3a3e; }
  .dev-btn:active { transform: scale(0.98); }
  .dev-btn-primary {
    background: #185FA5;
    border-color: #185FA5;
    color: #fff;
  }
  .dev-btn-primary:hover { background: #0C447C; border-color: #0C447C; }
  .dev-btn-danger { border-color: #4a1a1a; color: #E24B4A; }
  .dev-btn-danger:hover { background: #2a0f0f; }

  /* Console */
  .dev-console-box {
    background: #0d0d0e;
    border: 1px solid #2a2a2e;
    border-radius: 8px;
    padding: 12px 14px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11.5px;
    min-height: 160px;
    max-height: 260px;
    overflow-y: auto;
  }
  .dev-console-line        { padding: 1px 0; line-height: 1.65; color: #888; }
  .dev-console-line.info   { color: #85B7EB; }
  .dev-console-line.warn   { color: #FAC775; }
  .dev-console-line.err    { color: #F09595; }
  .dev-console-line.ok     { color: #97C459; }

  /* Gas bars */
  .dev-bar-row { display: flex; align-items: flex-end; gap: 4px; height: 52px; }
  .dev-bar {
    border-radius: 2px 2px 0 0;
    flex: 1;
    min-width: 10px;
    transition: opacity 0.15s;
    cursor: default;
  }
  .dev-bar:hover { opacity: 0.7; }

  /* Network rows */
  .dev-net-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    border-bottom: 1px solid #1e1e20;
    font-size: 12px;
  }
  .dev-net-item:last-child { border-bottom: none; }
  .dev-mono { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c2c0b6; }

  /* Suggestion cards */
  .dev-feature-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 14px;
    border-bottom: 1px solid #1e1e20;
    cursor: pointer;
    transition: background 0.1s;
  }
  .dev-feature-item:last-child { border-bottom: none; }
  .dev-feature-item:hover { background: #202024; }
  .dev-feature-icon {
    width: 32px; height: 32px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    background: #222226;
  }
  .dev-feature-title { font-size: 12px; font-weight: 500; color: #e2e0d8; margin-bottom: 3px; }
  .dev-feature-desc  { font-size: 11px; color: #666; line-height: 1.55; }
  .dev-feature-tag {
    display: inline-block;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    font-family: 'IBM Plex Mono', monospace;
    background: #222226;
    color: #85B7EB;
    margin-left: 5px;
    vertical-align: middle;
  }

  /* Shortcut hint */
  .dev-kbd {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    background: #222226;
    border: 1px solid #333;
    color: #888;
  }

  /* scrollbar */
  .dev-shell ::-webkit-scrollbar { width: 5px; height: 5px; }
  .dev-shell ::-webkit-scrollbar-track { background: transparent; }
  .dev-shell ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

  /* Overlay backdrop */
  .dev-overlay-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    animation: dev-fade-in 0.15s ease;
  }

  /* Overlay panel */
  .dev-overlay-panel {
    position: fixed;
    top: 5vh;
    left: 50%;
    transform: translateX(-50%);
    width: min(1100px, 94vw);
    height: 90vh;
    z-index: 9999;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7);
    animation: dev-slide-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Close button */
  .dev-overlay-close {
    position: absolute;
    top: 10px;
    right: 14px;
    z-index: 10000;
    background: #222226;
    border: 1px solid #333;
    color: #888;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: background 0.1s, color 0.1s;
    font-family: monospace;
  }
  .dev-overlay-close:hover { background: #2a0f0f; color: #E24B4A; border-color: #4a1a1a; }

  /* Trigger hint pill — shown in corner of the app */
  .dev-trigger-hint {
    position: fixed;
    bottom: 18px;
    right: 18px;
    z-index: 9000;
    background: #161618;
    border: 1px solid #2a2a2e;
    border-radius: 8px;
    padding: 7px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #555;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    user-select: none;
  }
  .dev-trigger-hint:hover { border-color: #378ADD; color: #85B7EB; }
  .dev-trigger-hint-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #639922;
    flex-shrink: 0;
  }

  @keyframes dev-fade-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes dev-slide-in { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
`

// ─── Constants ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview'    },
  { id: 'chain',     label: 'Blockchain'  },
  { id: 'docs',      label: 'Documents'   },
  { id: 'api',       label: 'API Logs'    },
  { id: 'console',   label: 'Console'     },
  { id: 'suggest',   label: 'Suggestions' },
]

const GAS_PRICES = [18, 22, 27, 24, 31, 19, 26, 24]

const ACTIVITY_LOG = [
  { time: '14:22:01', type: 'Upload', detail: 'contract_v3.pdf — 2.1 MB',       status: 'ok',      label: 'verified' },
  { time: '13:55:47', type: 'Mint',   detail: 'Token #0x4a2f… → owner',          status: 'ok',      label: 'mined'    },
  { time: '13:12:30', type: 'API',    detail: 'POST /api/verify · 204ms',        status: 'ok',      label: '200'      },
  { time: '12:44:18', type: 'Upload', detail: 'nda_signed.pdf — 480 KB',         status: 'pending', label: 'pending'  },
  { time: '11:30:05', type: 'API',    detail: 'GET /api/doc/0x3c… · 890ms',     status: 'fail',    label: '504'      },
  { time: '10:14:59', type: 'Upload', detail: 'invoice_2025_04.pdf — 780 KB',    status: 'ok',      label: 'verified' },
]

const TX_LOG = [
  { block: '8,241,002', hash: '0x4a2f…c3e1', method: 'storeDocument()', status: 'ok',      label: 'mined'    },
  { block: '8,240,998', hash: '0x91bc…44af', method: 'verifyHash()',     status: 'ok',      label: 'mined'    },
  { block: '8,240,990', hash: '0xf3d7…09cc', method: 'mintToken()',      status: 'pending', label: 'pending'  },
  { block: '8,240,985', hash: '0x2a11…7ba4', method: 'transferOwner()',  status: 'fail',    label: 'reverted' },
]

const DOC_LOG = [
  { name: 'contract_v3.pdf',     size: '2.1 MB', hash: 'a3f9…c2d1', status: 'ok',      label: 'verified' },
  { name: 'nda_signed.pdf',      size: '480 KB', hash: '8b2e…f401', status: 'pending', label: 'pending'  },
  { name: 'invoice_2025_04.pdf', size: '780 KB', hash: 'd41d…e00b', status: 'ok',      label: 'verified' },
  { name: 'terms_of_service.pdf',size: '320 KB', hash: '5f9c…1a77', status: 'ok',      label: 'verified' },
  { name: 'audit_report_q1.pdf', size: '4.2 MB', hash: '—',         status: 'fail',    label: 'failed'   },
]

const API_ROUTES = [
  { method: 'POST', route: '/api/verify',     avg: '204ms', status: 'ok',   label: 'active' },
  { method: 'POST', route: '/api/upload',     avg: '890ms', status: 'ok',   label: 'active' },
  { method: 'GET',  route: '/api/doc/:hash',  avg: '112ms', status: 'ok',   label: 'active' },
  { method: 'GET',  route: '/api/status',     avg: '44ms',  status: 'cold', label: 'cold'   },
]

const API_LOG = [
  { time: '14:22:01', method: 'POST', route: '/api/verify',      ms: '204ms', status: 'ok',   code: '200' },
  { time: '13:55:47', method: 'POST', route: '/api/upload',      ms: '1.1s',  status: 'ok',   code: '200' },
  { time: '13:12:30', method: 'GET',  route: '/api/doc/a3f9…',  ms: '88ms',  status: 'ok',   code: '200' },
  { time: '11:30:05', method: 'GET',  route: '/api/doc/8b2e…',  ms: '890ms', status: 'fail', code: '504' },
  { time: '10:14:59', method: 'POST', route: '/api/verify',      ms: '312ms', status: 'ok',   code: '200' },
]

const SUGGESTIONS = [
  { icon: '📡', title: 'Live transaction monitor',   tag: 'ethers.js', desc: 'Stream real-time contract events (DocumentStored, TokenMinted) as they happen on-chain. Essential for debugging without Etherscan.',   prompt: 'How do I build a real-time transaction monitor for ethers.js that shows live blockchain events in a React dashboard?' },
  { icon: '🔍', title: 'Hash integrity checker',     tag: 'pdfjs',     desc: 'Drop a PDF, compute its SHA-256 in-browser, and compare it against the on-chain hash in seconds. Proves tamper-evidence.',           prompt: 'How do I build a PDF hash integrity checker — drop a file, compute its SHA-256, compare it against an on-chain record using ethers.js?' },
  { icon: '⛽', title: 'Gas cost estimator',         tag: 'ethers.js', desc: 'Preview gas cost in USD before every transaction. Saves your users from surprise fees in production.',                                  prompt: 'How do I add a gas cost estimator to my React dApp — estimating gas before every transaction using ethers.js v6?' },
  { icon: '📊', title: 'API latency heatmap',        tag: 'Vercel',    desc: 'Track response times per route over time. Spot slow endpoints before your users do.',                                                  prompt: 'How do I build a Vercel API latency heatmap — tracking response times per route over time and displaying them in a React chart?' },
  { icon: '🗂️', title: 'Document audit trail',      tag: 'Solidity',  desc: 'View the full history of any document: uploaded → hashed → minted → transferred. Full chain of custody, queryable by hash.',           prompt: 'How do I build a document audit trail viewer — showing every on-chain action taken on a specific document hash in my smart contract?' },
  { icon: '🌐', title: 'Network switcher',           tag: 'devops',    desc: 'One-click switch between mainnet, Sepolia, and local Hardhat. Stop manually editing .env files during development.',                    prompt: 'How do I build a multi-network switcher in my React dApp — allowing switching between Mainnet, Sepolia, and local Hardhat using ethers.js?' },
  { icon: '🎬', title: 'Animated tx toasts',        tag: 'GSAP',      desc: 'Use your existing GSAP dependency for animated toast notifications — pending, mined, failed — tied to real transaction states.',        prompt: 'How do I add GSAP-powered animated toast notifications to my React dApp for blockchain transaction states (pending, mined, failed)?' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────
function Pill({ status, label }) {
  const cls = status === 'ok' ? 'dev-pill-ok' : status === 'pending' ? 'dev-pill-pending' : status === 'cold' ? 'dev-pill-cold' : 'dev-pill-fail'
  return <span className={`dev-pill ${cls}`}>{label}</span>
}

function MetricCard({ label, value, sub, subClass }) {
  return (
    <div className="dev-metric-card">
      <div className="dev-metric-label">{label}</div>
      <div className="dev-metric-value">{value}</div>
      {sub && <div className={`dev-metric-sub ${subClass || ''}`}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  return <div className="dev-section-title">{children}</div>
}

// ─── Tab: Overview ─────────────────────────────────────────────────────────────
function OverviewTab({ apiCount, walletShort, walletNetwork }) {
  const maxGas = Math.max(...GAS_PRICES)
  return (
    <div>
      <div className="dev-metric-row">
        <MetricCard label="Documents stored"   value="147"         sub="+12 this week"   subClass="dev-up" />
        <MetricCard label="Verified on-chain"  value="89"          sub="60% of total" />
        <MetricCard label="API calls / 24h"    value={apiCount}    sub="+28 vs yesterday" subClass="dev-up" />
        <MetricCard
          label="Wallet"
          value={<span style={{ fontSize: 13, paddingTop: 3, display: 'block' }}>{walletShort || '—'}</span>}
          sub={walletNetwork || 'Not connected'}
        />
      </div>

      <SectionTitle>Recent activity</SectionTitle>
      <div className="dev-log-box">
        <div className="dev-log-header">
          <span>Event log</span>
          <span style={{ fontSize: 10, color: '#444' }}>Updated {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="dev-log-col-row" style={{ gridTemplateColumns: '80px 70px 1fr 80px' }}>
          <span>Time</span><span>Type</span><span>Detail</span><span>Status</span>
        </div>
        {ACTIVITY_LOG.map((r, i) => (
          <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '80px 70px 1fr 80px' }}>
            <span>{r.time}</span>
            <span style={{ color: '#888' }}>{r.type}</span>
            <span style={{ color: '#c2c0b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail}</span>
            <span><Pill status={r.status} label={r.label} /></span>
          </div>
        ))}
      </div>

      <SectionTitle>Gas price trend (last 8 blocks)</SectionTitle>
      <div className="dev-info-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: '#555' }}>
          <span>Gwei</span>
          <span className="dev-mono">{GAS_PRICES[GAS_PRICES.length - 1]} gwei now</span>
        </div>
        <div className="dev-bar-row">
          {GAS_PRICES.map((v, i) => {
            const h = Math.round((v / maxGas) * 48)
            const active = i === GAS_PRICES.length - 1
            return (
              <div
                key={i}
                className="dev-bar"
                title={`${v} gwei`}
                style={{ height: h, background: active ? '#378ADD' : '#2a2a2e' }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Blockchain ──────────────────────────────────────────────────────────
function ChainTab({ walletInfo, onConnect }) {
  return (
    <div>
      <div className="dev-two-col">
        <div>
          <SectionTitle>Wallet</SectionTitle>
          <div className="dev-info-card">
            <div className="dev-info-row"><span className="dev-info-key">Address</span><span className="dev-info-val">{walletInfo.address || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Network</span><span className="dev-info-val">{walletInfo.network || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Balance</span><span className="dev-info-val">{walletInfo.balance || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Chain ID</span><span className="dev-info-val">{walletInfo.chainId || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Block</span><span className="dev-info-val">{walletInfo.block || '—'}</span></div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <button className="dev-btn dev-btn-primary" onClick={onConnect}>
              {walletInfo.address ? 'Reconnect' : 'Connect MetaMask'}
            </button>
          </div>
        </div>
        <div>
          <SectionTitle>Contract</SectionTitle>
          <div className="dev-info-card">
            <div className="dev-info-row"><span className="dev-info-key">Address</span><span className="dev-info-val">0xAbCd…1234</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Network</span><span className="dev-info-val">Sepolia testnet</span></div>
            <div className="dev-info-row"><span className="dev-info-key">ABI loaded</span><span className="dev-info-val ok">Yes — 14 functions</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Total docs</span><span className="dev-info-val">147</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Last tx</span><span className="dev-info-val">0x9f3a…bee2</span></div>
          </div>
        </div>
      </div>

      <SectionTitle>Recent transactions</SectionTitle>
      <div className="dev-log-box">
        <div className="dev-log-col-row" style={{ gridTemplateColumns: '90px 120px 1fr 80px' }}>
          <span>Block</span><span>Hash</span><span>Method</span><span>Status</span>
        </div>
        {TX_LOG.map((r, i) => (
          <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '90px 120px 1fr 80px' }}>
            <span>{r.block}</span>
            <span className="dev-mono">{r.hash}</span>
            <span style={{ color: '#c2c0b6' }}>{r.method}</span>
            <span><Pill status={r.status} label={r.label} /></span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Documents ───────────────────────────────────────────────────────────
function DocsTab() {
  return (
    <div>
      <div className="dev-metric-row">
        <MetricCard label="Total PDFs"        value="147" />
        <MetricCard label="Avg size"          value={<>1.2<span style={{ fontSize: 13 }}>MB</span></>} />
        <MetricCard label="Hashed"            value="147" sub="100%" subClass="dev-up" />
        <MetricCard label="On-chain verified" value="89"  sub="60%" />
      </div>

      <SectionTitle>Document queue</SectionTitle>
      <div className="dev-log-box">
        <div className="dev-log-header"><span>Recent uploads</span></div>
        <div className="dev-log-col-row" style={{ gridTemplateColumns: '1fr 60px 100px 80px' }}>
          <span>Filename</span><span>Size</span><span>SHA-256</span><span>Chain</span>
        </div>
        {DOC_LOG.map((r, i) => (
          <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '1fr 60px 100px 80px' }}>
            <span style={{ color: '#c2c0b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
            <span>{r.size}</span>
            <span className="dev-mono">{r.hash}</span>
            <span><Pill status={r.status} label={r.label} /></span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: API Logs ────────────────────────────────────────────────────────────
function ApiTab() {
  return (
    <div>
      <div className="dev-two-col" style={{ marginBottom: 14 }}>
        <div className="dev-info-card" style={{ padding: '14px 16px' }}>
          <div className="dev-metric-label">Avg response time</div>
          <div className="dev-metric-value">218<span style={{ fontSize: 13 }}>ms</span></div>
        </div>
        <div className="dev-info-card" style={{ padding: '14px 16px' }}>
          <div className="dev-metric-label">Error rate</div>
          <div className="dev-metric-value dev-down">3.2<span style={{ fontSize: 13 }}>%</span></div>
        </div>
      </div>

      <SectionTitle>Vercel API routes</SectionTitle>
      <div className="dev-info-card" style={{ marginBottom: 14 }}>
        {API_ROUTES.map((r, i) => (
          <div key={i} className="dev-net-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: r.method === 'POST' ? '#85B7EB' : '#97C459', fontFamily: 'IBM Plex Mono', fontSize: 10, width: 32 }}>{r.method}</span>
              <span className="dev-mono">{r.route}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#555' }}>avg {r.avg}</span>
              <Pill status={r.status} label={r.label} />
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Raw request log</SectionTitle>
      <div className="dev-log-box">
        <div className="dev-log-col-row" style={{ gridTemplateColumns: '75px 40px 1fr 100px' }}>
          <span>Time</span><span>M</span><span>Endpoint</span><span>ms · status</span>
        </div>
        {API_LOG.map((r, i) => (
          <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '75px 40px 1fr 100px' }}>
            <span>{r.time}</span>
            <span style={{ color: r.method === 'POST' ? '#85B7EB' : '#97C459' }}>{r.method}</span>
            <span className="dev-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.route}</span>
            <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ color: '#555' }}>{r.ms}</span>
              <Pill status={r.status} label={r.code} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Console ─────────────────────────────────────────────────────────────
function ConsoleTab({ logs, onRun, onClear }) {
  const consoleRef = useRef(null)
  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight
  }, [logs])

  return (
    <div>
      <SectionTitle>Dev console</SectionTitle>
      <div className="dev-console-box" ref={consoleRef}>
        {logs.map((l, i) => (
          <div key={i} className={`dev-console-line ${l.type}`}>{l.msg}</div>
        ))}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className="dev-btn" onClick={() => onRun('checkContract')}>Check contract</button>
        <button className="dev-btn" onClick={() => onRun('listDocs')}>List docs</button>
        <button className="dev-btn" onClick={() => onRun('pingApi')}>Ping API</button>
        <button className="dev-btn" onClick={() => onRun('gasPrice')}>Gas price</button>
        <button className="dev-btn dev-btn-danger" onClick={onClear}>Clear</button>
      </div>

      <SectionTitle style={{ marginTop: 16 }}>Quick links</SectionTitle>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <a className="dev-btn" href={`https://sepolia.etherscan.io/address/0xAbCd1234`} target="_blank" rel="noreferrer">Etherscan ↗</a>
        <a className="dev-btn" href="https://viem.sh" target="_blank" rel="noreferrer">Viem docs ↗</a>
        <a className="dev-btn" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Vercel dash ↗</a>
        <a className="dev-btn" href="https://hardhat.org/docs" target="_blank" rel="noreferrer">Hardhat docs ↗</a>
      </div>
    </div>
  )
}

// ─── Tab: Suggestions ─────────────────────────────────────────────────────────
function SuggestTab() {
  return (
    <div>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 14, lineHeight: 1.6 }}>
        Recommended features for your dev area — matched to your stack.
      </p>
      <div className="dev-info-card" style={{ padding: 0 }}>
        {SUGGESTIONS.map((s, i) => (
          <a
            key={i}
            className="dev-feature-item"
            href={`https://claude.ai/new?q=${encodeURIComponent(s.prompt)}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="dev-feature-icon">{s.icon}</div>
            <div>
              <div className="dev-feature-title">
                {s.title}
                <span className="dev-feature-tag">{s.tag}</span>
              </div>
              <div className="dev-feature-desc">{s.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Inner dashboard (shared by both overlay and standalone) ──────────────────
function DashboardInner({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [apiCount, setApiCount]   = useState(342)
  const [walletInfo, setWalletInfo] = useState({
    address: '', network: '', balance: '', chainId: '', block: '',
  })
  const [consoleLogs, setConsoleLogs] = useState([
    { msg: '[boot] AxiomeVault dev dashboard initialized',         type: 'ok'   },
    { msg: '[ethers] Provider: window.ethereum detected',          type: 'info' },
    { msg: '[vite] HMR connected · ws://localhost:5173',           type: 'info' },
    { msg: '[warn] Wallet not connected — click Connect MetaMask', type: 'warn' },
    { msg: '[pdfjs] Worker loaded: pdf.worker.min.js',             type: 'info' },
    { msg: '[contract] ABI parsed: 14 functions, 3 events',        type: 'ok'   },
  ])

  const addLog = useCallback((msg, type = '') => {
    const ts = new Date().toLocaleTimeString()
    setConsoleLogs(prev => [...prev, { msg: `[${ts}] ${msg}`, type }])
  }, [])

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      addLog('No wallet detected — install MetaMask', 'err')
      return
    }
    try {
      addLog('Requesting wallet access…', 'info')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const addr     = accounts[0]
      const chainId  = await window.ethereum.request({ method: 'eth_chainId' })
      const chainNum = parseInt(chainId, 16)
      const networkNames = { 1: 'Ethereum mainnet', 11155111: 'Sepolia testnet', 31337: 'Hardhat local' }
      const networkName  = networkNames[chainNum] || `Chain ${chainNum}`
      setWalletInfo({ address: addr, network: networkName, balance: 'Loading…', chainId: chainNum, block: 'Loading…' })
      addLog(`Wallet connected: ${addr}`, 'ok')
      addLog(`Network: ${networkName} (chain ${chainNum})`, 'info')
    } catch (e) {
      addLog(`Connection rejected: ${e.message}`, 'err')
    }
  }, [addLog])

  const runConsoleCmd = useCallback((cmd) => {
    setActiveTab('console')
    const cmds = {
      checkContract: () => { addLog('Checking contract @ 0xAbCd…1234…', 'info'); setTimeout(() => addLog('Contract reachable — 14 functions, 3 events loaded', 'ok'), 600) },
      listDocs:      () => { addLog('Fetching document list from contract…', 'info'); setTimeout(() => addLog('147 documents found on Sepolia', 'ok'), 700) },
      pingApi:       () => { addLog('GET /api/status…', 'info'); setTimeout(() => addLog('API responded 200 OK in 44ms', 'ok'), 400) },
      gasPrice:      () => { addLog('Fetching gas price from provider…', 'info'); setTimeout(() => addLog('Current: 24 gwei  |  slow: 18  |  fast: 38', 'ok'), 500) },
    }
    cmds[cmd]?.()
  }, [addLog])

  const clearConsole = useCallback(() => {
    setConsoleLogs([])
    addLog('Console cleared', 'info')
  }, [addLog])

  const refreshAll = () => setApiCount(prev => prev + Math.floor(Math.random() * 30))

  const walletShort = walletInfo.address
    ? walletInfo.address.slice(0, 6) + '…' + walletInfo.address.slice(-4)
    : null

  return (
    <div className="dev-shell" style={{ height: '100%' }}>
      {/* Close button — only shown in overlay mode */}
      {onClose && (
        <button className="dev-overlay-close" onClick={onClose} title="Close (Ctrl+Shift+D)">✕</button>
      )}

      {/* Topbar */}
      <div className="dev-topbar">
        <div className="dev-topbar-left">
          <span className="dev-badge-dev">DEV</span>
          <span className="dev-app-name">AxiomeVault</span>
          <span className="dev-badge-env">v0.0.0 · local</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingRight: onClose ? 36 : 0 }}>
          <span style={{ fontSize: 11, color: '#666' }}>
            <span className="dev-status-dot" />Vite HMR
          </span>
          <span className="dev-mono" style={{ color: '#555' }}>localhost:5173</span>
          <span className="dev-kbd">Ctrl+Shift+D</span>
          <button className="dev-btn" onClick={refreshAll}>Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dev-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`dev-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="dev-content">
        {activeTab === 'overview' && <OverviewTab apiCount={apiCount} walletShort={walletShort} walletNetwork={walletInfo.network} />}
        {activeTab === 'chain'    && <ChainTab walletInfo={walletInfo} onConnect={connectWallet} />}
        {activeTab === 'docs'     && <DocsTab />}
        {activeTab === 'api'      && <ApiTab />}
        {activeTab === 'console'  && <ConsoleTab logs={consoleLogs} onRun={runConsoleCmd} onClear={clearConsole} />}
        {activeTab === 'suggest'  && <SuggestTab />}
      </div>
    </div>
  )
}

// ─── Overlay wrapper ──────────────────────────────────────────────────────────
// Drop <DevDashboard /> anywhere in your app tree.
// It renders an invisible trigger hint in the bottom-right corner.
// Press Ctrl+Shift+D (or click the hint) to open/close the dashboard overlay.
export default function DevDashboard() {
  const [open, setOpen] = useState(false)

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      // Escape to close
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Bottom-right trigger hint */}
      <div className="dev-trigger-hint" onClick={() => setOpen(true)} title="Open dev dashboard">
        <span className="dev-trigger-hint-dot" />
        <span>DEV</span>
        <span style={{ opacity: 0.4 }}>Ctrl+Shift+D</span>
      </div>

      {/* Overlay */}
      {open && (
        <>
          {/* Backdrop — click to close */}
          <div className="dev-overlay-backdrop" onClick={() => setOpen(false)} />
          {/* Panel */}
          <div className="dev-overlay-panel">
            <DashboardInner onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}