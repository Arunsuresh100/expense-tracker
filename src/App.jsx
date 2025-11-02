import React, { useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import Footer from './components/Footer'
import MainPage from './components/MainPage'
import { storageService } from './services/storageService'

function App() {
  useEffect(() => {
    // Initialize sample data if no data exists
    storageService.initSampleData()
  }, [])

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Header />
        
        <main className="flex-1 pt-16">
          <MainPage />
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
