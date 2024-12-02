import { useState } from 'react'
import { AlertCircle, Check, X } from 'lucide-react'
import { promptsService } from '../lib/supabase'
import { logger } from '../lib/logger'
import type { Prompt } from '../types'

interface MigrationDialogProps {
  onClose: () => void
  onComplete: () => void
}

export function MigrationDialog({ onClose, onComplete }: MigrationDialogProps) {
  const [status, setStatus] = useState<'pending' | 'migrating' | 'success' | 'error'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const startMigration = async () => {
    try {
      setStatus('migrating')
      
      // Get prompts from localStorage
      const storedPrompts = localStorage.getItem('prompts')
      if (!storedPrompts) {
        setStatus('success')
        onComplete()
        return
      }

      const prompts: Prompt[] = JSON.parse(storedPrompts)
      setProgress({ current: 0, total: prompts.length })

      // Migrate each prompt
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i]
        await promptsService.create({
          title: prompt.title,
          content: prompt.content,
          category: prompt.category || 'General', // Default category if none exists
          tags: prompt.tags || [], // Default empty tags if none exist
        })
        setProgress(prev => ({ ...prev, current: i + 1 }))
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('prompts')
      
      setStatus('success')
      setTimeout(() => {
        onComplete()
      }, 1500)
    } catch (err) {
      logger.error('Migration failed', err)
      setError('Failed to migrate prompts. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Data Migration
          </h2>
          {status === 'pending' && (
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {status === 'pending' && (
            <>
              <p className="text-gray-600 dark:text-gray-300">
                We'll migrate your existing prompts to the new storage system. This process is automatic and secure.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={startMigration}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Start Migration
                </button>
              </div>
            </>
          )}

          {status === 'migrating' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Migrating your prompts... Please don't close this window.
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {progress.current} of {progress.total} prompts migrated
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Migration completed successfully!
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={startMigration}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}