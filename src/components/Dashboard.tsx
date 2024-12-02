import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, FileText, Tag, Folder } from 'lucide-react'
import { DashboardStats } from '../types'
import { StatsCard } from './StatsCard'
import { promptsService } from '../lib/supabase'

export function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalPrompts: 0,
    categoryCounts: {},
    tagCounts: {},
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const prompts = await promptsService.getAll()
      
      const categoryCounts: Record<string, number> = {}
      const tagCounts: Record<string, number> = {}
      
      prompts.forEach(prompt => {
        // Count categories
        categoryCounts[prompt.category] = (categoryCounts[prompt.category] || 0) + 1
        
        // Count tags
        prompt.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      setStats({
        totalPrompts: prompts.length,
        categoryCounts,
        tagCounts,
      })
      setError(null)
    } catch (err) {
      setError('Failed to load statistics')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToCategory = (category: string) => {
    const searchParams = new URLSearchParams()
    searchParams.set('category', category)
    searchParams.set('showFilters', 'true')
    navigate(`/prompts?${searchParams.toString()}`)
  }

  const navigateToTag = (tag: string) => {
    const searchParams = new URLSearchParams()
    searchParams.set('tag', tag)
    searchParams.set('showFilters', 'true')
    navigate(`/prompts?${searchParams.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Prompts"
          value={stats.totalPrompts}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Categories"
          value={Object.keys(stats.categoryCounts).length}
          icon={Folder}
          color="green"
        />
        <StatsCard
          title="Unique Tags"
          value={Object.keys(stats.tagCounts).length}
          icon={Tag}
          color="purple"
        />
        <StatsCard
          title="Avg. Tags/Prompt"
          value={stats.totalPrompts ? (
            Object.values(stats.tagCounts).reduce((a, b) => a + b, 0) / stats.totalPrompts
          ).toFixed(1) : '0'}
          icon={BarChart3}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Popular Categories</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <button
                  key={category}
                  onClick={() => navigateToCategory(category)}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-600 dark:text-gray-300">{category}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                </button>
              ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Popular Tags</h3>
          <div className="space-y-3">
            {Object.entries(stats.tagCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => navigateToTag(tag)}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-600 dark:text-gray-300">{tag}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}