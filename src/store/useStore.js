import { create } from 'zustand'
import { mockTransactions } from '../data/mockData'
import { saveTransaction as saveTransactionApi, updateTransaction as updateTransactionApi, deleteTransaction as deleteTransactionApi } from '../api/mockApi'

// ── Initialize dark mode before React renders ──────────────
const savedDark = JSON.parse(localStorage.getItem('finflow_dark') ?? 'false')
if (savedDark) document.documentElement.classList.add('dark')

// ── Initialize role ────────────────────────────────────────
const savedRole = localStorage.getItem('finflow_role') ?? 'viewer'

// ── Initialize transactions ────────────────────────────────
const savedTx = localStorage.getItem('finflow_transactions')
const initialTransactions = savedTx ? JSON.parse(savedTx) : mockTransactions

// ── Store ──────────────────────────────────────────────────
const useStore = create((set, get) => ({
  // ── Data ──
  transactions: initialTransactions,

  // ── Filters ──
  filters: {
    search: '',
    category: 'all',
    type: 'all',         // 'all' | 'income' | 'expense'
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',      // 'date' | 'amount' | 'category'
    sortDir: 'desc',     // 'asc' | 'desc'
  },

  // ── Role ──
  role: savedRole,

  // ── UI ──
  darkMode: savedDark,

  // ── Actions: Role ──────────────────────────────────────
  setRole: (role) => {
    localStorage.setItem('finflow_role', role)
    set({ role })
  },

  // ── Actions: Dark Mode ─────────────────────────────────
  setDarkMode: (enabled) => {
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('finflow_dark', JSON.stringify(enabled))
    set({ darkMode: enabled })
  },

  // ── Actions: Transactions ──────────────────────────────
  addTransaction: async (tx) => {
    await saveTransactionApi(tx)
    const updated = [tx, ...get().transactions]
    localStorage.setItem('finflow_transactions', JSON.stringify(updated))
    set({ transactions: updated })
  },

  editTransaction: async (id, updates) => {
    await updateTransactionApi({ id, ...updates })
    const updated = get().transactions.map((tx) =>
      tx.id === id ? { ...tx, ...updates } : tx
    )
    localStorage.setItem('finflow_transactions', JSON.stringify(updated))
    set({ transactions: updated })
  },

  deleteTransaction: async (id) => {
    await deleteTransactionApi(id)
    const updated = get().transactions.filter((tx) => tx.id !== id)
    localStorage.setItem('finflow_transactions', JSON.stringify(updated))
    set({ transactions: updated })
  },

  resetTransactions: () => {
    localStorage.setItem('finflow_transactions', JSON.stringify(mockTransactions))
    set({ transactions: mockTransactions })
  },

  // ── Actions: Filters ───────────────────────────────────
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }))
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        category: 'all',
        type: 'all',
        dateFrom: '',
        dateTo: '',
        sortBy: 'date',
        sortDir: 'desc',
      },
    })
  },

  // ── Derived: Filtered + sorted transactions ────────────
  getFilteredTransactions: () => {
    const { transactions, filters } = get()
    const { search, category, type, dateFrom, dateTo, sortBy, sortDir } = filters

    let result = [...transactions]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      )
    }

    if (category !== 'all') {
      result = result.filter((tx) => tx.category === category)
    }

    if (type !== 'all') {
      result = result.filter((tx) => tx.type === type)
    }

    if (dateFrom) {
      result = result.filter((tx) => tx.date.slice(5) >= dateFrom)
    }

    if (dateTo) {
      result = result.filter((tx) => tx.date.slice(5) <= dateTo)
    }

    result.sort((a, b) => {
      let valA, valB
      if (sortBy === 'date')     { valA = a.date;     valB = b.date }
      if (sortBy === 'amount')   { valA = a.amount;   valB = b.amount }
      if (sortBy === 'category') { valA = a.category; valB = b.category }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  },
}))

export default useStore