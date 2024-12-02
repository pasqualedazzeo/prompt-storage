import { createClient } from '@supabase/supabase-js'
import type { Prompt } from '../types'
import { logger } from './logger'

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log Supabase configuration status
if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase configuration', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseKey ? 'Present' : 'Missing'
  })
  throw new Error('Supabase configuration is missing. Please check your .env.local file.')
}

logger.info('Initializing Supabase client', { url: supabaseUrl })

export const supabase = createClient(supabaseUrl, supabaseKey)

export const promptsService = {
  async getAll(): Promise<Prompt[]> {
    try {
      logger.info('Fetching all prompts')
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Failed to fetch prompts', error)
        throw error
      }

      if (!data) {
        return []
      }

      logger.info(`Successfully fetched ${data.length} prompts`)
      return data as Prompt[]
    } catch (error) {
      logger.error('Unexpected error in getAll', error)
      throw error
    }
  },

  async create(prompt: Omit<Prompt, 'id' | 'created_at'>): Promise<Prompt> {
    try {
      logger.info('Creating new prompt', { title: prompt.title })
      const { data, error } = await supabase
        .from('prompts')
        .insert([{
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
        }])
        .select()
        .single()

      if (error) {
        logger.error('Failed to create prompt', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned after creating prompt')
      }

      logger.info('Successfully created prompt', { id: data.id })
      return data as Prompt
    } catch (error) {
      logger.error('Unexpected error in create', error)
      throw error
    }
  },

  async update(id: string, prompt: Omit<Prompt, 'id' | 'created_at'>): Promise<Prompt> {
    try {
      logger.info('Updating prompt', { id, title: prompt.title })
      const { data, error } = await supabase
        .from('prompts')
        .update({
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('Failed to update prompt', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned after updating prompt')
      }

      logger.info('Successfully updated prompt', { id })
      return data as Prompt
    } catch (error) {
      logger.error('Unexpected error in update', error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting prompt', { id })
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('Failed to delete prompt', error)
        throw error
      }

      logger.info('Successfully deleted prompt', { id })
    } catch (error) {
      logger.error('Unexpected error in delete', error)
      throw error
    }
  }
}