import { useEffect, useState } from 'react'
import { fetchCategorySummary } from '../lib/api'

// Whole-catalogue category list (name, real product count, a photo) from the
// backend. ProductsContext only ever holds the newest page or two of
// products, so anything it derives — counts, or a category's first photo —
// reflects that sliver, not the store. Cached for the session; resolves to
// null if the backend doesn't have the endpoint yet or the call fails, so
// callers can fall back to the context-derived list.
let cached = null

export function useCategorySummary() {
  const [categories, setCategories] = useState(cached)
  const [loading, setLoading] = useState(cached === null)

  useEffect(() => {
    if (cached !== null) return undefined
    let cancelled = false
    fetchCategorySummary()
      .then((data) => {
        if (!Array.isArray(data.categories)) throw new Error('unexpected response')
        cached = data.categories
        if (!cancelled) setCategories(cached)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading }
}
