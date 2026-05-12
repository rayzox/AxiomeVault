import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@500;600;700&display=swap');

  .dev-shell * { box-sizing: border-box; margin: 0; padding: 0; }

  .dev-shell {
    font-family: 'Syne', sans-serif;
    background: #080809;
    min-height: 100%;
    color: #d4d0c8;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* Scanline overlay */
  .dev-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  /* Ambient glow */
  .dev-shell::after {
    content: '';
    position: absolute;
    top: -120px; left: -80px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(56,130,220,0.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .dev-shell > * { position: relative; z-index: 2; }

  /* ── Topbar ── */
  .dev-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 22px;
    height: 44px;
    background: rgba(8,8,9,0.98);
    border-bottom: 1px solid #1e1e24;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }
  .dev-topbar-left { display: flex; align-items: center; gap: 12px; }

  .dev-wordmark {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.04em;
    color: #e8e4da;
  }
  .dev-wordmark-accent { color: #3882DC; }

  .dev-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.1em;
  }
  .dev-badge-dev { background: #FAC775; color: #1a0e00; }
  .dev-badge-env { background: transparent; border: 1px solid #222; color: #444; }

  .dev-clock {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #333;
    letter-spacing: 0.05em;
  }

  /* Pulse dot */
  .dev-pulse {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #3DC97A;
    position: relative;
    display: inline-block;
    margin-right: 6px;
    flex-shrink: 0;
  }
  .dev-pulse::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: rgba(61,201,122,0.3);
    animation: dev-pulse-ring 2s ease-out infinite;
  }
  .dev-pulse.warn { background: #EF9F27; }
  .dev-pulse.warn::after { background: rgba(239,159,39,0.3); }
  .dev-pulse.err  { background: #E24B4A; }
  .dev-pulse.err::after { background: rgba(226,75,74,0.3); }
  @keyframes dev-pulse-ring {
    0%   { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  /* ── Tabs ── */
  .dev-tabs {
    display: flex;
    padding: 0 22px;
    background: #080809;
    border-bottom: 1px solid #1a1a20;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .dev-tabs::-webkit-scrollbar { display: none; }
  .dev-tab {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    padding: 10px 14px;
    cursor: pointer;
    color: #2e2e38;
    border-bottom: 2px solid transparent;
    border-top: none; border-left: none; border-right: none;
    white-space: nowrap;
    transition: color 0.15s, border-color 0.15s;
    background: none;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .dev-tab:hover { color: #666; }
  .dev-tab.active { color: #d4d0c8; border-bottom-color: #3882DC; }

  /* ── Content ── */
  .dev-content { flex: 1; padding: 20px 22px; overflow-y: auto; }

  /* ── Metric cards ── */
  .dev-metric-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  @media (max-width: 700px) { .dev-metric-row { grid-template-columns: 1fr 1fr; } }

  .dev-metric-card {
    background: #0c0c0e;
    border: 1px solid #1a1a22;
    border-radius: 6px;
    padding: 14px 16px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .dev-metric-card:hover { border-color: #2a2a38; }
  .dev-metric-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56,130,220,0.2), transparent);
  }
  .dev-metric-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #2e2e38;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dev-metric-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    font-weight: 600;
    color: #e8e4da;
    line-height: 1;
  }
  .dev-metric-value.sm { font-size: 13px; padding-top: 4px; line-height: 1.5; }
  .dev-metric-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #2a2a30;
    margin-top: 6px;
  }
  .dev-up    { color: #3DC97A !important; }
  .dev-down  { color: #E24B4A !important; }
  .dev-muted { color: #2e2e38 !important; }

  /* ── Section title ── */
  .dev-section-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    color: #2a2a30;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin: 22px 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dev-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #141418;
  }

  /* ── Log box ── */
  .dev-log-box {
    background: #080809;
    border: 1px solid #161618;
    border-radius: 6px;
    overflow: hidden;
  }
  .dev-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    border-bottom: 1px solid #161618;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #2a2a30;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: #060607;
  }
  .dev-log-col-row {
    display: grid;
    gap: 10px;
    padding: 5px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #222228;
    background: #060607;
    border-bottom: 1px solid #161618;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .dev-log-row {
    display: grid;
    gap: 10px;
    padding: 8px 14px;
    border-bottom: 1px solid #0d0d10;
    align-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #555;
    transition: background 0.1s;
  }
  .dev-log-row:last-child { border-bottom: none; }
  .dev-log-row:hover { background: #0c0c0f; }

  /* ── Pills ── */
  .dev-pill {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 3px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .dev-pill-ok      { background: #0a1a0a; color: #3DC97A; border: 1px solid #143214; }
  .dev-pill-pending { background: #1a1000; color: #FAC775; border: 1px solid #2e1e00; }
  .dev-pill-fail    { background: #1a0808; color: #F09595; border: 1px solid #300e0e; }
  .dev-pill-cold    { background: #080e1a; color: #85B7EB; border: 1px solid #101c30; }

  /* ── Info card ── */
  .dev-info-card {
    background: #080809;
    border: 1px solid #161618;
    border-radius: 6px;
    overflow: hidden;
  }
  .dev-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    border-bottom: 1px solid #0d0d10;
  }
  .dev-info-row:last-child { border-bottom: none; }
  .dev-info-key {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #2a2a30;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .dev-info-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #555;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dev-info-val.ok     { color: #3DC97A; }
  .dev-info-val.warn   { color: #EF9F27; }
  .dev-info-val.err    { color: #E24B4A; }
  .dev-info-val.bright { color: #c2c0b6; }
  .dev-info-val.redacted { color: #1e1e22; letter-spacing: 0.15em; }

  /* ── Grids ── */
  .dev-two-col   { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .dev-three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  @media (max-width: 680px) {
    .dev-two-col   { grid-template-columns: 1fr; }
    .dev-three-col { grid-template-columns: 1fr; }
  }

  /* ── Buttons ── */
  .dev-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #1a1a20;
    background: #0c0c0e;
    color: #666;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    white-space: nowrap;
    letter-spacing: 0.04em;
    text-decoration: none;
    display: inline-block;
  }
  .dev-btn:hover { background: #121216; border-color: #2a2a34; color: #a0a0a8; }
  .dev-btn:active { transform: scale(0.97); }
  .dev-btn-primary { background: #0a1828; border-color: #1e4a80; color: #85B7EB; }
  .dev-btn-primary:hover { background: #0e2040; color: #aed4f8; border-color: #3882DC; }
  .dev-btn-danger { border-color: #2a0e0e; color: #E24B4A; }
  .dev-btn-danger:hover { background: #160606; }
  .dev-btn-success { border-color: #0e2a0e; color: #3DC97A; }
  .dev-btn-success:hover { background: #081408; }

  /* ── Console ── */
  .dev-console-box {
    background: #040405;
    border: 1px solid #161618;
    border-radius: 6px;
    padding: 12px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    min-height: 180px;
    max-height: 280px;
    overflow-y: auto;
    line-height: 1.75;
  }
  .dev-console-line        { color: #333; }
  .dev-console-line.info   { color: #85B7EB; }
  .dev-console-line.warn   { color: #FAC775; }
  .dev-console-line.err    { color: #F09595; }
  .dev-console-line.ok     { color: #3DC97A; }

  /* ── Bars ── */
  .dev-bar-row { display: flex; align-items: flex-end; gap: 3px; height: 52px; }
  .dev-bar { border-radius: 2px 2px 0 0; flex: 1; min-width: 8px; transition: opacity 0.15s; cursor: default; }
  .dev-bar:hover { opacity: 0.6; }

  /* ── Net row ── */
  .dev-net-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 14px;
    border-bottom: 1px solid #0d0d10;
  }
  .dev-net-item:last-child { border-bottom: none; }

  /* ── Suggestions ── */
  .dev-feature-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 14px;
    border-bottom: 1px solid #0d0d10;
    cursor: pointer;
    transition: background 0.1s;
    text-decoration: none;
  }
  .dev-feature-item:last-child { border-bottom: none; }
  .dev-feature-item:hover { background: #0c0c0f; }
  .dev-feature-icon {
    width: 30px; height: 30px;
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    background: #0c0c0e;
    border: 1px solid #161618;
  }
  .dev-feature-title { font-size: 12px; font-weight: 600; color: #a0a0a8; margin-bottom: 3px; }
  .dev-feature-desc  { font-size: 11px; color: #333; line-height: 1.55; }
  .dev-feature-tag {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 3px;
    background: #080e1a;
    color: #85B7EB;
    border: 1px solid #101c30;
    margin-left: 6px;
    vertical-align: middle;
    letter-spacing: 0.04em;
  }

  /* ── Kbd ── */
  .dev-kbd {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 3px;
    background: #0c0c0e;
    border: 1px solid #1a1a20;
    color: #333;
    letter-spacing: 0.04em;
  }

  /* ── Live tag ── */
  .dev-live {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #3DC97A;
    background: #081408;
    border: 1px solid #143214;
    border-radius: 3px;
    padding: 1px 5px;
  }

  /* ── Overlay ── */
  .dev-overlay-backdrop {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px);
    animation: dev-fade-in 0.15s ease;
  }
  .dev-overlay-panel {
    position: fixed;
    top: 4vh; left: 50%;
    transform: translateX(-50%);
    width: min(1160px, 96vw);
    height: 92vh;
    z-index: 9999;
    border-radius: 10px;
    overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 32px 100px rgba(0,0,0,0.9), 0 0 0 1px #1e1e28;
    animation: dev-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dev-overlay-close {
    position: absolute; top: 10px; right: 14px; z-index: 200;
    background: #0c0c0e; border: 1px solid #1a1a20; color: #333;
    width: 24px; height: 24px; border-radius: 4px; font-size: 12px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.1s; font-family: monospace; line-height: 1;
  }
  .dev-overlay-close:hover { background: #160606; color: #E24B4A; border-color: #2a0e0e; }

  /* ── Trigger hint ── */
  .dev-trigger-hint {
    position: fixed; bottom: 20px; right: 20px; z-index: 9000;
    background: #080809; border: 1px solid #1a1a20; border-radius: 6px;
    padding: 8px 12px; display: flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2e2e38;
    cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s;
    user-select: none; letter-spacing: 0.06em;
  }
  .dev-trigger-hint:hover { border-color: rgba(56,130,220,0.3); color: #85B7EB; background: #080e18; }

  /* ── Scrollbar ── */
  .dev-shell ::-webkit-scrollbar { width: 3px; height: 3px; }
  .dev-shell ::-webkit-scrollbar-track { background: transparent; }
  .dev-shell ::-webkit-scrollbar-thumb { background: #1a1a20; border-radius: 2px; }

  @keyframes dev-fade-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes dev-slide-in {
    from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }
  @keyframes dev-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  .dev-blink { animation: dev-blink 1.2s step-end infinite; }

  /* ── Command Palette ── */
  .dev-palette-backdrop {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(4px);
    animation: dev-fade-in 0.1s ease;
  }
  .dev-palette-box {
    position: fixed;
    top: 18vh; left: 50%;
    transform: translateX(-50%);
    width: min(580px, 92vw);
    z-index: 10001;
    background: #0a0a0c;
    border: 1px solid #2a2a38;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px #1a1a28;
    animation: dev-palette-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes dev-palette-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }
  .dev-palette-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid #161618;
  }
  .dev-palette-icon { color: #2e2e38; font-size: 14px; flex-shrink: 0; }
  .dev-palette-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #d4d0c8;
    letter-spacing: 0.02em;
  }
  .dev-palette-input::placeholder { color: #2a2a30; }
  .dev-palette-input-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #222228;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }
  .dev-palette-section {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #222228;
    padding: 8px 16px 4px;
  }
  .dev-palette-results { max-height: 340px; overflow-y: auto; padding-bottom: 6px; }
  .dev-palette-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 16px;
    cursor: pointer;
    transition: background 0.08s;
  }
  .dev-palette-item:hover { background: #0e0e14; }
  .dev-palette-item.selected { background: #0c1420; }
  .dev-palette-item-icon {
    width: 26px; height: 26px;
    border-radius: 5px;
    background: #0e0e12;
    border: 1px solid #1a1a22;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }
  .dev-palette-item-label {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #666;
  }
  .dev-palette-item-label mark { background: none; color: #d4d0c8; font-weight: 600; }
  .dev-palette-item.selected .dev-palette-item-label { color: #c2c0b6; }
  .dev-palette-item-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #2a2a30;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  .dev-palette-item-kbd {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 3px;
    background: #0c0c0e;
    border: 1px solid #1a1a20;
    color: #2a2a30;
    flex-shrink: 0;
  }
  .dev-palette-empty {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #222228;
    text-align: center;
    padding: 28px 16px;
    letter-spacing: 0.04em;
  }
  .dev-palette-footer {
    display: flex;
    gap: 14px;
    padding: 8px 16px;
    border-top: 1px solid #0e0e12;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #1e1e24;
    letter-spacing: 0.06em;
  }
  .dev-palette-footer span { display: flex; align-items: center; gap: 5px; }
`

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview'    },
  { id: 'chain',    label: 'Blockchain'  },
  { id: 'docs',     label: 'Documents'   },
  { id: 'api',      label: 'API'         },
  { id: 'env',      label: 'Environment' },
  { id: 'console',  label: 'Console'     },
  { id: 'suggest',  label: 'Suggest'     },
]

// Commands for the palette — actions get injected from DashboardInner via context
const COMMANDS = [
  // Navigation
  { id: 'nav-overview', group: 'Navigate', icon: '◈', label: 'Overview',           desc: 'Metrics & activity',    tab: 'overview' },
  { id: 'nav-chain',    group: 'Navigate', icon: '⬡', label: 'Blockchain',          desc: 'Wallet & transactions', tab: 'chain'    },
  { id: 'nav-docs',     group: 'Navigate', icon: '◻', label: 'Documents',           desc: 'PDF queue & hashes',    tab: 'docs'     },
  { id: 'nav-api',      group: 'Navigate', icon: '⇄', label: 'API',                 desc: 'Routes & request log',  tab: 'api'      },
  { id: 'nav-env',      group: 'Navigate', icon: '⚙', label: 'Environment',         desc: 'Env vars & deps',       tab: 'env'      },
  { id: 'nav-console',  group: 'Navigate', icon: '▶', label: 'Console',             desc: 'Dev log & commands',    tab: 'console'  },
  { id: 'nav-suggest',  group: 'Navigate', icon: '✦', label: 'Suggestions',         desc: 'Feature ideas',         tab: 'suggest'  },
  // Actions
  { id: 'act-wallet',   group: 'Actions',  icon: '⬡', label: 'Connect MetaMask',    desc: 'Link your wallet',      action: 'connectWallet'  },
  { id: 'act-contract', group: 'Actions',  icon: '◈', label: 'Check contract',      desc: 'Ping contract on-chain',action: 'checkContract'  },
  { id: 'act-docs',     group: 'Actions',  icon: '◻', label: 'List documents',      desc: 'Fetch doc index',       action: 'listDocs'       },
  { id: 'act-api',      group: 'Actions',  icon: '⇄', label: 'Ping API',            desc: 'GET /api/status',       action: 'pingApi'        },
  { id: 'act-gas',      group: 'Actions',  icon: '⛽', label: 'Fetch gas price',     desc: 'Current gwei oracle',   action: 'gasPrice'       },
  { id: 'act-refresh',  group: 'Actions',  icon: '↺', label: 'Refresh dashboard',   desc: 'Update all metrics',    action: 'refresh'        },
  { id: 'act-clear',    group: 'Actions',  icon: '✕', label: 'Clear console',       desc: 'Wipe log output',       action: 'clearConsole'   },
  // Links
  { id: 'lnk-etherscan',group: 'Links',   icon: '↗', label: 'Open Etherscan',      desc: 'Sepolia explorer',      href: 'https://sepolia.etherscan.io' },
  { id: 'lnk-vercel',   group: 'Links',   icon: '↗', label: 'Vercel dashboard',    desc: 'Deployment logs',       href: 'https://vercel.com/dashboard' },
  { id: 'lnk-ethers',   group: 'Links',   icon: '↗', label: 'Ethers v6 docs',      desc: 'Library reference',     href: 'https://docs.ethers.org/v6/' },
  { id: 'lnk-hardhat',  group: 'Links',   icon: '↗', label: 'Hardhat docs',        desc: 'Contract testing',      href: 'https://hardhat.org/docs' },
]

const ACTIVITY_LOG = [
  { time: '14:22:01', type: 'Upload', detail: 'contract_v3.pdf — 2.1 MB',    status: 'ok',      label: 'verified' },
  { time: '13:55:47', type: 'Mint',   detail: 'Token #0x4a2f… → owner',      status: 'ok',      label: 'mined'    },
  { time: '13:12:30', type: 'API',    detail: 'POST /api/verify · 204ms',    status: 'ok',      label: '200'      },
  { time: '12:44:18', type: 'Upload', detail: 'nda_signed.pdf — 480 KB',     status: 'pending', label: 'pending'  },
  { time: '11:30:05', type: 'API',    detail: 'GET /api/doc/0x3c… · 890ms', status: 'fail',    label: '504'      },
  { time: '10:14:59', type: 'Upload', detail: 'invoice_2025_04.pdf — 780 KB',status: 'ok',      label: 'verified' },
]

const TX_LOG = [
  { block: '8,241,002', hash: '0x4a2f…c3e1', method: 'storeDocument()', status: 'ok',      label: 'mined'    },
  { block: '8,240,998', hash: '0x91bc…44af', method: 'verifyHash()',     status: 'ok',      label: 'mined'    },
  { block: '8,240,990', hash: '0xf3d7…09cc', method: 'mintToken()',      status: 'pending', label: 'pending'  },
  { block: '8,240,985', hash: '0x2a11…7ba4', method: 'transferOwner()',  status: 'fail',    label: 'reverted' },
]

const DOC_LOG = [
  { name: 'contract_v3.pdf',      size: '2.1 MB', hash: 'a3f9…c2d1', status: 'ok',      label: 'verified' },
  { name: 'nda_signed.pdf',       size: '480 KB', hash: '8b2e…f401', status: 'pending', label: 'pending'  },
  { name: 'invoice_2025_04.pdf',  size: '780 KB', hash: 'd41d…e00b', status: 'ok',      label: 'verified' },
  { name: 'terms_of_service.pdf', size: '320 KB', hash: '5f9c…1a77', status: 'ok',      label: 'verified' },
  { name: 'audit_report_q1.pdf',  size: '4.2 MB', hash: '—',         status: 'fail',    label: 'failed'   },
]

const API_ROUTES = [
  { method: 'POST', route: '/api/verify',    avg: '204ms', status: 'ok',   label: 'active' },
  { method: 'POST', route: '/api/upload',    avg: '890ms', status: 'ok',   label: 'active' },
  { method: 'GET',  route: '/api/doc/:hash', avg: '112ms', status: 'ok',   label: 'active' },
  { method: 'GET',  route: '/api/status',    avg: '44ms',  status: 'cold', label: 'cold'   },
]

const API_LOG = [
  { time: '14:22:01', method: 'POST', route: '/api/verify',     ms: '204ms', status: 'ok',   code: '200' },
  { time: '13:55:47', method: 'POST', route: '/api/upload',     ms: '1.1s',  status: 'ok',   code: '200' },
  { time: '13:12:30', method: 'GET',  route: '/api/doc/a3f9…', ms: '88ms',  status: 'ok',   code: '200' },
  { time: '11:30:05', method: 'GET',  route: '/api/doc/8b2e…', ms: '890ms', status: 'fail', code: '504' },
  { time: '10:14:59', method: 'POST', route: '/api/verify',     ms: '312ms', status: 'ok',   code: '200' },
]

const ENV_VARS = [
  { key: 'VITE_CONTRACT_ADDRESS', val: '0xAbCd…1234',       secret: false },
  { key: 'VITE_CHAIN_ID',         val: '11155111',           secret: false },
  { key: 'VITE_RPC_URL',          val: 'https://sepolia…',  secret: false },
  { key: 'VITE_GROQ_API_KEY',     val: 'gsk_real_key_here', secret: true  },
  { key: 'VITE_NETWORK',          val: 'sepolia',            secret: false },
  { key: 'VITE_IPFS_GATEWAY',     val: 'https://ipfs.io/…', secret: false },
]

const DEPS = [
  { name: 'react',        version: '^19.2.5',  type: 'dep'    },
  { name: 'ethers',       version: '^6.16.0',  type: 'dep'    },
  { name: 'gsap',         version: '^3.12.5',  type: 'dep'    },
  { name: 'jspdf',        version: '^4.2.1',   type: 'dep'    },
  { name: 'pdfjs-dist',   version: '^5.7.284', type: 'dep'    },
  { name: 'axios',        version: '^1.16.0',  type: 'dep'    },
  { name: 'lucide-react', version: '^1.14.0',  type: 'dep'    },
  { name: 'vite',         version: '^8.0.10',  type: 'devdep' },
]

const SUGGESTIONS = [
  { icon: '📡', title: 'Live transaction monitor',  tag: 'ethers.js', desc: 'Stream real-time contract events as they happen on-chain. Essential for debugging without Etherscan.', prompt: 'How do I build a real-time transaction monitor for ethers.js that shows live blockchain events in a React dashboard?' },
  { icon: '🔍', title: 'Hash integrity checker',    tag: 'pdfjs',     desc: 'Drop a PDF, compute its SHA-256 in-browser, compare against on-chain hash in seconds.', prompt: 'How do I build a PDF hash integrity checker — compute SHA-256, compare against on-chain record using ethers.js?' },
  { icon: '⛽', title: 'Gas cost estimator',        tag: 'ethers.js', desc: 'Preview gas cost in USD before every transaction. Saves users from surprise fees.', prompt: 'How do I add a gas cost estimator to my React dApp using ethers.js v6?' },
  { icon: '📊', title: 'API latency heatmap',       tag: 'Vercel',    desc: 'Track response times per route over time. Spot slow endpoints before your users do.', prompt: 'How do I build a Vercel API latency heatmap in React?' },
  { icon: '🗂️', title: 'Document audit trail',     tag: 'Solidity',  desc: 'Full chain of custody per document: uploaded → hashed → minted → transferred.', prompt: 'How do I build a document audit trail viewer querying on-chain events by document hash?' },
  { icon: '🌐', title: 'Network switcher',          tag: 'devops',    desc: 'One-click switch between mainnet, Sepolia, and local Hardhat. Stop editing .env files.', prompt: 'How do I build a multi-network switcher in my React dApp with ethers.js?' },
  { icon: '🎬', title: 'Animated tx toasts',        tag: 'GSAP',      desc: 'Use your existing GSAP dep for animated notifications tied to real transaction states.', prompt: 'How do I add GSAP-powered animated toast notifications for blockchain transaction states in React?' },
]

const GAS_HISTORY = [14, 18, 22, 27, 24, 31, 19, 26, 22, 24, 28, 20]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Pill({ status, label }) {
  const cls = { ok: 'dev-pill-ok', pending: 'dev-pill-pending', fail: 'dev-pill-fail', cold: 'dev-pill-cold' }[status] || 'dev-pill-cold'
  return <span className={`dev-pill ${cls}`}>{label}</span>
}

function SectionTitle({ children }) {
  return <div className="dev-section-title">{children}</div>
}

function MetricCard({ label, value, sub, subClass, live }) {
  const isLong = typeof value === 'string' && value.length > 7
  return (
    <div className="dev-metric-card">
      <div className="dev-metric-label">
        {label}
        {live && <span className="dev-live">live</span>}
      </div>
      <div className={`dev-metric-value ${isLong ? 'sm' : ''}`}>{value}</div>
      {sub && <div className={`dev-metric-sub ${subClass || ''}`}>{sub}</div>}
    </div>
  )
}

function Clock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="dev-clock">{time}</span>
}

function useGasPrice() {
  const [gas, setGas] = useState({ safe: '18', standard: '24', fast: '38' })
  useEffect(() => {
    const go = async () => {
      try {
        const r = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken')
        const d = await r.json()
        if (d?.result?.SafeGasPrice) {
          setGas({ safe: d.result.SafeGasPrice, standard: d.result.ProposeGasPrice, fast: d.result.FastGasPrice })
        }
      } catch { /* use defaults */ }
    }
    go()
    const id = setInterval(go, 30000)
    return () => clearInterval(id)
  }, [])
  return gas
}

// ─── Command Palette ──────────────────────────────────────────────────────────
function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function CommandPalette({ onClose, onNavigate, onAction }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = query.trim() === ''
    ? COMMANDS
    : COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.desc.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
      )

  // Reset selection when results change
  useEffect(() => { setSelected(0) }, [query])

  const run = useCallback((cmd) => {
    onClose()
    if (cmd.tab)    { onNavigate(cmd.tab); return }
    if (cmd.href)   { window.open(cmd.href, '_blank', 'noreferrer'); return }
    if (cmd.action) { onAction(cmd.action) }
  }, [onClose, onNavigate, onAction])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[selected]) run(filtered[selected]) }
      if (e.key === 'Escape')    { onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filtered, selected, run, onClose])

  // Group results
  const groups = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  let itemIndex = 0

  return (
    <>
      <div className="dev-palette-backdrop" onClick={onClose} />
      <div className="dev-palette-box">
        <div className="dev-palette-input-row">
          <span className="dev-palette-icon">⌘</span>
          <input
            ref={inputRef}
            className="dev-palette-input"
            placeholder="Search commands, tabs, actions…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="dev-palette-input-hint">Ctrl+K</span>
        </div>

        <div className="dev-palette-results">
          {filtered.length === 0 && (
            <div className="dev-palette-empty">No results for "{query}"</div>
          )}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <div className="dev-palette-section">{group}</div>
              {items.map((cmd) => {
                const idx = itemIndex++
                return (
                  <div
                    key={cmd.id}
                    className={`dev-palette-item ${idx === selected ? 'selected' : ''}`}
                    onClick={() => run(cmd)}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <div className="dev-palette-item-icon">{cmd.icon}</div>
                    <span className="dev-palette-item-label">
                      {highlight(cmd.label, query)}
                    </span>
                    <span className="dev-palette-item-desc">{cmd.desc}</span>
                    {idx === selected && <span className="dev-palette-item-kbd">↵</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="dev-palette-footer">
          <span><span className="dev-kbd">↑↓</span> navigate</span>
          <span><span className="dev-kbd">↵</span> select</span>
          <span><span className="dev-kbd">Esc</span> close</span>
        </div>
      </div>
    </>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function OverviewTab({ apiCount, walletShort, walletNetwork }) {
  const gas = useGasPrice()
  const maxG = Math.max(...GAS_HISTORY)
  return (
    <div>
      <div className="dev-metric-row">
        <MetricCard label="Docs stored"       value="147"      sub="+12 this week"    subClass="dev-up" />
        <MetricCard label="Verified on-chain" value="89"       sub="60% of total"     subClass="dev-muted" />
        <MetricCard label="API calls / 24h"   value={apiCount} sub="+28 vs yesterday" subClass="dev-up" live />
        <MetricCard label="Wallet" value={walletShort || 'disconnected'} sub={walletNetwork || 'not connected'} />
      </div>
      <div className="dev-two-col">
        <div>
          <SectionTitle>Activity log</SectionTitle>
          <div className="dev-log-box">
            <div className="dev-log-col-row" style={{ gridTemplateColumns: '72px 56px 1fr 70px' }}>
              <span>Time</span><span>Type</span><span>Detail</span><span>Status</span>
            </div>
            {ACTIVITY_LOG.map((r, i) => (
              <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '72px 56px 1fr 70px' }}>
                <span>{r.time}</span>
                <span style={{ color: '#444' }}>{r.type}</span>
                <span style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail}</span>
                <Pill status={r.status} label={r.label} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Gas oracle</SectionTitle>
          <div className="dev-info-card" style={{ padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              {[['Safe', gas.safe, '#3DC97A'], ['Standard', gas.standard, '#FAC775'], ['Fast', gas.fast, '#E24B4A']].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#2a2a30', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{l}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 600, color: c }}>{v}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#2a2a30', marginTop: 4 }}>gwei</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #141418', paddingTop: 12 }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#222228', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>12-block history</div>
              <div className="dev-bar-row">
                {GAS_HISTORY.map((v, i) => (
                  <div key={i} className="dev-bar" title={`${v} gwei`}
                    style={{ height: Math.round((v / maxG) * 48), background: i === GAS_HISTORY.length - 1 ? '#3882DC' : '#181820' }} />
                ))}
              </div>
            </div>
          </div>
          <SectionTitle>System</SectionTitle>
          <div className="dev-info-card">
            <div className="dev-info-row"><span className="dev-info-key">Runtime</span><span className="dev-info-val bright">Vite 8 · React 19</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Network</span><span className="dev-info-val ok">Sepolia testnet</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Deploy</span><span className="dev-info-val bright">Vercel</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Uptime</span><span className="dev-info-val ok">99.9%</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChainTab({ walletInfo, onConnect }) {
  return (
    <div>
      <div className="dev-two-col">
        <div>
          <SectionTitle>Wallet</SectionTitle>
          <div className="dev-info-card">
            <div className="dev-info-row"><span className="dev-info-key">Address</span><span className="dev-info-val">{walletInfo.address || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Network</span><span className="dev-info-val bright">{walletInfo.network || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Balance</span><span className="dev-info-val bright">{walletInfo.balance || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Chain ID</span><span className="dev-info-val">{walletInfo.chainId || '—'}</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Block</span><span className="dev-info-val">{walletInfo.block || '—'}</span></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            <button className="dev-btn dev-btn-primary" onClick={onConnect}>
              {walletInfo.address ? '↺ Reconnect' : '⬡ Connect MetaMask'}
            </button>
          </div>
        </div>
        <div>
          <SectionTitle>Contract</SectionTitle>
          <div className="dev-info-card">
            <div className="dev-info-row"><span className="dev-info-key">Address</span><span className="dev-info-val">0xAbCd…1234</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Network</span><span className="dev-info-val bright">Sepolia</span></div>
            <div className="dev-info-row"><span className="dev-info-key">ABI</span><span className="dev-info-val ok">14 functions · 3 events</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Total docs</span><span className="dev-info-val bright">147</span></div>
            <div className="dev-info-row"><span className="dev-info-key">Last tx</span><span className="dev-info-val">0x9f3a…bee2</span></div>
          </div>
          <div style={{ marginTop: 10 }}>
            <a className="dev-btn" href="https://sepolia.etherscan.io/address/0xAbCd1234" target="_blank" rel="noreferrer">Etherscan ↗</a>
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
            <span style={{ color: '#444' }}>{r.hash}</span>
            <span style={{ color: '#777' }}>{r.method}</span>
            <Pill status={r.status} label={r.label} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DocsTab() {
  return (
    <div>
      <div className="dev-metric-row">
        <MetricCard label="Total PDFs"        value="147" />
        <MetricCard label="Avg size"          value="1.2MB" />
        <MetricCard label="Hashed"            value="147" sub="100%" subClass="dev-up" />
        <MetricCard label="On-chain verified" value="89"  sub="60%"  subClass="dev-muted" />
      </div>
      <SectionTitle>Document queue</SectionTitle>
      <div className="dev-log-box">
        <div className="dev-log-col-row" style={{ gridTemplateColumns: '1fr 64px 110px 70px' }}>
          <span>Filename</span><span>Size</span><span>SHA-256</span><span>Chain</span>
        </div>
        {DOC_LOG.map((r, i) => (
          <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '1fr 64px 110px 70px' }}>
            <span style={{ color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
            <span>{r.size}</span>
            <span style={{ color: '#444' }}>{r.hash}</span>
            <Pill status={r.status} label={r.label} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ApiTab() {
  return (
    <div>
      <div className="dev-metric-row">
        <MetricCard label="Avg response"  value="218ms" />
        <MetricCard label="Error rate"    value={<span className="dev-down">3.2%</span>} />
        <MetricCard label="Req / 24h"     value="342"   sub="+28 vs yesterday" subClass="dev-up" />
        <MetricCard label="Uptime"        value={<span className="dev-up">99.9%</span>} />
      </div>
      <SectionTitle>Vercel routes</SectionTitle>
      <div className="dev-info-card" style={{ marginBottom: 16 }}>
        {API_ROUTES.map((r, i) => (
          <div key={i} className="dev-net-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: r.method === 'POST' ? '#85B7EB' : '#3DC97A', width: 36, letterSpacing: '0.06em' }}>{r.method}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#666' }}>{r.route}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#2a2a30' }}>avg {r.avg}</span>
              <Pill status={r.status} label={r.label} />
            </div>
          </div>
        ))}
      </div>
      <SectionTitle>Request log</SectionTitle>
      <div className="dev-log-box">
        <div className="dev-log-col-row" style={{ gridTemplateColumns: '72px 42px 1fr 110px' }}>
          <span>Time</span><span>M</span><span>Endpoint</span><span>Latency · Code</span>
        </div>
        {API_LOG.map((r, i) => (
          <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '72px 42px 1fr 110px' }}>
            <span>{r.time}</span>
            <span style={{ color: r.method === 'POST' ? '#85B7EB' : '#3DC97A' }}>{r.method}</span>
            <span style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.route}</span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#333' }}>{r.ms}</span>
              <Pill status={r.status} label={r.code} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EnvTab() {
  const [revealed, setRevealed] = useState({})
  const toggle = (key) => setRevealed(p => ({ ...p, [key]: !p[key] }))
  return (
    <div>
      <SectionTitle>Environment variables</SectionTitle>
      <div className="dev-info-card" style={{ marginBottom: 16 }}>
        {ENV_VARS.map((v) => (
          <div key={v.key} className="dev-info-row">
            <span className="dev-info-key">{v.key}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {v.secret && (
                <button className="dev-btn" style={{ padding: '2px 8px', fontSize: 9 }} onClick={() => toggle(v.key)}>
                  {revealed[v.key] ? 'hide' : 'reveal'}
                </button>
              )}
              <span className={`dev-info-val ${v.secret && !revealed[v.key] ? 'redacted' : 'bright'}`}>
                {v.secret && !revealed[v.key] ? '••••••••••••' : v.val}
              </span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Dependencies</SectionTitle>
      <div className="dev-log-box" style={{ marginBottom: 16 }}>
        <div className="dev-log-col-row" style={{ gridTemplateColumns: '1fr 100px 70px' }}>
          <span>Package</span><span>Version</span><span>Type</span>
        </div>
        {DEPS.map((d, i) => (
          <div key={i} className="dev-log-row" style={{ gridTemplateColumns: '1fr 100px 70px' }}>
            <span style={{ color: '#777' }}>{d.name}</span>
            <span style={{ color: '#444' }}>{d.version}</span>
            <Pill status={d.type === 'dep' ? 'ok' : 'cold'} label={d.type === 'dep' ? 'dep' : 'dev'} />
          </div>
        ))}
      </div>

      <SectionTitle>Build info</SectionTitle>
      <div className="dev-three-col">
        {[['Node env', 'development'], ['Build tool', 'Vite 8'], ['Platform', 'Vercel']].map(([label, val]) => (
          <div key={label} className="dev-info-card" style={{ padding: '12px 14px' }}>
            <div className="dev-metric-label">{label}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#888', marginTop: 6 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConsoleTab({ logs, onRun, onClear }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [logs])
  return (
    <div>
      <SectionTitle>Dev console</SectionTitle>
      <div className="dev-console-box" ref={ref}>
        {logs.map((l, i) => <div key={i} className={`dev-console-line ${l.type}`}>{l.msg}</div>)}
        <span className="dev-blink" style={{ color: '#3DC97A' }}>█</span>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className="dev-btn dev-btn-success" onClick={() => onRun('checkContract')}>Check contract</button>
        <button className="dev-btn dev-btn-success" onClick={() => onRun('listDocs')}>List docs</button>
        <button className="dev-btn" onClick={() => onRun('pingApi')}>Ping API</button>
        <button className="dev-btn" onClick={() => onRun('gasPrice')}>Gas price</button>
        <button className="dev-btn dev-btn-danger" onClick={onClear}>Clear</button>
      </div>
      <SectionTitle>Quick links</SectionTitle>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <a className="dev-btn" href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer">Etherscan ↗</a>
        <a className="dev-btn" href="https://docs.ethers.org/v6/" target="_blank" rel="noreferrer">Ethers v6 ↗</a>
        <a className="dev-btn" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Vercel ↗</a>
        <a className="dev-btn" href="https://hardhat.org/docs" target="_blank" rel="noreferrer">Hardhat ↗</a>
        <a className="dev-btn" href="https://docs.ipfs.tech" target="_blank" rel="noreferrer">IPFS ↗</a>
      </div>
    </div>
  )
}

function SuggestTab() {
  return (
    <div>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#2a2a30', marginBottom: 14, lineHeight: 1.9, letterSpacing: '0.04em' }}>
        // Recommended features — matched to your stack. Click any to open in Claude.
      </p>
      <div className="dev-info-card" style={{ padding: 0 }}>
        {SUGGESTIONS.map((s, i) => (
          <a key={i} className="dev-feature-item" href={`https://claude.ai/new?q=${encodeURIComponent(s.prompt)}`} target="_blank" rel="noreferrer">
            <div className="dev-feature-icon">{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="dev-feature-title">{s.title}<span className="dev-feature-tag">{s.tag}</span></div>
              <div className="dev-feature-desc">{s.desc}</div>
            </div>
            <span style={{ color: '#222', fontSize: 14, alignSelf: 'center', flexShrink: 0 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Inner dashboard ──────────────────────────────────────────────────────────
function DashboardInner({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [apiCount, setApiCount] = useState(342)
  const [walletInfo, setWalletInfo] = useState({ address: '', network: '', balance: '', chainId: '', block: '' })
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
    if (!window.ethereum) { addLog('No wallet detected — install MetaMask', 'err'); return }
    try {
      addLog('Requesting wallet access…', 'info')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const chainNum = parseInt(chainId, 16)
      const nets = { 1: 'Ethereum mainnet', 11155111: 'Sepolia testnet', 31337: 'Hardhat local' }
      const network = nets[chainNum] || `Chain ${chainNum}`
      setWalletInfo({ address: addr, network, balance: 'Loading…', chainId: chainNum, block: 'Loading…' })
      addLog(`Connected: ${addr}`, 'ok')
      addLog(`Network: ${network}`, 'info')
    } catch (e) { addLog(`Rejected: ${e.message}`, 'err') }
  }, [addLog])

  const runConsoleCmd = useCallback((cmd) => {
    setActiveTab('console')
    const cmds = {
      checkContract: () => { addLog('Checking contract @ 0xAbCd…1234', 'info'); setTimeout(() => addLog('Reachable — 14 functions, 3 events', 'ok'), 600) },
      listDocs:      () => { addLog('Querying contract for document list…', 'info'); setTimeout(() => addLog('147 documents indexed on Sepolia', 'ok'), 700) },
      pingApi:       () => { addLog('GET /api/status…', 'info'); setTimeout(() => addLog('200 OK — 44ms', 'ok'), 400) },
      gasPrice:      () => { addLog('Fetching gas oracle…', 'info'); setTimeout(() => addLog('safe: 18  standard: 24  fast: 38  (gwei)', 'ok'), 500) },
    }
    cmds[cmd]?.()
  }, [addLog])

  const clearConsole = useCallback(() => { setConsoleLogs([]); addLog('Console cleared', 'info') }, [addLog])
  const refreshAll = useCallback(() => setApiCount(p => p + Math.floor(Math.random() * 30)), [])
  const walletShort = walletInfo.address ? walletInfo.address.slice(0, 6) + '…' + walletInfo.address.slice(-4) : null

  // ── Command palette ──
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(p => !p) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handlePaletteAction = useCallback((action) => {
    if (action === 'connectWallet') connectWallet()
    if (action === 'checkContract') runConsoleCmd('checkContract')
    if (action === 'listDocs')      runConsoleCmd('listDocs')
    if (action === 'pingApi')       runConsoleCmd('pingApi')
    if (action === 'gasPrice')      runConsoleCmd('gasPrice')
    if (action === 'refresh')       refreshAll()
    if (action === 'clearConsole')  clearConsole()
  }, [connectWallet, runConsoleCmd, refreshAll, clearConsole])

  return (
    <div className="dev-shell" style={{ height: '100%' }}>
      {onClose && <button className="dev-overlay-close" onClick={onClose} title="Close (Esc)">✕</button>}

      <div className="dev-topbar">
        <div className="dev-topbar-left">
          <span className="dev-wordmark">Axiome<span className="dev-wordmark-accent">Vault</span></span>
          <span className="dev-badge dev-badge-dev">DEV</span>
          <span className="dev-badge dev-badge-env">v0.0.0 · local</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingRight: onClose ? 34 : 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#2a2a30' }}>
            <span className="dev-pulse" />Vite HMR
          </span>
          <Clock />
          <button
            className="dev-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setPaletteOpen(true)}
            title="Command palette (Ctrl+K)"
          >
            <span style={{ opacity: 0.5 }}>⌘</span> Ctrl+K
          </button>
          <span className="dev-kbd">Ctrl+Shift+D</span>
          <button className="dev-btn" onClick={refreshAll}>↺ Refresh</button>
        </div>
      </div>

      <div className="dev-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`dev-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="dev-content">
        {activeTab === 'overview' && <OverviewTab apiCount={apiCount} walletShort={walletShort} walletNetwork={walletInfo.network} />}
        {activeTab === 'chain'    && <ChainTab walletInfo={walletInfo} onConnect={connectWallet} />}
        {activeTab === 'docs'     && <DocsTab />}
        {activeTab === 'api'      && <ApiTab />}
        {activeTab === 'env'      && <EnvTab />}
        {activeTab === 'console'  && <ConsoleTab logs={consoleLogs} onRun={runConsoleCmd} onClear={clearConsole} />}
        {activeTab === 'suggest'  && <SuggestTab />}
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
          onAction={handlePaletteAction}
        />
      )}
    </div>
  )
}

// ─── Overlay wrapper ──────────────────────────────────────────────────────────
export default function DevDashboard() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); setOpen(p => !p) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="dev-trigger-hint" onClick={() => setOpen(true)} title="Open dev dashboard (Ctrl+Shift+D)">
        <span className="dev-pulse" />
        <span>DEV</span>
        <span style={{ opacity: 0.3 }}>Ctrl+Shift+D</span>
      </div>

      {open && (
        <>
          <div className="dev-overlay-backdrop" onClick={() => setOpen(false)} />
          <div className="dev-overlay-panel">
            <DashboardInner onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}