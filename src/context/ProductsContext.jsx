import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchProducts } from '../lib/api'

const ProductsContext = createContext(null)

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Shared shape used everywhere in the app (ProductCard, Cart, Wishlist,
// ProductDetail) — `backendId` is the real MongoDB _id, `slug` is derived
// client-side from the name so /shop/:slug URLs keep working without the
// backend needing a slug field of its own.
export function normalizeProduct(p) {
  return {
    backendId: p._id,
    slug: slugify(p.name),
    name: p.name,
    brand: p.brand || null,
    meta: null,
    description: p.description || '',
    price: String(p.price),
    image: p.image?.[0]?.url,
    images: p.image?.map((i) => i.url) ?? [],
    category: p.category,
    soldOut: (p.stock ?? 0) <= 0,
    stock: p.stock,
    sold: p.sold,
    reviewCount: p.reviewCount,
    rating: p.rating,
  }
}

const PAGE_SIZE = 100

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  // Refs, not state: several components can call loadMore() in the same
  // render, and a state-backed `page`/`loadingMore` is stale for all of them —
  // they'd each fetch the same next page and append it twice.
  const pageRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const [totalCount, setTotalCount] = useState(Infinity)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  // Products with a photo come first (`imagesFirst`) — many POS-synced items
  // have none yet, and plain newest-first buries the presentable ones.
  //
  // The catalogue (2,000+ items once Lightspeed is synced in) is too big to
  // load in one shot, so this only ever fetches one backend page up front.
  // Everything else (Shop's pagination, ProductDetail's slug lookup) pulls
  // more pages on demand via loadMore() as it needs them.
  useEffect(() => {
    let cancelled = false
    fetchProducts({ page: 1, site: 'triplebuzz', limit: PAGE_SIZE, imagesFirst: true })
      .then((data) => {
        if (cancelled) return
        setProducts((data.products ?? []).map(normalizeProduct))
        pageRef.current = 1
        setTotalCount(typeof data.totalItems === 'number' ? data.totalItems : Infinity)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load products.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const hasMore = products.length < totalCount

  const loadMore = () => {
    if (loading || loadingMoreRef.current || !hasMore) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    const nextPage = pageRef.current + 1
    fetchProducts({ page: nextPage, site: 'triplebuzz', limit: PAGE_SIZE, imagesFirst: true })
      .then((data) => {
        setProducts((prev) => {
          const seen = new Set(prev.map((p) => p.backendId))
          const fresh = (data.products ?? []).map(normalizeProduct).filter((p) => !seen.has(p.backendId))
          return [...prev, ...fresh]
        })
        pageRef.current = nextPage
        if (typeof data.totalItems === 'number') setTotalCount(data.totalItems)
      })
      .catch((err) => setError(err.message || 'Could not load more products.'))
      .finally(() => {
        loadingMoreRef.current = false
        setLoadingMore(false)
      })
  }

  const categories = useMemo(() => {
    const byName = new Map()
    for (const p of products) {
      if (!byName.has(p.category)) {
        byName.set(p.category, { name: p.category, count: 0, image: p.image })
      }
      const entry = byName.get(p.category)
      entry.count += 1
      // The first product in a category often has no photo (Lightspeed items
      // without an upload) — use the first one that does.
      if (!entry.image && p.image) entry.image = p.image
    }
    return Array.from(byName.values())
  }, [products])

  const value = {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    totalCount,
    categories,
    categoryNames: categories.map((c) => c.name),
    findBySlug: (slug) => products.find((p) => p.slug === slug),
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}
