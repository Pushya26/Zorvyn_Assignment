import { useMemo } from 'react'
import { parseISO, format, endOfMonth, differenceInDays } from 'date-fns'

function groupByMonth(transactions) {
  return transactions.reduce((result, tx) => {
    const date = parseISO(tx.date)
    const key = format(date, 'yyyy-MM')
    if (!result[key]) {
      result[key] = { income: 0, expense: 0, formatted: format(date, 'MMM yyyy') }
    }
    if (tx.type === 'income') result[key].income += tx.amount
    if (tx.type === 'expense') result[key].expense += tx.amount
    return result
  }, {})
}

function groupExpensesByCategory(transactions) {
  return transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((result, tx) => {
      result[tx.category] = (result[tx.category] || 0) + tx.amount
      return result
    }, {})
}

export function useInsights(transactions) {
  return useMemo(() => {
    const expenses = transactions.filter((tx) => tx.type === 'expense')
    const incomes = transactions.filter((tx) => tx.type === 'income')
    const totalIncome = incomes.reduce((sum, tx) => sum + tx.amount, 0)
    const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0)
    const ratio = totalIncome ? (totalExpense / totalIncome) * 100 : 0
    const highestCategory = Object.entries(groupExpensesByCategory(transactions)).sort((a, b) => b[1] - a[1])[0]

    const monthlyTotals = groupByMonth(transactions)
    const months = Object.keys(monthlyTotals).sort()
    const currentMonthKey = months[months.length - 1]
    const previousMonthKey = months[months.length - 2]
    const currentMonth = monthlyTotals[currentMonthKey] || { income: 0, expense: 0, formatted: '' }
    const previousMonth = monthlyTotals[previousMonthKey] || { income: 0, expense: 0, formatted: '' }

    const currentMonthDate = currentMonthKey ? parseISO(`${currentMonthKey}-01`) : new Date()
    const daysInCurrentMonth = currentMonthKey ? differenceInDays(endOfMonth(currentMonthDate), currentMonthDate) + 1 : 0
    const averageDailySpend = daysInCurrentMonth ? currentMonth.expense / daysInCurrentMonth : 0

    const expenseChange = previousMonth.expense
      ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense) * 100
      : 0

    const categoryComparison = Object.keys(groupExpensesByCategory(transactions)).map((category) => {
      const currentValue = expenses
        .filter((tx) => tx.category === category && format(parseISO(tx.date), 'yyyy-MM') === currentMonthKey)
        .reduce((sum, tx) => sum + tx.amount, 0)
      const previousValue = expenses
        .filter((tx) => tx.category === category && format(parseISO(tx.date), 'yyyy-MM') === previousMonthKey)
        .reduce((sum, tx) => sum + tx.amount, 0)
      return { category, currentValue, previousValue }
    })

    const sortedComparison = categoryComparison.sort((a, b) => b.currentValue - a.currentValue).slice(0, 5)

    return {
      totalIncome,
      totalExpense,
      incomeExpenseRatio: ratio,
      highestSpendingCategory: highestCategory ? { category: highestCategory[0], amount: highestCategory[1] } : null,
      currentMonth: currentMonth.formatted || '',
      previousMonth: previousMonth.formatted || '',
      currentMonthExpense: currentMonth.expense,
      previousMonthExpense: previousMonth.expense,
      expenseChange,
      averageDailySpend,
      topExpense: expenses.reduce((best, tx) => (tx.amount > best.amount ? tx : best), { amount: 0 }),
      categoryComparison: sortedComparison,
    }
  }, [transactions])
}
