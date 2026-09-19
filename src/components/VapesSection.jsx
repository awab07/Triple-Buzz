import SectionHeader from './SectionHeader'
import ProductCard from './ProductCard'
import { useCategoryProducts } from '../hooks/useCategoryProducts'
import { categoryFilterMap, categorySlugs } from '../data/siteData'

// Matches both the legacy manually-added products ('THC Vapes') and the
// real Lightspeed category ('THC VAPES') — see the note on categoryFilterMap.
const THC_VAPE_CATEGORIES = categoryFilterMap['THC Vapes']

// One row on the homepage — the full list lives on the collection page.
const INITIAL_COUNT = 6

export default function VapesSection() {
  const { products: vapeProducts } = useCategoryProducts(THC_VAPE_CATEGORIES, INITIAL_COUNT)

  if (vapeProducts.length === 0) return null

  return (
    <section className="container-x py-10">
      <SectionHeader title="THC Vapes" to={`/collections/${categorySlugs['THC Vapes']}`} />
      <div className="grid grid-cols-2 divide-x divide-y divide-neutral-200 overflow-hidden rounded border border-neutral-200 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
        {vapeProducts.map((p) => (
          <ProductCard
            key={p.backendId ?? p.slug}
            product={p}
            flat
            collectionSlug={categorySlugs['THC Vapes']}
          />
        ))}
      </div>
    </section>
  )
}
