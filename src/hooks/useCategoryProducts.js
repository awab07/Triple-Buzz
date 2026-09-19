import { useEffect, useState } from 'react'
import { fetchProducts } from '../lib/api'
import { normalizeProduct } from '../context/ProductsContext'

// Homepage strips only need a handful of products from one category, so they
// ask the backend for exactly that (`?category=`) instead of paging the whole
// catalogue into ProductsContext until something matches. The backend's
// category filter is an exact match, so multi-value categories (legacy
// 'THC Vapes' + Lightspeed 'THC VAPES') are fetched one request each. Results
// are cached per category+limit for the session so revisiting Home is free.
const cache = new Map()

function load(categories, limit) {
  const key = `${limit}:${categories.join('|')}`
  if (!cache.has(key)) {
    const request = Promise.all(
      categories.map((category) => fetchProducts({ page: 1, limit, category })),
    )
      .then((results) => ({
        products: results.flatMap((r) => (r.products ?? []).map(normalizeProduct)),
        total: results.reduce((n, r) => n + (typeof r.totalItems === 'number' ? r.totalItems : 0), 0),
      }))
      .catch((err) => {
        cache.delete(key)
        throw err
      })
    cache.set(key, request)
  }
  return cache.get(key)
}

export function useCategoryProducts(categories, limit = 6) {
  const key = categories.join('|')
  const [state, setState] = useState({ products: [], total: 0, loading: true })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true }))
    load(categories, limit)
      .then(({ products, total }) => {
        if (!cancelled) setState({ products: products.slice(0, limit), total, loading: false })
      })
      .catch(() => {
        if (!cancelled) setState({ products: [], total: 0, loading: false })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, limit])

  return state
}
