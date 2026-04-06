import { useMemo } from 'react'
import useStore from '../../store/useStore'
import { useInsights } from '../../hooks/useInsights'
import { formatCurrency, formatPercent } from '../../utils/formatters'

const STATIC_ICONS = {
  category: '🧾',
  trend: '📈',
  daily: '🕒',
  top: '🎯',
  ratio: '⚖️',
}

export default function InsightsPage() {
  const transactions = useStore((state) => state.transactions)
  const insights = useInsights(transactions)

  const metricCards = useMemo(() => [
    {
      title: 'Biggest spending category',
      value: insights.highestSpendingCategory ? `${insights.highestSpendingCategory.category}` : 'N/A',
      detail: insights.highestSpendingCategory ? formatCurrency(insights.highestSpendingCategory.amount) : '',
      icon: STATIC_ICONS.category,
    },
    {
      title: 'Month-on-month',
      value: insights.currentMonth || 'Latest',
      detail: `${insights.expenseChange >= 0 ? '+' : ''}${insights.expenseChange.toFixed(1)}% vs last month`,
      icon: STATIC_ICONS.trend,
    },
    {
      title: 'Average daily spend',
      value: formatCurrency(insights.averageDailySpend),
      detail: `Based on ${insights.currentMonth || 'current'} month`,
      icon: STATIC_ICONS.daily,
    },
    {
      title: 'Top expense',
      value: insights.topExpense.amount ? insights.topExpense.description : 'N/A',
      detail: insights.topExpense.amount ? formatCurrency(insights.topExpense.amount) : '',
      icon: STATIC_ICONS.top,
    },
    {
      title: 'Expense ratio',
      value: `${formatPercent(insights.incomeExpenseRatio, 1)}`,
      detail: `of income spent`,
      icon: STATIC_ICONS.ratio,
    },
  ], [insights])

  const comparisonMax = Math.max(...insights.categoryComparison.map((item) => Math.max(item.currentValue, item.previousValue), 0), 1)

  return (
    <div className="insights-shell">
      <section className="insights-grid">
        {metricCards.map((card) => (
          <article key={card.title} className="insight-card">
            <div className="insight-card-icon">{card.icon}</div>
            <div>
              <p className="insight-label">{card.title}</p>
              <h3>{card.value}</h3>
              <p>{card.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="comparison-card">
        <div className="comparison-header">
          <div>
            <p className="eyebrow">Monthly comparison</p>
            <h2>{insights.previousMonth} vs {insights.currentMonth}</h2>
          </div>
          <p className="comparison-summary">
            You spent {formatCurrency(insights.currentMonthExpense)} this month, {insights.expenseChange >= 0 ? 'up' : 'down'} {Math.abs(insights.expenseChange).toFixed(1)}% from last month.
          </p>
        </div>

        <div className="comparison-list">
          {insights.categoryComparison.map((item) => (
            <div key={item.category} className="comparison-row">
              <div>
                <p className="category-name">{item.category}</p>
                <p className="category-amounts">{formatCurrency(item.currentValue)} • {formatCurrency(item.previousValue)}</p>
              </div>
              <div className="bar-shell">
                <div className="bar previous" style={{ width: `${(item.previousValue / comparisonMax) * 100}%` }} />
                <div className="bar current" style={{ width: `${(item.currentValue / comparisonMax) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .insights-shell {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }
        .insight-card {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 18px;
          background: var(--color-surface-card);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-card);
          padding: 22px;
          box-shadow: var(--shadow-card);
        }
        .insight-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          font-size: 1.5rem;
          background: var(--color-surface-subtle);
          color: var(--color-text-primary);
        }
        .insight-label {
          margin: 0 0 8px;
          color: var(--color-text-muted);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .insight-card h3 {
          margin: 0;
          font-size: 1.3rem;
          color: var(--color-text-primary);
        }
        .insight-card p {
          margin: 6px 0 0;
          color: var(--color-text-secondary);
        }
        .comparison-card {
          background: var(--color-surface-card);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card);
          padding: 24px;
        }
        .comparison-header {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .comparison-header h2 {
          margin: 8px 0 0;
          color: var(--color-text-primary);
          font-size: 1.35rem;
        }
        .comparison-summary {
          margin: 0;
          max-width: 380px;
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }
        .comparison-list {
          display: grid;
          gap: 16px;
        }
        .comparison-row {
          display: grid;
          gap: 12px;
        }
        .category-name {
          margin: 0;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .category-amounts {
          margin: 4px 0 0;
          color: var(--color-text-muted);
          font-size: 0.95rem;
        }
        .bar-shell {
          display: grid;
          gap: 6px;
          min-height: 54px;
        }
        .bar {
          height: 12px;
          border-radius: 999px;
          transition: width 240ms ease;
        }
        .bar.previous {
          background: var(--color-surface-subtle);
        }
        .bar.current {
          background: var(--color-brand-500);
        }
        @media (max-width: 720px) {
          .comparison-header {
            flex-direction: column;
            align-items: stretch;
          }
          .comparison-summary {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
