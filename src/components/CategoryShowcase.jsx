import { Link } from 'react-router-dom'
import SectionHeader from './SectionHeader'
import ProductCard from './ProductCard'
import { useCategoryProducts } from '../hooks/useCategoryProducts'
import { categorySlugs } from '../data/siteData'

// A homepage strip for one category. It asks the backend for just this
// category's first few products (see useCategoryProducts) rather than
// borrowing whatever ProductsContext happens to have paged in — so it never
// has to trigger extra catalogue-wide page loads to find something to show.
// "Load More Products" takes the user to the collection page, rather than
// expanding in place.
export default function CategoryShowcase({ title, categories, initialCount = 6 }) {
  const { products: visible, total } = useCategoryProducts(categories, initialCount)

  if (visible.length === 0) return null

  // `title` matches a real category label in practice (e.g. "Vape Juice"),
  // so it gets the same clean "/collections/:slug" URL as the header — falls
  // back to the internal multi-value query form if a caller ever passes a
  // title that isn't a recognized label.
  const categoryHref = categorySlugs[title]
    ? `/collections/${categorySlugs[title]}`
    : `/shop?category=${encodeURIComponent(categories.join('|'))}`

  return (
    <section className="container-x py-10">
      <SectionHeader title={title} to={categoryHref} />
      <div className="grid grid-cols-2 divide-x divide-y divide-neutral-200 overflow-hidden rounded border border-neutral-200 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
        {visible.map((p) => (
          <ProductCard
            key={p.backendId ?? p.slug}
            product={p}
            flat
            collectionSlug={categorySlugs[title]}
          />
        ))}
      </div>
      {total > initialCount && (
        <div className="mt-6 flex justify-center">
          <Link
            to={categoryHref}
            className="rounded-md bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Load More Products
          </Link>
        </div>
      )}
    </section>
  )
}
