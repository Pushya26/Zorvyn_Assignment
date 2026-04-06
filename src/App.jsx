import { useEffect, useState } from 'react'
import Layout from './components/layout/layout'
import Overview from './components/dashboard/Overview'
import TransactionsPage from './components/transactions/TransactionsPage'
import InsightsPage from './components/insights/InsightsPage'

const PAGES = {
  dashboard: Overview,
  transactions: TransactionsPage,
  insights: InsightsPage,
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const PageComponent = PAGES[currentPage]

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {ready ? (
        <PageComponent />
      ) : (
        <div className="page-loader">
          <div className="loader-card" />
          <div className="loader-card" />
          <div className="loader-card" />
        </div>
      )}
      <style>{`
        .page-loader {
          display: grid;
          gap: 18px;
          padding: 20px 0;
        }
        .loader-card {
          height: 180px;
          border-radius: var(--radius-card);
          background: linear-gradient(90deg, var(--color-surface-subtle), var(--color-surface-card), var(--color-surface-subtle));
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </Layout>
  )
}

export default App
