// All content below is placeholder/dummy data for layout purposes.
// Swap the logo, images, and copy once real client assets are provided.

export const siteConfig = {
  name: 'Triple Buzz',
  tagline: 'Smoke & Vape Shop',
  phone: '+1 512-351-8012',
  email: 'triplebuzzsmokeandvape@gmail.com',
  address: '801 Wells Branch Pkwy #115, Pflugerville',
  freeShippingNote: 'FREE SHIPPING ON ORDERS OVER $50 (CONTINENTAL U.S. ONLY)',
}

export const navLinks = [
  { label: 'Home', columns: null },
  { label: 'About', columns: null },
  { label: 'Shop', columns: null },
  { label: 'Contact Us', columns: null },
]

// Mirrors the live triplebuzzsmokeshop.com category structure, shown in the
// "Shop" mega menu as a wrapping grid of category columns.
export const shopCategories = [
  {
    label: 'Vaping',
    subcategories: ['Batteries', 'Coils and Pods', 'Disposable Vapes', 'Vape Juice', 'Vape Mods', 'Vaporizers'],
  },
  {
    label: 'Smoking Accessories',
    subcategories: [
      'Ashtrays and Trays',
      'Bangers',
      'Cigarillos',
      'Glass',
      'Grinder',
      'Oil Burners',
      'Papers and Cones',
      'Torches, Lighters and Butane',
    ],
  },
  {
    label: 'Hookah',
    subcategories: ['Hookah and Accessories', 'Shisha and Coal'],
  },
  {
    label: 'THC',
    subcategories: ['Flower', 'Gummies', 'Pre-Rolls', 'THC Drinks', 'THC Vapes'],
  },
  {
    label: 'Wellness',
    subcategories: ['Detox', 'Hydroxy and Kratom', 'Sex Pills'],
  },
  {
    label: 'Fragrance',
    subcategories: ['Air Fresheners, Incense and Candles', 'Perfumes'],
  },
  {
    label: 'Bags & Scales',
    subcategories: ['Bags', 'Pouches', 'Scale'],
  },
  {
    label: 'Novelty',
    subcategories: ['Drinks', 'Exotic', 'General', 'Gift Kit', 'Snacks'],
  },
  {
    label: 'Whip It',
    subcategories: [],
  },
]

