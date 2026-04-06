// src/utils/exportUtils.js
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(transactions, filename = 'transactions') {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (₹)']

  const rows = transactions.map(tx => [
    tx.date,
    `"${tx.description.replace(/"/g, '""')}"`,  // escape quotes
    tx.category,
    tx.type,
    tx.amount,
  ])

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  triggerDownload(csv, `${filename}_${Date.now()}.csv`, 'text/csv;charset=utf-8;')
}

export function exportToJSON(transactions, filename = 'transactions') {
  const json = JSON.stringify(transactions, null, 2)
  triggerDownload(json, `${filename}_${Date.now()}.json`, 'application/json')
}