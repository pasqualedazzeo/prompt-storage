export interface Prompt {
  id: string
  title: string
  content: string
  created_at: string // Changed from createdAt to match Supabase's format
  tags: string[]
  category: string
}

export interface DashboardStats {
  totalPrompts: number
  categoryCounts: Record<string, number>
  tagCounts: Record<string, number>
}