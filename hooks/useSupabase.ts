import { useEffect, useState } from 'react'
import { supabase, type Game } from '@/lib/supabase'
import { usePrivy } from '@privy-io/react-auth'

export function useSupabase() {
  const { authenticated, user, getAccessToken } = usePrivy()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get all games
  const getGames = async (): Promise<Game[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Get user's games
  const getUserGames = async (): Promise<Game[]> => {
    if (!authenticated || !user) return []
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Get game by slug
  const getGameBySlug = async (slug: string): Promise<Game | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create game (requires authentication)
  const createGame = async (gameData: {
    name: string
    slug: string
    description?: string
    author?: string
    code: string
  }): Promise<Game | null> => {
    if (!authenticated || !user) {
      setError('Authentication required')
      return null
    }

    setLoading(true)
    setError(null)
    
    try {
      // Get Privy access token for API call
      const accessToken = await getAccessToken()
      
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(gameData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create game')
      }
      
      const game = await response.json()
      return game
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update game (requires authentication and ownership)
  const updateGame = async (slug: string, gameData: {
    name?: string
    description?: string
    author?: string
    code?: string
  }): Promise<Game | null> => {
    if (!authenticated || !user) {
      setError('Authentication required')
      return null
    }

    setLoading(true)
    setError(null)
    
    try {
      // Get Privy access token for API call
      const accessToken = await getAccessToken()
      
      const response = await fetch(`/api/games/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(gameData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update game')
      }
      
      const game = await response.json()
      return game
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time changes (optional)
  const subscribeToGames = (callback: (games: Game[]) => void) => {
    const subscription = supabase
      .channel('games')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' },
        () => {
          // Refetch games when changes occur
          getGames().then(callback)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  return {
    loading,
    error,
    getGames,
    getUserGames,
    getGameBySlug,
    createGame,
    updateGame,
    subscribeToGames,
    clearError: () => setError(null)
  }
}
