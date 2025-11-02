const STORAGE_KEY = 'expenseTracker_data'

// Default categories with colors
export const CATEGORIES = [
  // Classify each category as food or non-food for chart calculations
  { id: 'groceries', name: 'Groceries', color: '#3b82f6', icon: '🛒', isFood: true },
  { id: 'food', name: 'Food', color: '#10b981', icon: '🍔', isFood: true }, // For restaurants, takeout etc.

  // All other expenses are non-food
  { id: 'utilities', name: 'Utilities', color: '#1e40af', icon: '💡', isFood: false },
  { id: 'car', name: 'Car', color: '#10b981', icon: '🚗', isFood: false },
  { id: 'savings', name: 'Savings', color: '#059669', icon: '💰', isFood: false },
  { id: 'education', name: 'Education', color: '#84cc16', icon: '📚', isFood: false },
  { id: 'withdraw', name: 'Withdraw', color: '#f97316', icon: '🏧', isFood: false },
  { id: 'transfer', name: 'Transfer', color: '#fb923c', icon: '↔️', isFood: false },
  { id: 'pharmacy', name: 'Pharmacy', color: '#ef4444', icon: '💊', isFood: false },
  { id: 'entertainment', name: 'Entertainment', color: '#ec4899', icon: '🎬', isFood: false },
  { id: 'miscellaneous', name: 'Miscellaneous', color: '#a855f7', icon: '📦', isFood: false },
  { id: 'transport', name: 'Transport', color: '#7c3aed', icon: '🚌', isFood: false },
  { id: 'beauty', name: 'Beauty', color: '#d946ef', icon: '💅', isFood: false },
  { id: 'non-food', name: 'Non-food', color: '#ef4444', icon: '📦', isFood: false },
  
  // Salary is income, so it is not a food expense
  { id: 'salary', name: 'Salary', color: '#3b82f6', icon: '💼', isFood: false }, 
];

export const storageService = {
  // Get all transactions
  getTransactions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data).transactions || [] : []
    } catch (error) {
      console.error('Error reading transactions:', error)
      return []
    }
  },

  // Add a transaction
  addTransaction: (transaction) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      const parsed = data ? JSON.parse(data) : { transactions: [] }
      const newTransaction = {
        id: Date.now().toString(),
        ...transaction,
        date: transaction.date || new Date().toISOString(),
      }
      parsed.transactions.unshift(newTransaction)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return newTransaction
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  },

  // Delete a transaction
  deleteTransaction: (id) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      const parsed = data ? JSON.parse(data) : { transactions: [] }
      parsed.transactions = parsed.transactions.filter((t) => t.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  },

  // Update a transaction
  updateTransaction: (id, updates) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      const parsed = data ? JSON.parse(data) : { transactions: [] }
      const index = parsed.transactions.findIndex((t) => t.id === id)
      if (index !== -1) {
        parsed.transactions[index] = { ...parsed.transactions[index], ...updates }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        return parsed.transactions[index]
      }
      return null
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  },

  // Get balance
  getBalance: () => {
    const transactions = storageService.getTransactions()
    return transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount)
    }, 0)
  },

  // Get income and expenses by month
  getMonthlyStats: () => {
    const transactions = storageService.getTransactions()
    const monthly = {}

    transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthly[monthKey]) {
        monthly[monthKey] = { income: 0, expenses: 0 }
      }

      if (t.type === 'income') {
        monthly[monthKey].income += t.amount
      } else {
        monthly[monthKey].expenses += t.amount
      }
    })

    return monthly
  },

  // Get spending by category
  getCategoryStats: () => {
    const transactions = storageService.getTransactions()
    const categoryStats = {}

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const category = t.category || 'miscellaneous'
        if (!categoryStats[category]) {
          categoryStats[category] = 0
        }
        categoryStats[category] += t.amount
      })

    return categoryStats
  },
}
