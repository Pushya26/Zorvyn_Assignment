import { mockTransactions } from '../data/mockData'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchTransactions() {
  await delay(500)
  return [...mockTransactions]
}

export async function saveTransaction(transaction) {
  await delay(300)
  return { ...transaction }
}

export async function updateTransaction(transaction) {
  await delay(300)
  return { ...transaction }
}

export async function deleteTransaction(transactionId) {
  await delay(250)
  return transactionId
}
