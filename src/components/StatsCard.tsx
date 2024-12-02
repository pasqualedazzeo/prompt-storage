import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: {
    light: 'bg-blue-50 text-blue-700',
    dark: 'dark:bg-blue-900/50 dark:text-blue-400'
  },
  green: {
    light: 'bg-green-50 text-green-700',
    dark: 'dark:bg-green-900/50 dark:text-green-400'
  },
  purple: {
    light: 'bg-purple-50 text-purple-700',
    dark: 'dark:bg-purple-900/50 dark:text-purple-400'
  },
  orange: {
    light: 'bg-orange-50 text-orange-700',
    dark: 'dark:bg-orange-900/50 dark:text-orange-400'
  }
}

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color].light} ${colorClasses[color].dark}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}