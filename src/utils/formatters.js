// src/utils/formatters.js

// Format a number as Indian Rupee currency
export function formatCurrency(amount, options = {}) {
  const { compact = false, showSign = false } = options

  if (compact && Math.abs(amount) >= 100000) {
    const lakhs = amount / 100000
    return `₹${lakhs.toFixed(1)}L`
  }

  if (compact && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000
    return `₹${thousands.toFixed(1)}K`
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))

  if (showSign && amount > 0) return `+${formatted}`
  if (showSign && amount < 0) return `−${formatted}`
  return formatted
}

// Format a YYYY-MM-DD date string to a readable label
export function formatDate(dateStr, style = 'medium') {
  const date = new Date(dateStr + 'T00:00:00')

  if (style === 'short') {
    // "03 Mar"
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }
  if (style === 'long') {
    // "3 March 2025"
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  // medium — "03 Mar 2025"
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Format a YYYY-MM string to "March 2025"
export function formatMonthFull(yyyyMM) {
  const [year, month] = yyyyMM.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// Returns a percentage string like "42.3%"
export function formatPercent(value, decimals = 1) {
  return `${Math.abs(value).toFixed(decimals)}%`
}

// Clamp a value between min and max
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}