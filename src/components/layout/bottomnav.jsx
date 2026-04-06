const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18M3 12h18M3 17h18"/>
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

export default function BottomNav({ currentPage, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const active = currentPage === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`bottom-nav-item ${active ? 'bottom-nav-item--active' : ''}`}
            aria-label={item.label}
          >
            <span className="bottom-nav-icon">{item.icon(active)}</span>
            <span className="bottom-nav-label">{item.label}</span>
            {active && <span className="bottom-nav-indicator" />}
          </button>
        )
      })}

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 68px;
          background: var(--color-surface-card);
          border-top: 1px solid var(--color-surface-border);
          display: flex;
          align-items: stretch;
          z-index: 30;
          padding: 0 8px;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 12px;
          padding: 8px 4px;
          position: relative;
          color: var(--color-text-muted);
          font-family: var(--font-body);
          transition: all 150ms ease;
        }
        .bottom-nav-item:hover {
          color: var(--color-text-secondary);
          background: var(--color-surface-subtle);
        }
        .bottom-nav-item--active {
          color: var(--color-brand-500);
        }
        .bottom-nav-item--active:hover {
          color: var(--color-brand-600);
          background: rgba(34,197,94,0.06);
        }

        .bottom-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 150ms ease;
        }
        .bottom-nav-item--active .bottom-nav-icon {
          transform: translateY(-1px);
        }

        .bottom-nav-label {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .bottom-nav-item--active .bottom-nav-label {
          font-weight: 700;
        }

        .bottom-nav-indicator {
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          border-radius: 0 0 3px 3px;
          background: var(--color-brand-500);
          top: 0;
        }

        /* Hide on desktop */
        @media (min-width: 1024px) {
          .bottom-nav { display: none; }
        }
      `}</style>
    </nav>
  )
}