import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { StarIcon } from './Icons'
import ImagePlaceholder from './ImagePlaceholder'
import { getDisplaySold, getDisplayRating } from '../utils/socialProof'

// collectionSlug is passed by any grid that represents one specific
// collection (Shop.jsx filtered to a single category, or a Home-page strip
// like VapesSection/CategoryShowcase) — matches the real site's
// "/collections/:slug/products/:slug" URLs instead of the bare
// "/shop/:slug" used everywhere a product isn't shown in a collection
// context (cart, wishlist, related products, general browsing).
export default function ProductCard({ product, flat = false, collectionSlug }) {
  const { addItem, openCart } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(product.backendId)
  const productHref = collectionSlug ? `/collections/${collectionSlug}/products/${product.slug}` : `/shop/${product.slug}`

  return (
    <div className={`group flex flex-col bg-white ${flat ? '' : 'overflow-hidden rounded-md border border-neutral-200 card-shadow'}`}>
      <div className="relative">
        <Link to={productHref} className="block aspect-square overflow-hidden bg-neutral-100 p-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder />
          )}
          {product.soldOut && (
            <span className="absolute left-2 top-2  bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Sold Out
            </span>
          )}
        </Link>
        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleItem(product)
          }}
          className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-500 shadow transition hover:text-red-500"
        >
          {wishlisted ? <FaHeart className="text-red-500" /> : <FiHeart />}
        </button>
      </div>
      <div className={`flex flex-1 flex-col gap-1 ${flat ? 'px-2.5 pt-2.5 pb-1.5' : 'px-3 pt-3 pb-2'}`}>
        {product.brand && (
          <p className={`font-medium uppercase tracking-wide text-neutral-400 ${flat ? 'text-[10px]' : 'text-[11px]'}`}>
            {product.brand}
          </p>
        )}
        <Link
          to={productHref}
          className={`line-clamp-2 font-semibold leading-tight text-ink hover:text-brand-goldDark ${
            flat ? 'min-h-[2rem] text-xs' : 'min-h-[2.5rem] text-sm'
          }`}
        >
          {product.name}
        </Link>
        {product.meta && <p className={`text-ink ${flat ? 'text-xs' : 'text-sm'}`}>{product.meta}</p>}
        <p className={`mt-1 font-semibold text-ink ${flat ? 'text-sm' : 'text-base'}`}>${product.price}</p>
        <p className={`flex items-center gap-1.5 text-neutral-500 ${flat ? 'text-[10px]' : 'text-[11px]'}`}>
          <StarIcon className="h-3 w-3 text-brand-gold" />
          <span className="font-semibold text-ink">{getDisplayRating(product).toFixed(1)}/5.0</span>
          <span>|</span>
          <span>{getDisplaySold(product)} sold</span>
        </p>
      </div>
      <button
        type="button"
        disabled={product.soldOut}
        onClick={() => {
          addItem(product, 1)
          openCart()
        }}
        className={`btn-dark disabled:cursor-not-allowed disabled:opacity-40 !rounded-none ${
          flat ? 'py-2 text-[11px]' : ''
        }`}
      >
        {product.soldOut ? 'Sold Out' : 'Add to cart'}
      </button>
    </div>
  )
}