function slugifyCategoryLabel(label) {
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Every label that can appear as a category selection (each top-level group
// and each of its subcategories) gets a clean "/collections/:slug" URL —
// matching the live triplebuzzsmokeshop.com Shopify site's collection URLs
// (e.g. /collections/batteries) — instead of exposing our internal raw
// category values in a "?category=A%7CB%7CC" query string. See Shop.jsx
// (resolves a slug back to raw category values) and Header.jsx (builds the
// links).
const allCategoryLabels = [
  ...shopCategories.map((cat) => cat.label),
  ...shopCategories.flatMap((cat) => cat.subcategories),
]

export const categorySlugs = Object.fromEntries(
  allCategoryLabels.map((label) => [label, slugifyCategoryLabel(label)])
)

export const slugToCategoryLabel = Object.fromEntries(
  allCategoryLabels.map((label) => [slugifyCategoryLabel(label), label])
)

// Every leaf category a user can pick — each subcategory, plus any top-level
// entry with none of its own (e.g. "Whip It"). Used for the Shop page's
// category checkboxes so that list mirrors the header's mega menu exactly,
// rather than only whatever categories happen to be represented in the
// product cache loaded so far (see Shop.jsx).
export const shopLeafCategories = shopCategories.flatMap((cat) =>
  cat.subcategories.length > 0 ? cat.subcategories : [cat.label]
)

// The mega-menu mirrors the full taxonomy of the live site, but we only carry
// product data for the categories below. This maps every top-level/sub label
// used in the "Shop" dropdown to the real category (or categories) it should
// filter to. Labels with no mapping fall through unmapped on purpose, so they
// honestly show "no products match" instead of silently showing everything.
// Two generations of category values coexist in the data: the original
// hand-picked Title-Case names (a couple dozen manually-added products) and
// the real, all-caps names Lightspeed uses for the much larger synced
// catalogue (e.g. "THC Vapes" vs "THC VAPES", or "Ashtrays & Trays" vs
// "ASHTRAYS AND TRAYS" — not just casing, sometimes different wording
// entirely). Every entry below lists both so a category link surfaces
// products from either generation instead of silently matching nothing.
export const categoryFilterMap = {
  // top-level — the union of each subcategory's mapping below
  Vaping: ['THC Vapes', 'BATTERIES', 'COILS AND PODS', 'DISPOSABLE VAPES', 'VAPE JUICE', 'VAPE MODS', 'VAPORIZERS'],
  'Smoking Accessories': [
    'Smoking Accessories', 'Torches & Lighters', 'Ashtrays & Trays',
    'ASHTRAYS AND TRAYS', 'BANGERS', 'CIGARILLOS', 'GLASS', 'GRINDER',
    'OIL BURNERS', 'PAPERS AND CONES', 'TORCHES, LIGHTERS AND BUTANE',
  ],
  Hookah: ['Shisha Hookah', 'HOOKAH AND ACCESORIES', 'SHISHA AND COAL'],
  THC: ['THC Vapes', 'THC Gummies', 'THC Drinks', 'THC', 'FLOWER', 'GUMMIES', 'PRE-ROLLS', 'THC DRINKS', 'THC VAPES'],
  Wellness: ['Detox', 'DETOX', 'HYDROXY AND KRATOM', 'SEX PILLS'],
  Fragrance: ['Perfumes', 'PERFUMES', 'AIR FRESHENERS, INCENSE AND CANDLES'],
  'Bags & Scales': ['BAGS', 'POUCHES', 'SCALE'],
  Novelty: ['DRINKS', 'EXOTIC', 'GENERAL', 'GIFT KIT'],
  'Whip It': ['WHIP IT'],

  // subcategories
  Batteries: ['THC Vapes', 'BATTERIES'],
  'Coils and Pods': ['THC Vapes', 'COILS AND PODS'],
  'Disposable Vapes': ['THC Vapes', 'DISPOSABLE VAPES'],
  'Vape Juice': ['THC Vapes', 'VAPE JUICE'],
  'Vape Mods': ['THC Vapes', 'VAPE MODS'],
  Vaporizers: ['THC Vapes', 'VAPORIZERS'],
  'Ashtrays and Trays': ['Ashtrays & Trays', 'ASHTRAYS AND TRAYS'],
  Bangers: ['Smoking Accessories', 'BANGERS'],
  Cigarillos: ['CIGARILLOS'],
  Glass: ['GLASS'],
  Grinder: ['Smoking Accessories', 'GRINDER'],
  'Oil Burners': ['OIL BURNERS'],
  'Papers and Cones': ['PAPERS AND CONES'],
  'Torches, Lighters and Butane': ['Torches & Lighters', 'TORCHES, LIGHTERS AND BUTANE'],
  'Hookah and Accessories': ['Shisha Hookah', 'HOOKAH AND ACCESORIES'],
  'Shisha and Coal': ['Shisha Hookah', 'SHISHA AND COAL'],
  Flower: ['FLOWER'],
  Gummies: ['THC Gummies', 'GUMMIES'],
  'Pre-Rolls': ['PRE-ROLLS'],
  'THC Drinks': ['THC Drinks', 'THC DRINKS'],
  'THC Vapes': ['THC Vapes', 'THC VAPES'],
  Detox: ['Detox', 'DETOX'],
  'Hydroxy and Kratom': ['HYDROXY AND KRATOM'],
  'Sex Pills': ['SEX PILLS'],
  'Air Fresheners, Incense and Candles': ['AIR FRESHENERS, INCENSE AND CANDLES'],
  Perfumes: ['Perfumes', 'PERFUMES'],
  Bags: ['BAGS'],
  Pouches: ['POUCHES'],
  Scale: ['SCALE'],
  Drinks: ['DRINKS'],
  Exotic: ['EXOTIC'],
  General: ['GENERAL'],
  'Gift Kit': ['GIFT KIT'],
  Snacks: ['SNACKS'],
}

// Maps a raw backend category value (e.g. "GUMMIES", straight off a
// product/category record) back to the clean leaf label that owns it (e.g.
// "Gummies"), so components working with raw category data — like
// CategoryGrid's homepage tiles — can still link to the clean
// "/collections/:slug" URL instead of falling back to the raw
// "?category=" query form. Iterates shopLeafCategories (not top-level
// labels) so e.g. "GUMMIES" resolves to "Gummies" rather than the broader
// "THC" it also appears under in categoryFilterMap.
export const rawCategoryToSlug = Object.fromEntries(
  shopLeafCategories.flatMap((label) =>
    (categoryFilterMap[label] || [label]).map((raw) => [raw, categorySlugs[label]])
  )
)

// Copy for the Shop page's category heading — keyed by the same top-level
// labels used in `shopCategories`/`categoryFilterMap` above, so picking a
// category (from the header mega menu or the in-page checkboxes) can show an
// SEO-style "{title} – {subtitle}" line, plus a few keyword-rich paragraphs,
// instead of a bare product grid. `description` entries are static HTML we
// wrote ourselves (safe to render with dangerouslySetInnerHTML) so a couple
// of phrases per category can be bolded inline.
export const categoryPageCopy = {
  Vaping: {
    title: 'Vape Shop Austin',
    subtitle: 'Premium Vapes, Mods & E-Juice',
    description: [
      'Shop premium <strong>vapes and mods</strong> at Triple Buzz, your trusted <strong>vape shop in Austin, TX</strong>. We carry a carefully selected range of disposable vapes, pod systems, coils, and e-juice for both new and experienced vapers.',
      'Explore leading gear like <strong>Uwell Caliburn</strong> pod systems and other top mods, batteries, and vaporizers. From smooth nicotine salts to bold flavor profiles, there&rsquo;s something for every taste.',
      'We keep our shelves stocked with fresh arrivals, giving you access to the latest vape hardware and best-selling e-juice at competitive prices.',
      'Visit Triple Buzz at 801 Wells Branch Pkwy #115 in Pflugerville or order online for fast local pickup. Searching for the best <strong>vape shop in Austin</strong>, <strong>vape mods near me</strong>, or premium <strong>e-juice</strong>? We&rsquo;re here to help you find the perfect match.',
    ],
  },
  'Smoking Accessories': {
    title: 'Smoke Shop Austin',
    subtitle: 'Pipes, Papers & Smoking Gear',
    description: [
      'Browse our full lineup of <strong>smoking accessories</strong> at Triple Buzz, a trusted <strong>smoke shop in Austin, TX</strong>. From hand-blown glass to rolling papers and torches, we stock everything you need for a great smoking experience.',
      'Explore quality picks from brands like <strong>Grav</strong> and <strong>White Owl</strong>, along with grinders, bangers, ashtrays, and butane torches built to last.',
      'New glass and gear arrive regularly, so you&rsquo;ll always find fresh pieces alongside our best-selling staples — all at prices that keep you coming back.',
      'Stop by our Pflugerville location or shop online for local pickup. Searching for the best <strong>smoke shop in Austin</strong>, <strong>glass pipes near me</strong>, or quality <strong>smoking accessories</strong>? We&rsquo;ve got you covered.',
    ],
  },
  Hookah: {
    title: 'Shisha Shop Austin',
    subtitle: 'Premium Hookah Tobacco & Accessories',
    description: [
      'Enjoy a better hookah experience with premium <strong>shisha tobacco</strong> from Triple Buzz, your trusted <strong>shisha shop in Austin, TX</strong>. We offer a carefully selected range of hookah flavors and accessories for both new and experienced hookah smokers.',
      'Explore leading brands like <strong>Al Fakher</strong>. From fruity and cool mint to rich dessert and bold exotic flavors, there&rsquo;s something for every taste.',
      'We keep our shelves stocked with fresh arrivals, giving you access to the latest shisha flavors and best-selling hookah gear at competitive prices.',
      'Visit Triple Buzz at 801 Wells Branch Pkwy #115 in Pflugerville or order online for fast local pickup. Searching for the best <strong>shisha shop in Austin</strong>, <strong>hookah tobacco near me</strong>, or premium <strong>hookah flavors</strong>? We&rsquo;re here to help you find the perfect match.',
    ],
  },
  THC: {
    title: 'THC Shop Austin',
    subtitle: 'Gummies, Vapes & Pre-Rolls',
    description: [
      'Shop lab-tested <strong>THC gummies, vapes, and pre-rolls</strong> at Triple Buzz, a trusted <strong>THC shop in Austin, TX</strong>. Every product on our shelves is hemp-derived and compliant with the 2018 Farm Bill.',
      'Explore fan-favorite brands like <strong>Good Vibes, Texas Hill Country, Turn, Habit, Snoozy,</strong> and <strong>Jelly</strong>, covering everything from sativa gummies to disposable THC-P vapes.',
      'New drops land regularly, so you&rsquo;ll always find fresh potency options and flavors alongside our best-selling staples — all at competitive prices.',
      'Visit us in Pflugerville or shop online for local pickup. Searching for the best <strong>THC shop in Austin</strong>, <strong>THC gummies near me</strong>, or premium <strong>THC-P vapes</strong>? We&rsquo;re here to help.',
    ],
  },
  Wellness: {
    title: 'Wellness Shop Austin',
    subtitle: 'Detox, Kratom & Wellness Products',
    description: [
      'Find trusted <strong>detox and kratom products</strong> at Triple Buzz, your <strong>wellness shop in Austin, TX</strong>. We carry a curated selection of detox drinks, kratom extracts, and everyday wellness essentials.',
      'Our staff can help you find the right product for your routine, whether you&rsquo;re after a daily kratom pick-me-up or a same-day detox solution.',
      'Shelves are restocked often so you always have access to fresh, quality product at fair prices.',
      'Stop by our Pflugerville location or order online for local pickup. Looking for the best <strong>wellness shop in Austin</strong> or <strong>kratom near me</strong>? We&rsquo;ve got you covered.',
    ],
  },
  Fragrance: {
    title: 'Fragrance Shop Austin',
    subtitle: 'Incense, Candles & Perfumes',
    description: [
      'Browse our collection of <strong>incense, candles, and perfumes</strong> at Triple Buzz, a go-to <strong>fragrance shop in Austin, TX</strong>.',
      'From everyday air fresheners to long-lasting perfume oils, we stock scents for every mood and space.',
      'New fragrances arrive regularly, so there&rsquo;s always something fresh to discover at a price that works for you.',
      'Visit us in Pflugerville or shop online for pickup. Searching for the best <strong>fragrance shop in Austin</strong> or <strong>incense near me</strong>? We&rsquo;re here to help.',
    ],
  },
  'Bags & Scales': {
    title: 'Bags & Scales Shop Austin',
    subtitle: 'Bags, Pouches & Precision Scales',
    description: [
      'Shop durable <strong>bags, pouches, and precision scales</strong> at Triple Buzz, your <strong>smoke shop in Austin, TX</strong> for everyday accessories.',
      'From smell-proof storage to accurate digital scales, we carry the gear you need to stay organized.',
      'We keep popular sizes and styles in stock, with new arrivals added regularly.',
      'Visit our Pflugerville location or order online for local pickup. Looking for <strong>scales near me</strong> or smell-proof <strong>storage bags</strong>? We&rsquo;ve got you covered.',
    ],
  },
  Novelty: {
    title: 'Novelty Shop Austin',
    subtitle: 'Novelty Gifts & Exotic Treats',
    description: [
      'Discover fun <strong>novelty gifts and exotic treats</strong> at Triple Buzz, a favorite <strong>smoke shop in Austin, TX</strong> for something a little different.',
      'From exotic snacks and drinks to gift kits, our novelty selection is always changing with new finds.',
      'Stop by often — new and limited items move fast, and we restock our best-sellers regularly.',
      'Visit us in Pflugerville or shop online for local pickup. Looking for unique <strong>novelty gifts near me</strong>? We&rsquo;re here to help you find something fun.',
    ],
  },
  'Whip It': {
    title: 'Whip It Shop Austin',
    subtitle: 'Chargers & Whipped Cream Accessories',
    description: [
      'Shop <strong>whip it chargers</strong> and whipped cream accessories at Triple Buzz, your <strong>smoke shop in Austin, TX</strong> for kitchen and dessert essentials.',
      'We keep chargers and dispensers in stock and ready for same-day pickup.',
      'Visit our Pflugerville location or order online. Looking for <strong>whip it chargers near me</strong>? We&rsquo;ve got you covered.',
    ],
  },
}

export const defaultShopPageCopy = {
  title: 'Shop Austin',
  subtitle: 'Premium Smoke, Vape & THC Products',
  description: [
    'Welcome to Triple Buzz, Austin and Pflugerville&rsquo;s go-to <strong>smoke and vape shop</strong>. Browse our full catalog of vapes, hookah, THC products, smoking accessories, and more — all in one place.',
    'We carry trusted brands across every category, with new arrivals added regularly and fresh stock on our best-sellers.',
    'Visit us at 801 Wells Branch Pkwy #115, Pflugerville, or shop online for fast local pickup. Searching for the best <strong>smoke shop near me</strong>? You&rsquo;ve found it.',
  ],
}

// Only the top-level labels — `categoryFilterMap` also carries subcategory
// entries, but `categoryPageCopy` only has copy for the top-level groupings.
const TOP_LEVEL_CATEGORIES = Object.keys(categoryPageCopy)

// `selected` is always raw backend category value(s) — set directly from a
// checkbox (a single raw value), a header mega-menu link (the whole raw
// array a top-level label expands to, see Header.jsx's categoryHref), or a
// single product's own `category` field. Several top-level lists deliberately
// share raw values (e.g. both Vaping and THC list "THC Vapes" — see the note
// above categoryFilterMap), so picking the first label with *any* overlap
// would pick the wrong one whenever a bigger, more specific list is also in
// the running (clicking the top-level "THC" link, whose 9-value array
// includes "THC Vapes", would otherwise resolve to "Vaping" just because it
// comes first and also contains that one value). Instead, score every
// top-level label by how many of its raw values are actually selected and
// take the best match, so the label whose full list was the actual source of
// the selection wins.
export function resolveCategoryLabel(selected) {
  let bestLabel
  let bestScore = 0
  for (const label of TOP_LEVEL_CATEGORIES) {
    const score = (categoryFilterMap[label] || []).filter((raw) => selected.includes(raw)).length
    if (score > bestScore) {
      bestScore = score
      bestLabel = label
    }
  }
  return bestLabel
}

// Given a single product's raw backend category, finds the most specific
// matching leaf label — the one whose raw-value list is shortest, since a
// longer list is more likely to be a shared legacy fallback (e.g. several
// Vaping subcategories all list "THC Vapes" too). Used for a product page's
// breadcrumb link back to the collection it actually belongs to.
export function findLeafLabelForCategory(rawCategory) {
  let best
  let bestSize = Infinity
  for (const label of shopLeafCategories) {
    const values = categoryFilterMap[label] || [label]
    if (values.includes(rawCategory) && values.length < bestSize) {
      best = label
      bestSize = values.length
    }
  }
  return best
}

// Real reviews pulled from the shop's live Google Business listing (snapshot
// taken 2026-09-07). Not a live feed — see the note where `testimonials` is
// used if you want to refresh this later.
export const googleRating = { value: 4.8, count: 597 }

export const testimonials = [
  { id: 1, name: 'Celeste Gonzales', timeAgo: 'a month ago', initial: 'C', avatarColor: '#2b8a3e', rating: 5, text: 'My partner and I have been wanting to visit this smoke shop and finally stopped by. The owner took good care of us and was so helpful with my basic/simple questions. We will definitely be back! 10/10' },
  { id: 2, name: 'Bola Omoniyi', timeAgo: '2 months ago', initial: 'B', avatarColor: '#e8590c', rating: 5, text: 'Sabre was awesome. His customer service was top notch. This place also has variety of things you’re looking for. Highly recommend' },
  { id: 3, name: 'Ms. Altonia', timeAgo: 'a month ago', initial: 'A', avatarColor: '#d6336c', rating: 5, text: 'Had a great time shopping here. The staff was super helpful!! Definitely coming back!' },
  { id: 4, name: 'Desiree Wilson', timeAgo: '3 months ago', initial: 'D', avatarColor: '#495057', rating: 5, text: 'Mohammad was extremely knowledgeable and friendly. As a first time customer he was very welcoming and answered all my questions. 10/10 experience and I will be back!' },
  { id: 5, name: 'Jessica Hawkins-Washington', timeAgo: '3 months ago', initial: 'J', avatarColor: '#1971c2', rating: 5, text: 'Mohammed was so awesome. Great service, had exactly what I needed, friendly and well stocked! Definitely recommend.' },
  { id: 6, name: 'William Anderson', timeAgo: '2 months ago', initial: 'W', avatarColor: '#9c36b5', rating: 5, text: 'Best deals in the city, come tap in with my friend.' },
]

export const areas = [
  {
    title: 'Central & North Austin',
    places: ['North Lamar', 'The Domain', 'North Burnet', 'Allandale', 'Crestview', 'Hyde Park', 'Brentwood', 'Georgian Acres', 'Walnut Creek', 'Tech Ridge'],
  },
  {
    title: 'North & Northwest',
    places: ['Round Rock', 'Cedar Park', 'Leander', 'Pflugerville', 'Wells Branch', 'Jollyville'],
  },
]
