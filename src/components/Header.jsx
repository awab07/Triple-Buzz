import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiLogOut } from 'react-icons/fi'
import Logo from './Logo'
import { shopCategories, categorySlugs } from '../data/siteData'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { fetchBlogs } from '../lib/api'
import { preloadHomePage } from '../utils/preloadHome'
import { preloadCategoryLabel } from '../utils/preloadCategories'

// Clean "/collections/:slug" URLs — matches the live triplebuzzsmokeshop.com
// Shopify site (e.g. /collections/batteries) instead of exposing our
// internal raw category values in a "?category=A%7CB%7CC" query string.
// Every label in shopCategories always has a slug (see siteData.js).
function categoryHref(name) {
  return `/collections/${categorySlugs[name]}`
}

function SearchModal({ open, onClose }) {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { products } = useProducts()
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!open) return
    setQuery('')
    inputRef.current?.focus()
    fetchBlogs(1)
      .then((data) => setPosts(data.blogs ?? []))
      .catch(() => setPosts([]))
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const trimmed = query.trim()
  const term = trimmed.toLowerCase()
  const productMatches = trimmed
    ? products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 5)
    : []
  const postMatches = trimmed
    ? posts.filter((p) => p.title.toLowerCase().includes(term)).slice(0, 4)
    : []
  const hasAnyMatches = productMatches.length > 0 || postMatches.length > 0

  const goToProductResults = () => {
    if (!trimmed) return
    navigate(`/shop?search=${encodeURIComponent(trimmed)}`)
    onClose()
  }

  const goToBlogResults = () => {
    if (!trimmed) return
    navigate(`/blog?search=${encodeURIComponent(trimmed)}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-fit w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Search</h2>
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-neutral-500 hover:bg-black/5 hover:text-ink"
          >
            <FiX />
          </button>
        </div>
        <form
          className="flex w-full items-center overflow-hidden rounded border border-neutral-200"
          onSubmit={(e) => {
            e.preventDefault()
            goToProductResults()
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products & blog posts..."
            className="w-full px-4 py-3 text-sm text-ink outline-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center bg-brand-gold px-5 py-3 text-white hover:bg-brand-goldDark"
            aria-label="Search"
          >
            <FiSearch />
          </button>
        </form>

        {trimmed && (
          <div className="mt-3 flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
            {!hasAnyMatches ? (
              <p className="px-1 py-2 text-sm text-neutral-500">
                No results found for &ldquo;{trimmed}&rdquo;.
              </p>
            ) : (
              <>
                {productMatches.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Products
                    </p>
                    {productMatches.map((p) => (
                      <Link
                        key={p.slug}
                        to={`/shop/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-black/5"
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded bg-neutral-100">
                          {p.image && (
                            <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.category}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-ink">${p.price}</span>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={goToProductResults}
                      className="mt-1 self-start px-2 text-sm font-semibold text-ink hover:text-brand-gold"
                    >
                      View all product results for &ldquo;{trimmed}&rdquo;
                    </button>
                  </div>
                )}

                {postMatches.length > 0 && (
                  <div className="flex flex-col gap-1 border-t border-neutral-100 pt-3">
                    <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Blog
                    </p>
                    {postMatches.map((post) => (
                      <Link
                        key={post._id}
                        to={`/blog/${post.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-black/5"
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded bg-neutral-100">
                          {post.image?.url && (
                            <img
                              src={post.image.url}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                          {post.category && (
                            <p className="text-xs text-neutral-400">{post.category}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={goToBlogResults}
                      className="mt-1 self-start px-2 text-sm font-semibold text-ink hover:text-brand-gold"
                    >
                      View all blog results for &ldquo;{trimmed}&rdquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const OPEN_DELAY = 80
const CLOSE_DELAY = 250

export default function Header() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMobileCat, setOpenMobileCat] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openCat, setOpenCat] = useState(null)
  const [mobileQuery, setMobileQuery] = useState('')
  const timerRef = useRef(null)
  const { items, openCart } = useCart()
  const cartCount = items.length
  const { isLoggedIn, logout } = useAuth()

  const submitMobileSearch = (e) => {
    e.preventDefault()
    const trimmed = mobileQuery.trim()
    if (!trimmed) return
    navigate(`/shop?search=${encodeURIComponent(trimmed)}`)
    setMobileQuery('')
    setMobileOpen(false)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const openDrop = (label) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpenCat(label), OPEN_DELAY)
  }
  const closeDrop = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpenCat(null), CLOSE_DELAY)
  }

  return (
    <header className="relative z-40 border-b border-neutral-200 bg-white text-ink">
      <div className="container-x relative flex items-center justify-between gap-4 py-3">
        <button
          type="button"
          className="text-2xl lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>

        <Link to="/" className="shrink-0" onMouseEnter={preloadHomePage}>
          <Logo className="h-9 sm:h-10 lg:h-12" />
        </Link>

        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[11px] font-bold uppercase tracking-wide text-ink lg:flex">
          <Link to="/" className="py-2 transition-colors hover:text-brand-goldDark" onMouseEnter={preloadHomePage}>
            Home
          </Link>

          {shopCategories.map((cat) => (
            <div
              key={cat.label}
              className="relative"
              onMouseEnter={() => openDrop(cat.label)}
              onMouseLeave={closeDrop}
            >
              <Link
                to={categoryHref(cat.label)}
                onMouseEnter={() => preloadCategoryLabel(cat.label)}
                className="flex items-center gap-1 py-2 transition-colors hover:text-brand-goldDark"
              >
                {cat.label}
                {cat.subcategories.length > 0 && <FiChevronDown className="text-[10px]" />}
              </Link>

              {cat.subcategories.length > 0 && (
                <div
                  className={`absolute left-1/2 top-full z-30 mt-1 w-56 -translate-x-1/2 rounded-md border border-neutral-200 bg-white p-3 normal-case shadow-xl transition-all duration-150 ease-out ${
                    openCat === cat.label
                      ? 'visible translate-y-0 opacity-100'
                      : 'invisible -translate-y-1 opacity-0'
                  }`}
                >
                  <ul className="flex flex-col gap-2">
                    {cat.subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={categoryHref(sub)}
                          onMouseEnter={() => preloadCategoryLabel(sub)}
                          className="block text-xs font-medium normal-case text-neutral-600 hover:text-brand-goldDark"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="hidden items-center justify-center rounded-full border border-neutral-200 p-2.5 text-neutral-600 transition-colors hover:border-ink hover:text-ink lg:flex"
          >
            <FiSearch className="text-lg" />
          </button>
          {isLoggedIn ? (
            <div className="hidden flex-col items-start leading-tight sm:flex">
              <button
                type="button"
                onClick={logout}
                className="text-neutral-500 hover:text-red-500"
              >
                Logout
              </button>
              <Link to="/profile" className="font-semibold text-ink hover:text-brand-goldDark">
                My account
              </Link>
            </div>
          ) : (
            <Link to="/sign-in" className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-neutral-500">Login / Signup</span>
              <span className="font-semibold text-ink">My account</span>
            </Link>
          )}
          <span className="hidden h-8 w-px bg-neutral-200 sm:block" />
          <button type="button" onClick={openCart} className="flex items-center gap-2">
            <span className="relative text-xl text-neutral-700">
              <FiShoppingCart />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </span>
            <span className="font-semibold text-ink">Cart</span>
          </button>
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 lg:hidden">
          <form
            onSubmit={submitMobileSearch}
            className="mb-4 flex items-center overflow-hidden rounded border border-neutral-200"
          >
            <input
              type="text"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 text-sm text-ink outline-none"
            />
            <button type="submit" className="flex items-center justify-center bg-brand-gold px-4 py-2.5 text-white">
              <FiSearch />
            </button>
          </form>
          <ul className="flex flex-col gap-1 text-sm font-medium text-neutral-600">
            <li className="border-b border-neutral-100 py-2">
              <Link to="/" onClick={() => setMobileOpen(false)} className="font-semibold text-ink">
                Home
              </Link>
            </li>
            {shopCategories.map((cat) => (
              <li key={cat.label} className="border-b border-neutral-100 py-2">
                <div className="flex items-center justify-between">
                  <Link
                    to={categoryHref(cat.label)}
                    onClick={() => setMobileOpen(false)}
                    className="font-semibold text-ink"
                  >
                    {cat.label}
                  </Link>
                  {cat.subcategories.length > 0 && (
                    <button
                      type="button"
                      aria-label={`Toggle ${cat.label} subcategories`}
                      onClick={() => setOpenMobileCat(openMobileCat === cat.label ? null : cat.label)}
                      className="p-1 text-neutral-400"
                    >
                      <FiChevronDown
                        className={`text-xs transition-transform ${openMobileCat === cat.label ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>
                {cat.subcategories.length > 0 && openMobileCat === cat.label && (
                  <ul className="mt-2 flex flex-col gap-2 border-l border-neutral-200 pl-3">
                    {cat.subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={categoryHref(sub)}
                          onClick={() => setMobileOpen(false)}
                          className="text-xs text-neutral-500 hover:text-brand-goldDark"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center gap-2 text-sm text-neutral-600"
              >
                <FiUser /> My account
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
                className="mt-3 flex items-center gap-2 text-sm text-red-500"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <Link to="/sign-in" onClick={() => setMobileOpen(false)} className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <FiUser /> Login / Signup
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
