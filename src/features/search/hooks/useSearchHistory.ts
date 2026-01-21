import { useState, useEffect, useCallback } from 'react'
import type { FlightSearchParams } from '@/shared/types/api.types'

export interface SearchHistoryItem extends FlightSearchParams {
  id: string
  timestamp: number
}

const STORAGE_KEY = 'spotter_search_history'
const MAX_HISTORY_ITEMS = 5

function loadHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function saveHistory(history: SearchHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // localStorage might be full or disabled
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const addSearch = useCallback((params: FlightSearchParams) => {
    setHistory((prev) => {
      // Check if this search already exists (same origin, destination, date)
      const existingIndex = prev.findIndex(
        (item) =>
          item.origin === params.origin &&
          item.destination === params.destination &&
          item.departureDate === params.departureDate
      )

      let newHistory: SearchHistoryItem[]

      if (existingIndex >= 0) {
        // Move existing item to front with updated timestamp
        const existing = prev[existingIndex]
        newHistory = [
          { ...existing, ...params, timestamp: Date.now() },
          ...prev.slice(0, existingIndex),
          ...prev.slice(existingIndex + 1),
        ]
      } else {
        // Add new item at front
        const newItem: SearchHistoryItem = {
          ...params,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        }
        newHistory = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS)
      }

      saveHistory(newHistory)
      return newHistory
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.id !== id)
      saveHistory(newHistory)
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    history,
    addSearch,
    removeItem,
    clearHistory,
  }
}
