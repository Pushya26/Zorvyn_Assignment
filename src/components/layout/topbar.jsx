import useStore from '../../store/useStore'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  insights: 'Insights',
}

const PAGE_SUBTITLES = {
  dashboard: 'Your financial overview',
  transactions: 'All your transactions',
  insights: 'Spending patterns & trends',
}

export default function Topbar({ onMenuClick, currentPage }) {
  const { darkMode, setDarkMode, role } = useStore()

  return (
    <header className="topbar">
      {/* ── Left: Hamburger (mobile) + Page Title ── */}
      <div className="topbar-left">
        <button
          className="hamburger"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="page-title-group">
          <h1 className="page-title">{PAGE_TITLES[currentPage]}</h1>
          <p className="page-subtitle">{PAGE_SUBTITLES[currentPage]}</p>
        </div>
      </div>

      {/* ── Right: Quick actions ── */}
      <div className="topbar-right">
        {/* Role Badge */}
        <span className={`role-badge ${role === 'admin' ? 'role-badge--admin' : 'role-badge--viewer'}`}>
          {role === 'admin' ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
          {role}
        </span>

        {/* Dark mode — visible on desktop only, mobile uses sidebar */}
        <button
          className="icon-btn topbar-dark-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: var(--color-surface-card);
          border-bottom: 1px solid var(--color-surface-border);
          position: sticky;
          top: 0;
          z-index: 30;
          gap: 12px;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        /* Hamburger — shown on mobile only */
        .hamburger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--color-surface-border);
          background: var(--color-surface-subtle);
          color: var(--color-text-secondary);
          cursor: pointer;
          flex-shrink: 0;
          transition: all 150ms ease;
        }
        .hamburger:hover {
          background: var(--color-surface-border);
          color: var(--color-text-primary);
        }

        .page-title-group {
          min-width: 0;
        }
        .page-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .page-subtitle {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin: 0;
          display: none;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* Role badge */
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: capitalize;
          letter-spacing: 0.02em;
        }
        .role-badge--admin {
          background: rgba(34, 197, 94, 0.12);
          color: var(--color-brand-600);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .role-badge--viewer {
          background: var(--color-surface-subtle);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-surface-border);
        }

        /* Icon button */
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--color-surface-border);
          background: var(--color-surface-subtle);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .icon-btn:hover {
          background: var(--color-surface-border);
          color: var(--color-text-primary);
        }

        /* Hide dark toggle from topbar on desktop (sidebar has it) */
        @media (min-width: 1024px) {
          .hamburger { display: none; }
          .topbar-dark-toggle { display: none; }
          .page-subtitle { display: block; }
          .page-title { font-size: 1.35rem; }
          .topbar { padding: 16px 40px; }
        }
      `}</style>
    </header>
  )
}