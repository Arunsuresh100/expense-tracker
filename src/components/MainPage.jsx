import React, { useState, useEffect } from "react";
import { format, parseISO, subMonths, startOfMonth } from "date-fns";
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
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Trash2, Plus } from "lucide-react";
import { storageService, CATEGORIES } from "../services/storageService";
import ConfirmModal from "./ConfirmModal";

const MainPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [hasExpenses, setHasExpenses] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    transactionId: null,
    transactionDetails: null,
  });
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "groceries",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const txs = storageService.getTransactions();
    setTransactions(txs);
    setBalance(storageService.getBalance());
    const catStats = storageService.getCategoryStats();
    setCategoryStats(catStats);
    setHasExpenses(Object.values(catStats).reduce((sum, v) => sum + v, 0) > 0);

    // Prepare chart data for last 6 months
    const monthlyStats = storageService.getMonthlyStats();
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(startOfMonth(date), "yyyy-MM");
      const stats = monthlyStats[monthKey] || { income: 0, expenses: 0 };

      months.push({
        month: format(date, "MMM"),
        income: stats.income,
        expenses: stats.expenses,
        balance: stats.income - stats.expenses,
      });
    }

    // Calculate running balance
    let runningBalance = 0;
    months.forEach((m) => {
      runningBalance += m.balance;
      m.balance = Math.max(0, runningBalance);
    });

    setChartData(months);
  };

 const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    storageService.addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    });

    loadData();
    
    // ** FIX: Keep the existing type and category when resetting the form **
    setFormData({
      ...formData, // This will retain the previous values
      amount: "", // Only clear the amount
      description: "", // And the description
      date: new Date().toISOString().split("T")[0], // Reset the date to today
    });

    setIsFormOpen(false);
  };

  const handleDeleteClick = (transaction) => {
    setConfirmModal({
      isOpen: true,
      transactionId: transaction.id,
      transactionDetails: transaction,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.transactionId) {
      storageService.deleteTransaction(confirmModal.transactionId);
      loadData();
      setConfirmModal({
        isOpen: false,
        transactionId: null,
        transactionDetails: null,
      });
    }
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      transactionId: null,
      transactionDetails: null,
    });
  };

  // Prepare category chart data
  const categoryChartData = Object.entries(categoryStats)
    .map(([categoryId, amount]) => {
      const category =
        CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
      return {
        name: category.name,
        value: amount,
        color: category.color,
      };
    })
    .sort((a, b) => b.value - a.value);

  let foodAmount = 0;
  let nonFoodAmount = 0;

  // Loop through the expense stats from storage (e.g., { groceries: 50, car: 30, food: 25 })
  for (const categoryId in categoryStats) {
    const amount = categoryStats[categoryId];

    // Find the category's classification from your master list
    const category = CATEGORIES.find((c) => c.id === categoryId);

    // If the category is marked as food, add it to the food total
    if (category && category.isFood) {
      foodAmount += amount;
    }
    // Otherwise, add it to the non-food total
    else {
      nonFoodAmount += amount;
    }
  }

  // This data is now correctly calculated and ready for the pie chart
  const receiptsData = [
    { name: "Food", value: foodAmount, color: "#10b981" },
    { name: "Non-food", value: nonFoodAmount, color: "#ef4444" },
  ];

  const COLORS = [
    "#3b82f6",
    "#1e40af",
    "#10b981",
    "#059669",
    "#f97316",
    "#fb923c",
    "#ef4444",
    "#ec4899",
    "#a855f7",
    "#7c3aed",
    "#d946ef",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Expense Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Total Balance:{" "}
              <span className="font-semibold text-lg text-gray-900 dark:text-white">
                $
                {balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            <span>{isFormOpen ? "Close Form" : "Add Transaction"}</span>
          </button>
        </div>

        {/* Add Transaction Form */}
        {isFormOpen && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: "income" })
                      }
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        formData.type === "income"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: "expense" })
                      }
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        formData.type === "expense"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description (optional)"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Total Balance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Total Balance Over Time
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Income & Expenses Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Income & Expenses
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Categories Chart - Only show if hasExpenses */}
        {hasExpenses && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Spending by Category
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

       {hasExpenses && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Expense Breakdown: Food vs Non-Food
            </h2>

            <div className="flex flex-col items-center">
              {/* Increased height to give the chart more space */}
               <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={receiptsData.filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    // Increased radius to make the pie larger
                    outerRadius={80}
                    dataKey="value"
                    // Removed labels completely
                    labelLine={false}
                    label={false}
                    // Added a white stroke for a clean separation between slices
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    {receiptsData
                      .filter((item) => item.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Custom legend designed to match your image */}
              <div className="flex justify-center space-x-6 mt-4 text-sm flex-wrap">
                {receiptsData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    {/* Color indicator is now a square, not rounded */}
                    <div
                      className="w-4 h-4"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {/* Text format "Name $Value" matches the image */}
                      {item.name} ${item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- START: Replace your existing "Transactions Table" block with this --- */}

{/* Transactions Table */}
<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
    All Transactions
  </h2>
  
  {/* The container for our responsive table */}
  <div>
    <table className="w-full">
      {/* Table Head: Hidden on mobile, visible on desktop */}
      <thead className="hidden md:table-header-group">
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount
          </th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Action
          </th>
        </tr>
      </thead>
      
      {/* Table Body */}
      <tbody>
        {transactions.length > 0 ? (
          transactions.map((transaction) => {
            const category = CATEGORIES.find((c) => c.id === transaction.category) || CATEGORIES[0];
            const isIncome = transaction.type === 'income';
            return (
              // On mobile, this `tr` becomes a card. On desktop, it's a normal row.
              <tr
                key={transaction.id}
                className="block md:table-row mb-4 md:mb-0 border-b border-gray-200 dark:border-gray-700 md:border-b"
              >
                {/* Each `td` becomes a row within the card on mobile */}
                <td 
                  data-label="Date"
                  className="block md:table-cell py-3 px-4 text-sm text-gray-900 dark:text-white md:text-left flex justify-between md:before:content-none before:content-[attr(data-label)] before:font-medium before:text-gray-700 dark:before:text-gray-300"
                >
                  <span>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</span>
                </td>
                
                <td 
                  data-label="Type"
                  className="block md:table-cell py-3 px-4 flex justify-between md:before:content-none before:content-[attr(data-label)] before:font-medium before:text-gray-700 dark:before:text-gray-300"
                >
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      isIncome
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {isIncome ? 'Income' : 'Expense'}
                  </span>
                </td>

                <td 
                  data-label="Category"
                  className="block md:table-cell py-3 px-4 flex justify-between md:before:content-none before:content-[attr(data-label)] before:font-medium before:text-gray-700 dark:before:text-gray-300"
                >
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.icon} {category.name}
                  </span>
                </td>

                <td 
                  data-label="Description"
                  className="block md:table-cell py-3 px-4 text-sm text-gray-600 dark:text-gray-400 md:text-left flex justify-between md:before:content-none before:content-[attr(data-label)] before:font-medium before:text-gray-700 dark:before:text-gray-300"
                >
                  <span>{transaction.description || '-'}</span>
                </td>

                <td 
                  data-label="Amount"
                  className="block md:table-cell py-3 px-4 text-sm font-medium md:text-left flex justify-between md:before:content-none before:content-[attr(data-label)] before:font-medium before:text-gray-700 dark:before:text-gray-300"
                >
                  <span className={`${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isIncome ? '+' : '-'}${transaction.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>

                <td 
                  data-label="Action"
                  className="block md:table-cell py-3 px-4 flex justify-between md:before:content-none before:content-[attr(data-label)] before:font-medium before:text-gray-700 dark:before:text-gray-300"
                >
                  <button
                    onClick={() => handleDeleteClick(transaction)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
              No transactions yet. Click "Add Transaction" to get started!
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
{/* --- END of replacement block --- */}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={
          confirmModal.transactionDetails
            ? `Are you sure you want to delete this ${
                confirmModal.transactionDetails.type === "income"
                  ? "income"
                  : "expense"
              } transaction of $${confirmModal.transactionDetails.amount.toLocaleString(
                "en-US",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}? This action cannot be undone.`
            : "Are you sure you want to delete this transaction? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default MainPage;
