import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Library, Sun, Moon } from 'lucide-react'
import { useDarkMode } from '../contexts/DarkModeContext'

export function Sidebar() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Prompt Storage</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>
        <NavLink
          to="/prompts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <Library className="w-5 h-5" />
          Prompts
        </NavLink>
      </nav>
    </div>
  )
}