import { Link } from 'react-router-dom'
import SectionHeader from './SectionHeader'
import ImagePlaceholder from './ImagePlaceholder'
import { useProducts } from '../context/ProductsContext'
import { useCategorySummary } from '../hooks/useCategorySummary'
import { rawCategoryToSlug } from '../data/siteData'

export default function CategoryGrid() {
  const { categories: loadedCategories, loading: productsLoading } = useProducts()
  const { categories: summary, loading: summaryLoading } = useCategorySummary()

  // Prefer the backend's whole-catalogue summary; fall back to what's been
  // loaded into ProductsContext if it isn't available.
  const categories = summary ?? loadedCategories
  const loading = summaryLoading || (summary === null && productsLoading)

  if (!loading && categories.length === 0) return null

  return (
    <section className="container-x py-10">
      <SectionHeader title="Shop By Categories" to="/shop" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            // Clean "/collections/:slug" URL when this raw category value
            // (e.g. "GUMMIES") maps to a known leaf label — falls back to
            // the raw query form only for an unrecognized value, same
            // pattern CategoryShowcase already uses for its own links.
            to={
              rawCategoryToSlug[cat.name]
                ? `/collections/${rawCategoryToSlug[cat.name]}`
                : `/shop?category=${encodeURIComponent(cat.name)}`
            }
            className="group flex flex-col gap-2 rounded-md border border-neutral-200 p-2.5 transition-colors hover:border-ink"
          >
            <div className="aspect-square overflow-hidden rounded bg-black">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <ImagePlaceholder label={cat.name} />
              )}
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
              {cat.count} Products
            </p>
            <p className="text-xs font-semibold leading-snug text-ink">{cat.name}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link
          to="/shop"
          className="rounded-md bg-ink px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          View All products
        </Link>
      </div>
    </section>
  )
}
