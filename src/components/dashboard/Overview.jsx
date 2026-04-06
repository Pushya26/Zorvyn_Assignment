import { useMemo } from 'react'
import { parseISO, format, compareAsc } from 'date-fns'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import useStore from '../../store/useStore'
import { formatCurrency, formatDate } from '../../utils/formatters'

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)', 'var(--color-chart-7)']

export default function Overview() {
  const transactions = useStore((state) => state.transactions)

  const { totals, monthlyBalance, trendText } = useMemo(() => {
    const totals = transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.income += tx.amount
        if (tx.type === 'expense') acc.expense += tx.amount
        return acc
      },
      { income: 0, expense: 0 }
    )

    const balance = totals.income - totals.expense
    const savingsRate = totals.income ? Math.max(0, (balance / totals.income) * 100) : 0

    const monthlyMap = transactions.reduce((map, tx) => {
      const date = parseISO(tx.date)
      const monthKey = format(date, 'yyyy-MM')
      const label = format(date, 'MMM yy')
      const month = map.get(monthKey) ?? { label, income: 0, expense: 0 }
      if (tx.type === 'income') month.income += tx.amount
      if (tx.type === 'expense') month.expense += tx.amount
      map.set(monthKey, month)
      return map
    }, new Map())

    const sortedMonths = Array.from(monthlyMap.entries()).sort(([a], [b]) => compareAsc(parseISO(`${a}-01`), parseISO(`${b}-01`)))
    const monthlyBalance = sortedMonths.reduce((acc, [, month]) => {
      const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
      const balance = previousBalance + month.income - month.expense
      acc.push({
        month: month.label,
        income: month.income,
        expense: month.expense,
        balance,
      })
      return acc
    }, [])

    const diff = monthlyBalance.length > 1 ? monthlyBalance[monthlyBalance.length - 1].balance - monthlyBalance[monthlyBalance.length - 2].balance : 0
    const trendText = diff >= 0 ? `+${formatCurrency(diff, { compact: true })} vs last month` : `${formatCurrency(diff, { compact: true })} vs last month`

    return {
      totals: {
        balance,
        income: totals.income,
        expense: totals.expense,
        savingsRate,
      },
      monthlyBalance,
      trendText,
    }
  }, [transactions])

  const summaryCards = [
    {
      label: 'Total Balance',
      value: formatCurrency(totals.balance),
      accent: 'var(--color-brand-500)',
      note: trendText,
    },
    {
      label: 'Total Income',
      value: formatCurrency(totals.income),
      accent: 'var(--color-income)',
      note: 'Income is stable',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totals.expense),
      accent: 'var(--color-expense)',
      note: 'Expenses tracked',
    },
    {
      label: 'Savings Rate',
      value: `${totals.savingsRate.toFixed(0)}%`, 
      accent: 'var(--color-chart-3)',
      note: 'Based on last 6 months',
    },
  ]

  const expenseCategories = Object.entries(
    transactions.reduce((acc, tx) => {
      if (tx.type !== 'expense') return acc
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount
      return acc
    }, {})
  )
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="overview-shell">
      <section className="card-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className="stat-card">
            <div className="stat-card-head">
              <span className="stat-card-icon" style={{ background: card.accent }} />
              <span className="stat-card-label">{card.label}</span>
            </div>
            <p className="stat-card-value">{card.value}</p>
            <p className="stat-card-note">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="chart-card">
          <div className="chart-card-head">
            <div>
              <h2>Balance trend</h2>
              <p>Running cash position over time</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyBalance} margin={{ top: 8, right: 24, left: 24, bottom: 4 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(34, 197, 94, 0.85)" />
                    <stop offset="100%" stopColor="rgba(34, 197, 94, 0.12)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="balance" stroke="var(--color-brand-500)" fill="url(#balanceGrad)" strokeWidth={3} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <h2>Recent transactions</h2>
                <p>Latest entries</p>
              </div>
            </div>
            <div className="recent-tx-minimal">
              {transactions.slice().sort((a, b) => parseISO(b.date) - parseISO(a.date)).slice(0, 8).length > 0 ? (
                <div className="minimal-tx-list">
                  {transactions.slice().sort((a, b) => parseISO(b.date) - parseISO(a.date)).slice(0, 8).map((tx) => (
                    <div key={tx.id} className="minimal-tx-row">
                      <span className="minimal-tx-date">{formatDate(tx.date, 'short')}</span>
                      <span className="minimal-tx-desc">{tx.description}</span>
                      <span className={`minimal-tx-amt minimal-tx-amt--${tx.type}`}>
                        {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="breakdown-grid">
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <h2>Spending breakdown</h2>
                <p>Expenses by category</p>
              </div>
            </div>
            <div className="chart-wrapper chart-sidebar">
              <ResponsiveContainer width="100%" height={310}>
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={expenseCategories}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={6}
                    stroke="transparent"
                    cx="50%"
                    cy="50%"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={entry.category} fill={`var(--color-chart-${(index % 7) + 1})`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-list">
                {expenseCategories.slice(0, 5).map((item, index) => (
                  <div key={item.category} className="legend-row">
                    <span className="legend-dot" style={{ background: `var(--color-chart-${(index % 7) + 1})` }} />
                    <span>{item.category}</span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <h2>Income vs Expenses</h2>
                <p>Month-over-month comparison</p>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyBalance} margin={{ top: 16, right: 24, left: 24, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .overview-shell {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .card-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat( auto-fit, minmax(220px, 1fr) );
        }
        .stat-card {
          background: var(--color-surface-card);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-height: 154px;
        }
        .stat-card-head {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .stat-card-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: inline-flex;
          box-shadow: 0 10px 20px -15px rgba(34, 197, 94, 0.65);
        }
        .stat-card-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .stat-card-value {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .stat-card-note {
          margin: 0;
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }
        .dashboard-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: 1fr;
        }
        .breakdown-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        .recent-transactions-card {
          grid-column: 1 / -1;
        }
        .chart-card {
          background: var(--color-surface-card);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card);
          padding: 24px;
        }
        .chart-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .chart-card-head h2 {
          margin: 0;
          font-size: 1rem;
          color: var(--color-text-primary);
        }
        .chart-card-head p {
          margin: 0;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        .chart-wrapper {
          min-height: 320px;
          width: 100%;
        }
        .chart-sidebar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: center;
        }
        .legend-list {
          display: grid;
          gap: 12px;
          padding-top: 8px;
        }
        .legend-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .recent-tx-minimal {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .minimal-tx-list {
          display: grid;
          gap: 0;
          divider: 1px solid var(--color-surface-border);
        }
        .minimal-tx-row {
          display: grid;
          grid-template-columns: 0.9fr 2fr 1.1fr;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-surface-border);
          font-size: 0.9rem;
        }
        .minimal-tx-row:last-child {
          border-bottom: none;
        }
        .minimal-tx-date {
          color: var(--color-text-secondary);
          font-weight: 500;
          font-size: 0.85rem;
        }
        .minimal-tx-desc {
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.9rem;
        }
        .minimal-tx-amt {
          text-align: right;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .minimal-tx-amt--income {
          color: var(--color-income);
        }
        .minimal-tx-amt--expense {
          color: var(--color-expense);
        }
        .recent-transactions-table {
          display: flex;
          flex-direction: column;
        }
        .transaction-rows {
          display: grid;
          gap: 12px;
        }
        .transaction-row {
          display: grid;
          grid-template-columns: 1.2fr 2fr 1.2fr 1fr 1.4fr;
          gap: 12px;
          align-items: center;
          padding: 14px;
          background: var(--color-surface-subtle);
          border-radius: 14px;
          font-size: 0.9rem;
        }
        .tx-date {
          color: var(--color-text-secondary);
          font-weight: 500;
        }
        .tx-desc {
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tx-category {
          color: var(--color-text-secondary);
        }
        .tx-type {
          text-align: center;
        }
        .type-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .type-badge--income {
          background: var(--color-income-bg);
          color: var(--color-income);
        }
        .type-badge--expense {
          background: var(--color-expense-bg);
          color: var(--color-expense);
        }
        .tx-amount {
          text-align: right;
          font-weight: 600;
        }
        .tx-amount--income {
          color: var(--color-income);
        }
        .tx-amount--expense {
          color: var(--color-expense);
        }
        .empty-transactions {
          padding: 32px;
          text-align: center;
          color: var(--color-text-muted);
        }
        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1.7fr 1.3fr;
          }
          .recent-transactions-card {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 1023px) {
          .chart-sidebar {
            grid-template-columns: 1fr;
          }
          .transaction-row {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .tx-date {
            grid-column: 1;
            grid-row: 1;
          }
          .tx-amount {
            grid-column: 2;
            grid-row: 1;
            text-align: right;
          }
          .tx-desc {
            grid-column: 1 / -1;
            margin-top: 8px;
          }
          .tx-category {
            grid-column: 1;
          }
          .tx-type {
            grid-column: 2;
            text-align: right;
          }
        }
      `}</style>
    </div>
  )
}
