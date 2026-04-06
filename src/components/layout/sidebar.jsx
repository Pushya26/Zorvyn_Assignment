import useStore from '../../store/useStore'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18M3 12h18M3 17h18"/>
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

export default function Sidebar({ currentPage, onNavigate }) {
  const { role, setRole, darkMode, setDarkMode } = useStore()

  return (
    <div className="sidebar-inner">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <span className="logo-text">Finflow</span>
      </div>

      {/* ── Nav Links ── */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Menu</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-item ${currentPage === item.id ? 'nav-item--active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {currentPage === item.id && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Role Switcher ── */}
      <div className="sidebar-section">
        <p className="nav-section-label">Role</p>
        <div className="role-switcher">
          <div className="role-icon">
            {role === 'admin' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="role-select"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <p className="role-hint">
          {role === 'admin'
            ? 'Can add, edit & delete'
            : 'Read-only access'}
        </p>
      </div>

      {/* ── Dark Mode Toggle ── */}
      <div className="sidebar-section">
        <p className="nav-section-label">Appearance</p>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="dark-mode-toggle"
          aria-label="Toggle dark mode"
        >
          <span className="toggle-track">
            <span className={`toggle-thumb ${darkMode ? 'toggle-thumb--on' : ''}`} />
          </span>
          <span className="toggle-label">
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <span className="toggle-emoji">{darkMode ? '🌙' : '☀️'}</span>
        </button>
      </div>

      {/* ── User Footer ── */}
      <div className="sidebar-footer">
        <div className="user-avatar">
          {role === 'admin' ? 'A' : 'V'}
        </div>
        <div className="user-info">
          <p className="user-name">{role === 'admin' ? 'Admin User' : 'Viewer'}</p>
          <p className="user-role">{role}</p>
        </div>
      </div>

      <style>{`
        .sidebar-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px 0;
          gap: 4px;
        }

        /* Logo */
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px 20px;
          border-bottom: 1px solid var(--color-surface-border);
          margin-bottom: 8px;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35);
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--color-text-primary);
          letter-spacing: -0.03em;
        }

        /* Nav */
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 12px;
        }
        .nav-section-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          padding: 8px 8px 4px;
          margin: 0;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          cursor: pointer;
          width: 100%;
          text-align: left;
          position: relative;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 150ms ease;
        }
        .nav-item:hover {
          background: var(--color-surface-subtle);
          color: var(--color-text-primary);
        }
        .nav-item--active {
          background: var(--color-brand-500);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        .nav-item--active:hover {
          background: var(--color-brand-600);
          color: white;
        }
        .nav-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .nav-label {
          flex: 1;
        }
        .nav-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.7);
        }

        /* Sections */
        .sidebar-section {
          padding: 12px 20px;
          border-top: 1px solid var(--color-surface-border);
        }

        /* Role Switcher */
        .role-switcher {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-surface-border);
          border-radius: 10px;
          padding: 4px 10px 4px 10px;
        }
        .role-icon {
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .role-select {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
          cursor: pointer;
          padding: 6px 0;
        }
        .role-hint {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          margin: 4px 0 0;
        }

        /* Dark Mode Toggle */
        .dark-mode-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .dark-mode-toggle:hover {
          color: var(--color-text-primary);
        }
        .toggle-track {
          width: 36px;
          height: 20px;
          border-radius: 999px;
          background: var(--color-surface-border);
          position: relative;
          flex-shrink: 0;
          transition: background 200ms ease;
        }
        .dark-mode-toggle:hover .toggle-track {
          background: var(--color-brand-200);
        }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toggle-thumb--on {
          transform: translateX(16px);
          background: var(--color-brand-500);
        }
        .toggle-label { flex: 1; text-align: left; }
        .toggle-emoji { font-size: 0.875rem; }

        /* User Footer */
        .sidebar-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-top: 1px solid var(--color-surface-border);
        }
        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .user-info { flex: 1; min-width: 0; }
        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-role {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          margin: 0;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  )
}