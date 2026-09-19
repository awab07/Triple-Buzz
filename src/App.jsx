import { Routes, Route } from 'react-router-dom'
import useTabAttention from './hooks/useTabAttention'
import ScrollToTop from './components/ScrollToTop'
import Canonical from './components/Canonical'
import AnnouncementBar from './components/AnnouncementBar'
import Header from './components/Header'
import Footer from './components/Footer'
import AgeVerificationModal from './components/AgeVerificationModal'
import CartDrawer from './components/CartDrawer'
import RecentPurchasePopup from './components/RecentPurchasePopup'
import Home from './pages/Home'
import About from './pages/About'
import ContactUs from './pages/ContactUs'
import Location from './pages/Location'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import RoundRock from './pages/RoundRock'
import Georgetown from './pages/Georgetown'
import CedarPark from './pages/CedarPark'
import Hutto from './pages/Hutto'
import KyleBuda from './pages/KyleBuda'
import Waco from './pages/Waco'
import Taylor from './pages/Taylor'
import Pflugerville from './pages/Pflugerville'
import SanMarcos from './pages/SanMarcos'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import SignIn from './pages/SignIn'
import CreateAccount from './pages/CreateAccount'
import VerifyOtp from './pages/VerifyOtp'

export default function App() {
  useTabAttention()

  return (
    <div className="min-h-screen bg-white">
      <AgeVerificationModal />
      <CartDrawer />
      <RecentPurchasePopup />
      <ScrollToTop />
      <Canonical />
      <AnnouncementBar />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/location" element={<Location />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/round-rock" element={<RoundRock />} />
        <Route path="/georgetown" element={<Georgetown />} />
        <Route path="/cedar-park" element={<CedarPark />} />
        <Route path="/hutto" element={<Hutto />} />
        <Route path="/kyle-buda" element={<KyleBuda />} />
        <Route path="/waco" element={<Waco />} />
        <Route path="/taylor" element={<Taylor />} />
        <Route path="/pflugerville" element={<Pflugerville />} />
        <Route path="/san-marcos" element={<SanMarcos />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/shop" element={<Shop />} />
        {/* Matches the live triplebuzzsmokeshop.com Shopify site's clean
            collection URLs (e.g. /collections/batteries) — see siteData.js's
            categorySlugs/slugToCategoryLabel and Shop.jsx's resolution logic. */}
        <Route path="/collections/:slug" element={<Shop />} />
        {/* Same product page as /shop/:slug, reached with its collection
            context in the URL (e.g. /collections/batteries/products/x) —
            the param is still named "slug" so ProductDetail needs no changes
            to read it. */}
        <Route path="/collections/:collectionSlug/products/:slug" element={<ProductDetail />} />
        <Route path="/shop/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/create-account/verify" element={<VerifyOtp />} />
      </Routes>
      <Footer />
    </div>
  )
}
