import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'

export default function Layout({ children, currentPage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout-root">
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar-desktop">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`sidebar-mobile ${sidebarOpen ? 'sidebar-mobile--open' : ''}`}
      >
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            onNavigate(page)
            setSidebarOpen(false)
          }}
        />
      </aside>

      {/* ── Main Content ── */}
      <div className="main-wrapper">
        <Topbar onMenuClick={() => setSidebarOpen(true)} currentPage={currentPage} />
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />

      <style>{`
        .layout-root {
          display: flex;
          min-height: 100dvh;
          background-color: var(--color-surface-base);
        }

        /* Desktop sidebar — always visible */
        .sidebar-desktop {
          display: none;
          width: 240px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100dvh;
          overflow-y: auto;
          border-right: 1px solid var(--color-surface-border);
          background-color: var(--color-surface-card);
        }

        /* Mobile sidebar — slides in from left */
        .sidebar-mobile {
          display: block;
          position: fixed;
          inset: 0 auto 0 0;
          width: 260px;
          z-index: 50;
          background-color: var(--color-surface-card);
          border-right: 1px solid var(--color-surface-border);
          transform: translateX(-100%);
          transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }
        .sidebar-mobile--open {
          transform: translateX(0);
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
          z-index: 40;
          animation: fadeIn 200ms ease;
        }

        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding-bottom: 72px; /* space for bottom nav on mobile */
        }

        .main-content {
          flex: 1;
          padding: 24px 20px;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
        }

        @keyframes fadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }

        @media (min-width: 1024px) {
          .sidebar-desktop { display: block; }
          .sidebar-mobile  { display: none; }
          .main-wrapper    { padding-bottom: 0; }
          .main-content    { padding: 32px 40px; }
        }
      `}</style>
    </div>
  )
}