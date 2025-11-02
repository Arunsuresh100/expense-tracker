# Expense Tracker App

A simple, user-friendly expense tracker application built with React, featuring beautiful charts, dark mode support, and local storage for data persistence.

## Features

- 📊 **Interactive Charts**: Line graphs, bar charts, and pie charts for visualizing financial data
- 🌙 **Dark Mode**: Toggle between light and dark themes (stored in localStorage) - toggle button in header
- 💾 **Local Storage**: All data is stored locally in your browser
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Simple & Clean UI**: Single-page layout that's easy to use
- ➕ **Transaction Management**: Add and delete transactions
- 📈 **Financial Insights**: 
  - Total balance tracking
  - Income vs Expenses comparison
  - Category-wise spending analysis
  - Monthly financial trends
- 🗑️ **Easy Deletion**: Remove transactions directly from the table

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Chart library
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **localStorage** - Data persistence

## Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
expense-tracker/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Header with dark mode toggle
│   │   ├── Footer.jsx          # Footer component
│   │   └── MainPage.jsx        # Single page with form, charts, and table
│   ├── context/
│   │   └── ThemeContext.jsx     # Dark mode context provider
│   ├── services/
│   │   └── storageService.js   # localStorage operations
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

### Adding a Transaction

1. Click the "Add Transaction" button at the top of the page
2. The form will expand - fill in the details:
   - Select transaction type (Income or Expense)
   - Enter the amount (required)
   - Choose a category
   - Add a description (optional)
   - Select the date (required)
3. Click "Add Transaction" to save

### Viewing Statistics

The page automatically displays:
- Total balance at the top
- Total balance over time (area chart)
- Income vs Expenses comparison (bar chart)
- Spending by category (pie chart)
- Food vs Non-food expenses (donut chart)
- All transactions in a table below

### Managing Transactions

- **Delete**: Click the trash icon next to any transaction to remove it
- All charts and statistics update automatically when you add or delete transactions

### Dark Mode

Toggle dark mode using the moon/sun icon in the top-right corner of the header. Your preference is saved automatically.

## Data Storage

All transactions are stored in the browser's localStorage under the key `expenseTracker_data`. The app includes sample data that loads on first visit if no data exists.

## Customization

### Adding Categories

Edit `src/services/storageService.js` to add or modify categories:

```javascript
export const CATEGORIES = [
  { id: 'new-category', name: 'New Category', color: '#hexcode', icon: '🎯' },
  // ... existing categories
]
```

### Styling

The app uses Tailwind CSS. Customize colors in `tailwind.config.js` or modify component styles directly.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for educational purposes.

---

Built with ❤️ using React and modern web technologies.
