import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ChevronDownIcon } from '../components/Icons'
import ProductCard from '../components/ProductCard'
import AreasServed from '../components/AreasServed'
import { useProducts, normalizeProduct } from '../context/ProductsContext'
import { fetchProducts } from '../lib/api'
import { useCategorySummary } from '../hooks/useCategorySummary'
import { getPreloadedFirstPage } from '../utils/preloadCategories'
import {
  categoryPageCopy,
  defaultShopPageCopy,
  resolveCategoryLabel,
  categoryFilterMap,
  shopLeafCategories,
  slugToCategoryLabel,
  categorySlugs,
} from '../data/siteData'

// Any single real category currently tops out at a few hundred items (the
// largest, Disposable Vapes, is ~380), so one request per raw category value
// at this limit reliably gets everything in one shot — no per-category
// pagination needed.
const CATEGORY_FETCH_LIMIT = 500

const RATINGS = [5, 4, 3, 2, 1]
const PAGE_WINDOW_SIZE = 4

// Every raw backend category value the curated checkbox labels already cover.
// Any category the backend reports that isn't in here (a brand-new one from
// the POS, say) gets its own checkbox automatically — see `extraCategories`.
const COVERED_RAW_CATEGORIES = new Set(
  shopLeafCategories.flatMap((label) => categoryFilterMap[label] || [label])
)

