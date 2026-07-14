import { useCallback, useEffect, useState } from 'react'
import { getHomePageData } from '../../../shared/models/apiService'
import type { HomePageData } from '../../../shared/models/types'

export function useHomeViewModel() {
  const [data, setData] = useState<HomePageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getHomePageData()
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load page data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return {
    data,
    isLoading,
    error,
    actions: {
      refresh: loadData,
    },
  }
}
