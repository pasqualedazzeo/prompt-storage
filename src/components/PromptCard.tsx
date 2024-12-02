import { Pencil, Trash2 } from 'lucide-react'
import { Prompt } from '../types'

interface PromptCardProps {
  prompt: Prompt
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">{prompt.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(prompt)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-3">{prompt.content}</p>
      <div className="flex items-center gap-3">
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
          {prompt.category}
        </span>
        {prompt.tags.map(tag => (
          <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}