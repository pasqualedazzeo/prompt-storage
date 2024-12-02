import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { PromptList } from './components/PromptList'
import { DarkModeProvider } from './contexts/DarkModeContext'
import './index.css'

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
          <Sidebar />
          <main className="flex-1">
            <div className="max-w-6xl mx-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/prompts" element={<PromptList />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </DarkModeProvider>
  )
}

export default App