// Raw POS values are ALL CAPS ("SNACKS"); short ones are acronyms ("THC") so
// leave those alone and title-case the rest.
function displayCategoryName(raw) {
  if (raw !== raw.toUpperCase() || raw.length <= 4) return raw
  return raw.toLowerCase().replace(/(^|[\s,/-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase())
}

// Which leaf checkboxes a raw-value selection corresponds to — a label
// "counts" only if *every* raw value it maps to is present in the selection,
// not just any overlap. Several sibling categories share a legacy fallback
// raw value (e.g. every Vaping subcategory also lists "THC Vapes"), so a
// simple "any overlap" check would light up all of them the moment just one
// was picked.
function deriveSelectedLabels(rawValues) {
  return shopLeafCategories.filter((label) =>
    (categoryFilterMap[label] || [label]).every((v) => rawValues.includes(v))
  )
}

// Two URL shapes can land here: the clean "/collections/:slug" a header
// link now generates (matches the live triplebuzzsmokeshop.com Shopify
// site), or the internal "/shop?category=A%7CB" form (multi-value, used by
// checkbox selections and a couple of Home-page components). The slug always
// wins when both are somehow present.
function resolveRawCategoriesFromUrl(collectionSlug, categoryParam) {
  if (collectionSlug) {
    const label = slugToCategoryLabel[collectionSlug]
    return label ? categoryFilterMap[label] || [label] : []
  }
  return categoryParam ? categoryParam.split('|').filter(Boolean) : []
}

export default function Shop() {
  const { products, loading, loadingMore, hasMore, loadMore, error, categoryNames } = useProducts()
  const { categories: categorySummary } = useCategorySummary()
  const { slug: collectionSlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRawCategories = resolveRawCategoriesFromUrl(collectionSlug, searchParams.get('category'))
  // selectedCategories (raw backend values) is the source of truth for
  // fetching and the URL. selectedLabels (friendly checkbox labels) is
  // derived from it for display, but tracked separately so toggling one
  // checkbox can add/remove exactly its own raw values without disturbing a
  // sibling checkbox that happens to share one of them.
  const [selectedCategories, setSelectedCategories] = useState(initialRawCategories)
  const [selectedLabels, setSelectedLabels] = useState(() => deriveSelectedLabels(initialRawCategories))
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [perPage, setPerPage] = useState(9)
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1)

  // Keep ?page=N in the URL in sync with the page state so the address bar
  // matches triplebuzzsmokeshop.com/collections/shisha-and-coal?page=2.
  // Using replace:true so paging doesn't flood the browser history stack.
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (page <= 1) next.delete('page')
        else next.set('page', String(page))
        return next
      },
      { replace: true }
    )
  }, [page])
  const [openFilters, setOpenFilters] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    return { category: !isMobile, rating: !isMobile, price: !isMobile }
  })

  const toggleFilterSection = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Shop stays mounted across in-app navigation to /shop or /collections/:slug
  // (same component, just different route params), so a category picked
  // earlier wouldn't otherwise clear when the user lands here again — resync
  // the filter from the URL on every navigation, not just the first one.
  //
  // This resync used to happen in a useEffect, which runs *after* the browser
  // has already painted a render that still held the previous collection's
  // selectedCategories. Navigating straight from "All" (or another
  // collection) into a new one meant that stale render briefly showed the
  // wrong product list before the effect caught up — a visible flash of "all
  // products" (or the old collection) right before the correct one appeared.
  // Updating state directly during render instead (React's documented
  // pattern for "adjusting state when a prop changes") makes React redo the
  // render with the corrected state before anything reaches the screen, so
  // there's nothing stale to flash.
  const urlSyncKey = `${collectionSlug || ''}::${searchParams.toString()}`
  const [lastUrlSyncKey, setLastUrlSyncKey] = useState(urlSyncKey)
  if (urlSyncKey !== lastUrlSyncKey) {
    setLastUrlSyncKey(urlSyncKey)
    const raw = resolveRawCategoriesFromUrl(collectionSlug, searchParams.get('category'))
    setSelectedCategories(raw)
    setSelectedLabels(deriveSelectedLabels(raw))
    setSearchQuery(searchParams.get('search') || '')
    setPage(Number(searchParams.get('page')) || 1)
  }

  // Checkboxes show friendly leaf labels ("Batteries"), same as the header —
  // each one resolves to one or more raw backend category values via
  // categoryFilterMap under the hood, the same way header links already do.
  // Updates selectedLabels (exactly this label, nothing shared) and
  // recomputes selectedCategories (the raw values that actually drive
  // fetching) from the full set of currently-checked labels.
  const toggleCategory = (label) => {
    const nextLabels = selectedLabels.includes(label)
      ? selectedLabels.filter((l) => l !== label)
      : [...selectedLabels, label]
    setSelectedLabels(nextLabels)
    // Keep any checked "extra" (auto-listed) categories — they aren't tied to
    // a label, so they'd otherwise be dropped whenever a label is toggled.
    const extraSelected = selectedCategories.filter((v) => !COVERED_RAW_CATEGORIES.has(v))
    setSelectedCategories([
      ...new Set([...nextLabels.flatMap((l) => categoryFilterMap[l] || [l]), ...extraSelected]),
    ])
    setPage(1)
  }

  // Categories the backend has that no curated label covers — new ones from
  // the POS show up here without any code change. Falls back to whatever's
  // in the loaded products if the backend summary isn't available.
  const extraCategories = useMemo(() => {
    const names = categorySummary ? categorySummary.map((c) => c.name) : categoryNames
    return [...new Set(names)]
      .filter((name) => name && !COVERED_RAW_CATEGORIES.has(name))
      .sort((a, b) => a.localeCompare(b))
  }, [categorySummary, categoryNames])

  const toggleExtraCategory = (raw) => {
    setSelectedCategories((prev) => (prev.includes(raw) ? prev.filter((v) => v !== raw) : [...prev, raw]))
    setPage(1)
  }

  // A category link/checkbox picks one or more *raw* backend category values
  // (via categoryFilterMap for header links, or the raw value directly for
  // checkboxes). Previously this filtered whatever happened to already be
  // loaded in the shared, incrementally-paginated product cache, pulling in
  // more pages one at a time until enough matches turned up — for a sparse
  // category that could mean paging through the entire ~2,400-item catalogue
  // before the page ever filled. Fetching each selected raw category directly
  // from the backend instead resolves it in one request per value, in
  // parallel — a real query to the POS-synced catalogue, not a client-side
  // filter of whatever's in memory.
  const [categoryProducts, setCategoryProducts] = useState(null)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  // True while categoryProducts is only the preloaded first page and the full
  // category fetch hasn't landed yet.
  const [categoryPartial, setCategoryPartial] = useState(false)

  const selectedCategoriesKey = selectedCategories.join('|')

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setCategoryProducts(null)
      setCategoryError('')
      return
    }

    let cancelled = false
    setCategoryError('')

    // Paint the preloaded first page straight away (see utils/preloadCategories)
    // while the full fetch below runs. Only when that first page is what would
    // be on screen anyway: page 1, default order, no price/search filter.
    const preloaded =
      page === 1 && sortBy === 'latest' && !minPrice && !maxPrice && !searchQuery.trim()
        ? getPreloadedFirstPage(selectedCategories)
        : null
    if (preloaded && preloaded.length > 0) {
      setCategoryProducts(preloaded)
      setCategoryPartial(true)
      setCategoryLoading(false)
    } else {
      setCategoryPartial(false)
      setCategoryLoading(true)
    }

    Promise.all(
      selectedCategories.map((cat) =>
        fetchProducts({ site: 'triplebuzz', limit: CATEGORY_FETCH_LIMIT, category: cat }).catch(() => ({
          products: [],
        }))
      )
    )
      .then((results) => {
        if (cancelled) return
        const seen = new Set()
        const merged = []
        for (const data of results) {
          for (const p of data.products || []) {
            if (!seen.has(p._id)) {
              seen.add(p._id)
              merged.push(normalizeProduct(p))
            }
          }
        }
        setCategoryProducts(merged)
        setCategoryPartial(false)
      })
      .catch(() => {
        if (cancelled) return
        setCategoryError('Could not load products for this category right now.')
        setCategoryPartial(false)
      })
      .finally(() => {
        if (!cancelled) setCategoryLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoriesKey])

  const baseProducts = categoryProducts ?? products
  // A category is selected the instant selectedCategories updates (see the
  // render-time URL sync above), but categoryProducts/categoryLoading only
  // flip on the *next* commit, once the fetch effect for it has actually
  // started. Keying this off selectedCategories.length instead of
  // categoryProducts === null closes that gap — otherwise this would still
  // read the global (already-loaded) `loading` flag for one render and fall
  // through to rendering baseProducts, which is still the unfiltered
  // `products` list at that point.
  const isLoadingList =
    selectedCategories.length > 0 ? categoryProducts === null || categoryLoading : loading
  const listError = categoryProducts === null ? error : categoryError

  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    let list = baseProducts.filter((p) => {
      const price = parseFloat(p.price)
      const aboveMin = !minPrice || price >= parseFloat(minPrice)
      const belowMax = !maxPrice || price <= parseFloat(maxPrice)
      const matchesSearch = !term || p.name.toLowerCase().includes(term)
      return aboveMin && belowMax && matchesSearch
    })

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    }

    return list
  }, [baseProducts, searchQuery, minPrice, maxPrice, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
  const pageWindowStart = Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1
  const pageWindowEnd = Math.min(pageWindowStart + PAGE_WINDOW_SIZE - 1, totalPages)

  // Only applies to the unfiltered "All" browse view — that one still reads
  // from the shared, incrementally-loaded product cache (see ProductsContext),
  // so filtering/paging can run out of already-loaded items well before the
  // real result set is exhausted. Whenever that happens, pull in the next
  // batch until either there's enough to fill this page or the backend
  // confirms there's nothing left. Guarded on selectedCategories rather than
  // categoryProducts so it stays off for the entire lifetime of a category
  // selection, not just after that fetch resolves — categoryProducts is still
  // null for a moment right after picking a category, while its own fetch is
  // in flight, and this must not fire an unrelated unfiltered loadMore() in
  // that window. Category-filtered views fetch everything for their category
  // up front (see the effect above), so this never applies to them.
  useEffect(() => {
    if (selectedCategories.length > 0) return
    if (hasMore && !loadingMore && filtered.length < currentPage * perPage) {
      loadMore()
    }
  }, [selectedCategoriesKey, hasMore, loadingMore, filtered.length, currentPage, perPage])

  const relatedProducts = products.slice(0, 6)

  const activeCategoryLabel = resolveCategoryLabel(selectedCategories)
  const pageCopy = activeCategoryLabel ? categoryPageCopy[activeCategoryLabel] : defaultShopPageCopy

  // The collection slug each product card links through — whatever's
  // actually in the URL when it's a clean "/collections/:slug" visit,
  // otherwise derived from a single checked checkbox. Left undefined for
  // "All"/multi-category views, where no one collection applies to every
  // card, so ProductCard falls back to its bare "/shop/:slug" link.
  const productCollectionSlug = collectionSlug || (selectedLabels.length === 1 ? categorySlugs[selectedLabels[0]] : undefined)

  return (
    <>
      <section className="container-x pt-10">
        <div className="ml-10">
          <h1 className="text-2xl font-bold leading-tight text-ink sm:text-[28px]">
            {pageCopy.title} <span className="font-normal text-neutral-400">&ndash;</span> {pageCopy.subtitle}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            {filtered.length}
            {categoryPartial ? '+' : ''} product{filtered.length === 1 && !categoryPartial ? '' : 's'}
          </p>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside>
            <div className="border-b border-neutral-200 pb-6">
              <button
                type="button"
                onClick={() => toggleFilterSection('category')}
                aria-expanded={openFilters.category}
                className="mb-3 flex w-full items-center justify-between text-sm font-bold text-ink"
              >
                Category
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${openFilters.category ? 'rotate-180' : ''}`}
                />
              </button>
              {openFilters.category && (
                <>
                  <label className="flex items-start gap-2 py-1 text-sm text-neutral-600">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === 0}
                      onChange={() => {
                        setSelectedCategories([])
                        setSelectedLabels([])
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-gold"
                    />
                    All
                  </label>
                  {shopLeafCategories.map((label) => {
                    return (
                      <label key={label} className="flex items-start gap-2 py-1 text-sm text-neutral-600">
                        <input
                          type="checkbox"
                          checked={selectedLabels.includes(label)}
                          onChange={() => toggleCategory(label)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-gold"
                        />
                        <span className="break-words">{label}</span>
                      </label>
                    )
                  })}
                  {extraCategories.map((raw) => (
                    <label key={raw} className="flex items-start gap-2 py-1 text-sm text-neutral-600">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(raw)}
                        onChange={() => toggleExtraCategory(raw)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-brand-gold"
                      />
                      <span className="break-words">{displayCategoryName(raw)}</span>
                    </label>
                  ))}
                </>
              )}
            </div>

            <div className="border-b border-neutral-200 py-6">
              <button
                type="button"
                onClick={() => toggleFilterSection('rating')}
                aria-expanded={openFilters.rating}
                className="mb-3 flex w-full items-center justify-between text-sm font-bold text-ink"
              >
                Rating
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${openFilters.rating ? 'rotate-180' : ''}`}
                />
              </button>
              {openFilters.rating && (
                <>
                  <label className="flex items-start gap-2 py-1 text-sm text-neutral-600">
                    <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 shrink-0 accent-brand-gold" />
                    All
                  </label>
                  {RATINGS.map((r) => (
                    <label key={r} className="flex items-start gap-2 py-1 text-sm text-neutral-600">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand-gold" />
                      {r} {r === 1 ? 'Star' : 'Stars'}
                    </label>
                  ))}
                </>
              )}
            </div>

            <div className="py-6">
              <button
                type="button"
                onClick={() => toggleFilterSection('price')}
                aria-expanded={openFilters.price}
                className="mb-3 flex w-full items-center justify-between text-sm font-bold text-ink"
              >
                Price
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${openFilters.price ? 'rotate-180' : ''}`}
                />
              </button>
              {openFilters.price && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2">
                    <span className="text-sm text-neutral-600">$</span>
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value)
                        setPage(1)
                      }}
                      className="w-full text-sm text-ink outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2">
                    <span className="text-sm text-neutral-600">$</span>
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value)
                        setPage(1)
                      }}
                      className="w-full text-sm text-ink outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div>
            {searchQuery.trim() && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                <span>
                  Showing results for <span className="font-semibold text-ink">&ldquo;{searchQuery.trim()}&rdquo;</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="font-semibold text-ink hover:text-brand-gold"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-ink focus:outline-none"
                >
                  <option value="latest">Latest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">Show</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-ink focus:outline-none"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>

            {isLoadingList ? (
              <p className="py-16 text-center text-sm text-neutral-500">Loading products…</p>
            ) : listError ? (
              <p className="py-16 text-center text-sm text-red-600">{listError}</p>
            ) : pageItems.length === 0 && !loadingMore ? (
              <p className="py-16 text-center text-sm text-neutral-500">
                No products match your filters.
              </p>
            ) : pageItems.length === 0 ? (
              <p className="py-16 text-center text-sm text-neutral-500">Loading more products…</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((p) => (
                  <ProductCard key={p.slug} product={p} collectionSlug={productCollectionSlug} />
                ))}
              </div>
            )}
            {loadingMore && pageItems.length > 0 && (
              <p className="py-4 text-center text-xs text-neutral-400">Loading more products…</p>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: pageWindowEnd - pageWindowStart + 1 }).map((_, i) => {
                    const pageNum = pageWindowStart + i
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={`grid h-9 w-9 place-items-center rounded-md text-sm font-semibold transition ${currentPage === pageNum
                            ? 'bg-ink text-white'
                            : 'text-neutral-600 hover:bg-black/5'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={pageWindowStart === 1}
                    onClick={() => setPage(Math.max(1, pageWindowStart - PAGE_WINDOW_SIZE))}
                    className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-black/[0.02] disabled:opacity-40"
                  >
                    &larr; Previous
                  </button>
                  <button
                    type="button"
                    disabled={pageWindowEnd === totalPages}
                    onClick={() => setPage(Math.min(totalPages, pageWindowStart + PAGE_WINDOW_SIZE))}
                    className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-black/[0.02] disabled:opacity-40"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-x border-t border-neutral-200 py-10">
        <h2 className="text-xl font-bold text-ink">
          {pageCopy.title} <span className="font-normal text-neutral-400">&ndash;</span> {pageCopy.subtitle}
        </h2>
        <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-neutral-600">
          {pageCopy.description.map((paragraph, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
      </section>

      <section className="container-x border-t border-neutral-200 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="section-title">Related Products</h2>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <AreasServed />
    </>
  )
}
