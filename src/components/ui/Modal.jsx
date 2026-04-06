export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
      <style>{`
        .modal-shell {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(7, 15, 33, 0.55);
          backdrop-filter: blur(4px);
        }
        .modal-panel {
          position: relative;
          width: min(100%, 680px);
          max-height: min(100dvh - 48px, 850px);
          overflow: auto;
          border-radius: 24px;
          background: var(--color-surface-card);
          box-shadow: var(--shadow-modal);
          padding: 24px;
          animation: popUp 240ms ease;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .modal-header h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--color-text-primary);
        }
        .modal-close {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: var(--color-surface-subtle);
          color: var(--color-text-secondary);
          font-size: 1.4rem;
          cursor: pointer;
        }
        .modal-close:hover {
          background: var(--color-surface-border);
        }
        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .modal-footer {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        @keyframes popUp {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
