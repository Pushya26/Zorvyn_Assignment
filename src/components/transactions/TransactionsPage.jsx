import { useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import useStore from '../../store/useStore'
import { useDebounce } from '../../hooks/useDebounce'
import { useRole } from '../../hooks/useRole'
import Modal from '../ui/Modal'
import { exportToCSV, exportToJSON } from '../../utils/exportUtils'
import { formatCurrency, formatDate } from '../../utils/formatters'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
]

const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'))

function normalizeMonthDay(value) {
  return value ? value.split('-') : ['01', '01']
}

function makeMonthDay(month, day) {
  return `${month}-${day}`
}

function getCurrentYear() {
  return new Date().getFullYear().toString()
}

export default function TransactionsPage() {
  const transactions = useStore((state) => state.transactions)
  const filters = useStore((state) => state.filters)
  const setFilter = useStore((state) => state.setFilter)
  const resetFilters = useStore((state) => state.resetFilters)
  const addTransaction = useStore((state) => state.addTransaction)
  const editTransaction = useStore((state) => state.editTransaction)
  const deleteTransaction = useStore((state) => state.deleteTransaction)
  const getFilteredTransactions = useStore((state) => state.getFilteredTransactions)
  const { isAdmin } = useRole()

  const filteredTransactions = getFilteredTransactions()

  const [searchText, setSearchText] = useState(filters.search)
  const debouncedSearch = useDebounce(searchText, 300)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [formValues, setFormValues] = useState({
    description: '',
    amount: '',
    category: 'Food',
    type: 'expense',
    year: getCurrentYear(),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
    day: String(new Date().getDate()).padStart(2, '0'),
  })
  const [formErrors, setFormErrors] = useState({})
  const [deleteCandidate, setDeleteCandidate] = useState(null)

  useEffect(() => {
    setFilter('search', debouncedSearch)
  }, [debouncedSearch, setFilter])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(transactions.map((tx) => tx.category)))
    return ['all', ...unique.sort()]
  }, [transactions])

  const activeFilters = filters.category !== 'all' || filters.type !== 'all' || filters.dateFrom || filters.dateTo || filters.search

  const openAddModal = () => {
    const now = new Date()
    setEditingTx(null)
    setFormValues({
      description: '',
      amount: '',
      category: 'Food',
      type: 'expense',
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: String(now.getDate()).padStart(2, '0'),
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const openEditModal = (transaction) => {
    const [year, month, day] = transaction.date.split('-')
    setEditingTx(transaction)
    setFormValues({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      year,
      month,
      day,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const handleChange = (key, value) => {
    setFormValues((current) => ({ ...current, [key]: value }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formValues.description.trim()) errors.description = 'Description is required'
    if (!formValues.amount || Number(formValues.amount) <= 0) errors.amount = 'Amount must be greater than zero'
    if (!formValues.month || !formValues.day) errors.date = 'Date is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validateForm()) return

    const payload = {
      description: formValues.description.trim(),
      amount: Number(formValues.amount),
      category: formValues.category,
      type: formValues.type,
      date: `${formValues.year}-${formValues.month}-${formValues.day}`,
    }

    if (editingTx) {
      editTransaction(editingTx.id, payload)
    } else {
      addTransaction({ id: uuid(), ...payload })
    }

    setModalOpen(false)
  }

  const handleDelete = () => {
    if (deleteCandidate) {
      deleteTransaction(deleteCandidate)
      setDeleteCandidate(null)
    }
  }

  return (
    <div className="transactions-shell">
      <section className="transactions-header">
        <div>
          <p className="eyebrow">Transactions</p>
          <h2>Manage every entry</h2>
        </div>
        <div className="transactions-actions">
          <button className="button button-secondary" onClick={() => setExportMenuOpen((open) => !open)}>
            Export
          </button>
          {exportMenuOpen && (
            <div className="export-dropdown">
              <button type="button" onClick={() => { exportToCSV(filteredTransactions); setExportMenuOpen(false) }}>Export CSV</button>
              <button type="button" onClick={() => { exportToJSON(filteredTransactions); setExportMenuOpen(false) }}>Export JSON</button>
            </div>
          )}
          {isAdmin && (
            <button className="button button-primary" onClick={openAddModal}>Add Transaction</button>
          )}
        </div>
      </section>

      <section className="transactions-filters">
        <input
          aria-label="Search transactions"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search description or category"
          className="input-field"
        />

        <select
          value={filters.category}
          onChange={(event) => setFilter('category', event.target.value)}
          className="input-field"
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category === 'all' ? 'All categories' : category}</option>
          ))}
        </select>

        <div className="toggle-group">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`toggle-button ${filters.type === option.value ? 'toggle-button--active' : ''}`}
              onClick={() => setFilter('type', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="date-filter-row">
          <label>
            From
            <div className="month-day-row">
              <select
                value={normalizeMonthDay(filters.dateFrom)[0]}
                onChange={(event) => setFilter('dateFrom', makeMonthDay(event.target.value, normalizeMonthDay(filters.dateFrom)[1]))}
                className="input-field"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={normalizeMonthDay(filters.dateFrom)[1]}
                onChange={(event) => setFilter('dateFrom', makeMonthDay(normalizeMonthDay(filters.dateFrom)[0], event.target.value))}
                className="input-field"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </label>
          <label>
            To
            <div className="month-day-row">
              <select
                value={normalizeMonthDay(filters.dateTo)[0]}
                onChange={(event) => setFilter('dateTo', makeMonthDay(event.target.value, normalizeMonthDay(filters.dateTo)[1]))}
                className="input-field"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={normalizeMonthDay(filters.dateTo)[1]}
                onChange={(event) => setFilter('dateTo', makeMonthDay(normalizeMonthDay(filters.dateTo)[0], event.target.value))}
                className="input-field"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <div className="sort-row">
          <label>
            Sort by
            <select
              value={filters.sortBy}
              onChange={(event) => setFilter('sortBy', event.target.value)}
              className="input-field"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
          </label>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}
          >
            {filters.sortDir === 'asc' ? 'Oldest' : 'Newest'}
          </button>
        </div>

        {activeFilters && (
          <button className="button button-link" onClick={() => { resetFilters(); setSearchText('') }}>Clear filters</button>
        )}
      </section>

      <section className="transactions-table-shell">
        {filteredTransactions.length > 0 ? (
          <div className="transactions-table">
            <div className="transactions-table-head">
              <span>Date</span>
              <span className="hide-on-mobile">Description</span>
              <span>Category</span>
              <span>Type</span>
              <span>Amount</span>
              {isAdmin && <span className="actions-header">Actions</span>}
            </div>
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="transactions-row">
                <div className="cell date-cell">
                  <strong>{formatDate(tx.date, 'short')}</strong>
                  <span className="mobile-label hide-on-desktop">Description</span>
                </div>
                <div className="cell description-cell hide-on-mobile">{tx.description}</div>
                <div className="cell category-cell">
                  <span className="pill pill-category">{tx.category}</span>
                </div>
                <div className="cell type-cell">
                  <span className={`pill pill-type pill-type--${tx.type}`}>{tx.type}</span>
                </div>
                <div className="cell amount-cell">{tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}</div>
                {isAdmin && (
                  <div className="cell actions-cell">
                    <button className="icon-button" type="button" title="Edit" onClick={() => openEditModal(tx)}>✎</button>
                    <button className="icon-button icon-button-danger" type="button" title="Delete" onClick={() => setDeleteCandidate(tx.id)}>🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration">📭</div>
            <h3>{transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}</h3>
            <p>
              {transactions.length === 0
                ? 'Add your first transaction to start tracking your cash flow.'
                : 'Try adjusting the filters or reset them to see more records.'}
            </p>
            <div className="empty-actions">
              {transactions.length === 0 && isAdmin && (
                <button className="button button-primary" onClick={openAddModal}>Add first transaction</button>
              )}
              <button className="button button-secondary" onClick={resetFilters}>Clear filters</button>
            </div>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        title={editingTx ? 'Edit transaction' : 'Add transaction'}
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <button className="button button-secondary" onClick={() => setModalOpen(false)} type="button">Cancel</button>
            <button className="button button-primary" onClick={handleSubmit} type="button">Save</button>
          </>
        )}
      >
        <form className="transaction-form" onSubmit={handleSubmit}>
          <label>
            Description
            <input
              className="input-field"
              type="text"
              value={formValues.description}
              onChange={(event) => handleChange('description', event.target.value)}
            />
            {formErrors.description && <span className="field-error">{formErrors.description}</span>}
          </label>
          <label>
            Amount
            <input
              className="input-field"
              type="number"
              min="1"
              value={formValues.amount}
              onChange={(event) => handleChange('amount', event.target.value)}
            />
            {formErrors.amount && <span className="field-error">{formErrors.amount}</span>}
          </label>
          <label>
            Category
            <select
              className="input-field"
              value={formValues.category}
              onChange={(event) => handleChange('category', event.target.value)}
            >
              {categories.filter((c) => c !== 'all').map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </label>
          <fieldset className="type-fieldset">
            <legend>Type</legend>
            <label className="radio-option">
              <input
                type="radio"
                name="transaction-type"
                value="expense"
                checked={formValues.type === 'expense'}
                onChange={(event) => handleChange('type', event.target.value)}
              />
              Expense
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="transaction-type"
                value="income"
                checked={formValues.type === 'income'}
                onChange={(event) => handleChange('type', event.target.value)}
              />
              Income
            </label>
          </fieldset>
          <label>
            Date
            <div className="month-day-row">
              <select
                className="input-field"
                value={formValues.month}
                onChange={(event) => handleChange('month', event.target.value)}
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                className="input-field"
                value={formValues.day}
                onChange={(event) => handleChange('day', event.target.value)}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            {formErrors.date && <span className="field-error">{formErrors.date}</span>}
          </label>
        </form>
      </Modal>

      {deleteCandidate && (
        <Modal
          open
          title="Delete transaction"
          onClose={() => setDeleteCandidate(null)}
          footer={(
            <>
              <button className="button button-secondary" onClick={() => setDeleteCandidate(null)} type="button">Cancel</button>
              <button className="button button-danger" onClick={handleDelete} type="button">Delete</button>
            </>
          )}
        >
          <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
        </Modal>
      )}

      <style>{`
        .transactions-shell {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .transactions-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }
        .transactions-header .eyebrow {
          margin: 0;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
        }
        .transactions-header h2 {
          margin: 8px 0 0;
          font-size: 1.7rem;
          color: var(--color-text-primary);
        }
        .transactions-actions {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .export-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 12px;
          background: var(--color-surface-card);
          border: 1px solid var(--color-surface-border);
          border-radius: 16px;
          box-shadow: var(--shadow-modal);
          padding: 10px;
          display: grid;
          gap: 6px;
          min-width: 150px;
          z-index: 10;
        }
        .export-dropdown button {
          border: none;
          background: transparent;
          color: var(--color-text-primary);
          text-align: left;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
        }
        .export-dropdown button:hover {
          background: var(--color-surface-subtle);
        }
        .transactions-filters {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .input-field {
          width: 100%;
          border-radius: 16px;
          border: 1px solid var(--color-surface-border);
          background: var(--color-surface-card);
          color: var(--color-text-primary);
          padding: 12px 14px;
          font: inherit;
        }
        .month-day-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .input-field:focus {
          outline: 2px solid rgba(34, 197, 94, 0.4);
          border-color: var(--color-brand-300);
        }
        .toggle-group {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }
        .toggle-button {
          border: 1px solid var(--color-surface-border);
          background: var(--color-surface-card);
          border-radius: 999px;
          color: var(--color-text-secondary);
          padding: 10px 14px;
          cursor: pointer;
          font: inherit;
          white-space: nowrap;
        }
        .toggle-button--active {
          background: var(--color-brand-500);
          color: white;
          border-color: transparent;
        }
        .date-filter-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .sort-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .button {
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font: inherit;
          padding: 12px 18px;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .button-primary {
          background: var(--color-brand-500);
          color: white;
        }
        .button-secondary {
          background: var(--color-surface-subtle);
          color: var(--color-text-primary);
        }
        .button-ghost {
          background: transparent;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-surface-border);
        }
        .button-link {
          background: transparent;
          color: var(--color-brand-500);
          font-weight: 600;
          padding: 0;
        }
        .transactions-table-shell {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .transactions-table {
          display: grid;
          gap: 12px;
        }
        .transactions-table-head,
        .transactions-row {
          display: grid;
          grid-template-columns: 1.4fr 2.3fr 1.6fr 1.2fr 1.2fr 1fr;
          gap: 12px;
          align-items: center;
          padding: 14px 18px;
          background: var(--color-surface-card);
          border: 1px solid var(--color-surface-border);
          border-radius: 18px;
          box-shadow: var(--shadow-card);
        }
        .transactions-table-head {
          position: sticky;
          top: 0;
          z-index: 1;
          background: var(--color-surface-card);
        }
        .transactions-row {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .transactions-row:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card-hover);
        }
        .transactions-row .cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .category-cell,
        .type-cell,
        .amount-cell,
        .actions-cell {
          justify-content: center;
          align-items: flex-start;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .pill-category {
          background: var(--color-surface-subtle);
          color: var(--color-text-secondary);
        }
        .pill-type--income {
          background: var(--color-income-bg);
          color: var(--color-income);
        }
        .pill-type--expense {
          background: var(--color-expense-bg);
          color: var(--color-expense);
        }
        .icon-button {
          border: none;
          background: var(--color-surface-subtle);
          border-radius: 12px;
          width: 38px;
          height: 38px;
          cursor: pointer;
          font-size: 1rem;
        }
        .icon-button-danger {
          color: var(--color-expense);
        }
        .empty-state {
          padding: 48px 32px;
          border-radius: var(--radius-card);
          background: var(--color-surface-card);
          border: 1px dashed var(--color-surface-border);
          text-align: center;
          box-shadow: var(--shadow-card);
        }
        .empty-illustration {
          font-size: 3rem;
        }
        .empty-state h3 {
          margin: 18px 0 10px;
          font-size: 1.35rem;
          color: var(--color-text-primary);
        }
        .empty-state p {
          margin: 0;
          color: var(--color-text-secondary);
          max-width: 420px;
          margin-left: auto;
          margin-right: auto;
        }
        .empty-actions {
          margin-top: 22px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .transaction-form {
          display: grid;
          gap: 16px;
        }
        .transaction-form label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }
        .field-error {
          color: var(--color-expense);
          font-size: 0.85rem;
        }
        .type-fieldset {
          border: 1px solid var(--color-surface-border);
          border-radius: 18px;
          padding: 16px;
          display: grid;
          gap: 10px;
          background: var(--color-surface-subtle);
        }
        .type-fieldset legend {
          margin-left: 12px;
          padding: 0 4px;
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .radio-option {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: var(--color-text-secondary);
        }
        .radio-option input {
          accent-color: var(--color-brand-500);
        }
        .hide-on-mobile {
          display: table-cell;
        }
        .hide-on-desktop {
          display: none;
        }
        .actions-header {
          justify-self: end;
        }
        @media (max-width: 900px) {
          .transactions-table-head,
          .transactions-row {
            grid-template-columns: 1.4fr 1.2fr 1fr 1fr;
          }
          .description-cell,
          .actions-header {
            display: none;
          }
          .hide-on-mobile {
            display: none;
          }
          .hide-on-desktop {
            display: block;
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }
        @media (max-width: 640px) {
          .transactions-table-head,
          .transactions-row {
            display: grid;
            grid-template-columns: 1fr;
            padding: 18px;
          }
          .transactions-row {
            gap: 12px;
          }
          .cell {
            width: 100%;
          }
          .type-cell,
          .amount-cell,
          .actions-cell {
            justify-content: flex-start;
          }
          .transactions-header,
          .transactions-filters {
            gap: 12px;
          }
          .transactions-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .date-filter-row,
          .sort-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
