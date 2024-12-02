import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Filter, X } from 'lucide-react'
import { Prompt } from '../types'
import { PromptCard } from './PromptCard'
import { PromptForm } from './PromptForm'
import { MigrationDialog } from './MigrationDialog'
import { promptsService } from '../lib/supabase'
import { logger } from '../lib/logger'

export function PromptList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>()
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.has('tag') ? [searchParams.get('tag')!] : []
  )
  const [isFilterOpen, setIsFilterOpen] = useState(searchParams.get('showFilters') === 'true')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMigration, setShowMigration] = useState(false)

  const categories = Array.from(new Set(prompts.map(p => p.category)))
  const allTags = Array.from(new Set(prompts.flatMap(p => p.tags)))

  // Get available tags for the selected category
  const availableTags = selectedCategory
    ? Array.from(new Set(prompts
        .filter(p => !selectedCategory || p.category === selectedCategory)
        .flatMap(p => p.tags)))
    : allTags

  useEffect(() => {
    checkForMigration()
  }, [])

  useEffect(() => {
    // Update URL parameters when filters change
    const params = new URLSearchParams(searchParams)
    
    if (selectedCategory) {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }

    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','))
    } else {
      params.delete('tags')
    }

    if (isFilterOpen) {
      params.set('showFilters', 'true')
    } else {
      params.delete('showFilters')
    }

    setSearchParams(params)
  }, [selectedCategory, selectedTags, isFilterOpen])

  useEffect(() => {
    // Update filters from URL parameters
    const categoryParam = searchParams.get('category')
    const tagParam = searchParams.get('tag')
    const showFiltersParam = searchParams.get('showFilters')

    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
    if (tagParam && !selectedTags.includes(tagParam)) {
      setSelectedTags([tagParam])
    }
    if (showFiltersParam === 'true') {
      setIsFilterOpen(true)
    }
  }, [searchParams])

  const checkForMigration = () => {
    const storedPrompts = localStorage.getItem('prompts')
    if (storedPrompts) {
      setShowMigration(true)
    } else {
      loadPrompts()
    }
  }

  const loadPrompts = async () => {
    try {
      setIsLoading(true)
      const data = await promptsService.getAll()
      setPrompts(data)
      setError(null)
    } catch (err) {
      const errorMessage = 'Failed to load prompts'
      logger.error(errorMessage, err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async ({ title, content, category, tags }: Omit<Prompt, 'id' | 'created_at'>) => {
    try {
      const newPrompt = await promptsService.create({ title, content, category, tags })
      setPrompts(prev => [newPrompt, ...prev])
      setIsFormOpen(false)
    } catch (err) {
      const errorMessage = 'Failed to create prompt'
      logger.error(errorMessage, err)
      alert(errorMessage)
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setIsFormOpen(true)
  }

  const handleUpdate = async ({ title, content, category, tags }: Omit<Prompt, 'id' | 'created_at'>) => {
    if (!editingPrompt) return
    
    try {
      const updatedPrompt = await promptsService.update(editingPrompt.id, {
        title,
        content,
        category,
        tags
      })
      
      setPrompts(prev =>
        prev.map(p => p.id === editingPrompt.id ? updatedPrompt : p)
      )
      setIsFormOpen(false)
      setEditingPrompt(undefined)
    } catch (err) {
      const errorMessage = 'Failed to update prompt'
      logger.error(errorMessage, err)
      alert(errorMessage)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await promptsService.delete(id)
      setPrompts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      const errorMessage = 'Failed to delete prompt'
      logger.error(errorMessage, err)
      alert(errorMessage)
    }
  }

  const handleMigrationComplete = () => {
    setShowMigration(false)
    loadPrompts()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Clear tags when changing category
    setSelectedTags([])
  }

  const handleTagsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value)
    setSelectedTags(selectedOptions)
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  const filteredPrompts = prompts.filter(prompt => {
    const categoryMatch = !selectedCategory || prompt.category === selectedCategory
    const tagsMatch = selectedTags.length === 0 || selectedTags.every(tag => prompt.tags.includes(tag))
    return categoryMatch && tagsMatch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading prompts...</div>
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
      {showMigration && (
        <MigrationDialog
          onClose={() => setShowMigration(false)}
          onComplete={handleMigrationComplete}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prompts</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => {
              setEditingPrompt(undefined)
              setIsFormOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Prompt
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear tags
                  </button>
                )}
              </div>
              <select
                multiple
                value={selectedTags}
                onChange={handleTagsChange}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-700 dark:text-white"
                size={4}
              >
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Hold Ctrl (Cmd on Mac) to select multiple tags
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPrompts.map(prompt => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {selectedCategory || selectedTags.length > 0
              ? "No prompts found with the selected filters"
              : "No prompts found. Create your first one!"}
          </p>
        </div>
      )}

      {isFormOpen && (
        <PromptForm
          prompt={editingPrompt}
          onSubmit={editingPrompt ? handleUpdate : handleCreate}
          onClose={() => {
            setIsFormOpen(false)
            setEditingPrompt(undefined)
          }}
        />
      )}
    </div>
  )
}