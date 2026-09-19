// Warms the first page of every Shop category ahead of time. Picking a
// category on /shop or /collections/:slug otherwise starts a fresh request
// (and only then starts downloading the product photos), so the grid sits
// empty for a beat. Here each raw backend category's first page (one Shop
// page worth of products) is fetched in the background at idle, its images
// are pulled into the browser cache, and Shop.jsx seeds its grid from the
// result while its own full-category fetch is still in flight.

import { fetchProducts } from '../lib/api'
import { normalizeProduct } from '../context/ProductsContext'
import { categoryFilterMap, shopLeafCategories } from '../data/siteData'

// Shop's default page size (its `perPage` state) — one page is all the
// preload needs to cover.
const FIRST_PAGE_LIMIT = 9
const CONCURRENCY = 3

const pending = new Map() // raw category -> Promise<product[]>
const resolved = new Map() // raw category -> product[] (once settled)

function loadFirstPage(raw) {
  if (!pending.has(raw)) {
    const promise = fetchProducts({ site: 'triplebuzz', limit: FIRST_PAGE_LIMIT, category: raw })
      .then((data) => {
        const products = (data.products || []).map(normalizeProduct)
        for (const p of products) {
          if (p.image) new Image().src = p.image
        }
        resolved.set(raw, products)
        return products
      })
      .catch((err) => {
        // Let the next call retry instead of caching the failure.
        pending.delete(raw)
        throw err
      })
    pending.set(raw, promise)
  }
  return pending.get(raw)
}

// The already-loaded first page for a set of raw categories, merged the same
// way Shop merges its full fetch (category order, de-duplicated) — or null
// unless every one of them has finished loading.
export function getPreloadedFirstPage(rawCategories) {
  if (rawCategories.length === 0 || !rawCategories.every((raw) => resolved.has(raw))) return null
  const seen = new Set()
  const merged = []
  for (const raw of rawCategories) {
    for (const p of resolved.get(raw)) {
      if (!seen.has(p.backendId)) {
        seen.add(p.backendId)
        merged.push(p)
      }
    }
  }
  return merged
}

// Hover/focus safety net for a single category link (a header label): bumps
// just that label's raw categories to the front instead of waiting for the
// idle pass to reach them.
export function preloadCategoryLabel(label) {
  for (const raw of categoryFilterMap[label] || [label]) {
    loadFirstPage(raw).catch(() => {})
  }
}

let started = false

// Call once at app boot. Runs at idle, a few requests at a time, so it never
// competes with the page the visitor actually landed on.
export function preloadCategoryFirstPages() {
  if (started || typeof window === 'undefined') return
  started = true

  const queue = [
    ...new Set(shopLeafCategories.flatMap((label) => categoryFilterMap[label] || [label])),
  ]

  const worker = async () => {
    while (queue.length > 0) {
      await loadFirstPage(queue.shift()).catch(() => {})
    }
  }

  const start = () => {
    for (let i = 0; i < CONCURRENCY; i++) worker()
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 3000 })
  else setTimeout(start, 1500)
}
