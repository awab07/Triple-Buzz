import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { ProductsProvider } from './context/ProductsContext'
import { preloadHomePage } from './utils/preloadHome'
import { preloadCategoryFirstPages } from './utils/preloadCategories'
import './index.css'

// Fire immediately at boot, in parallel with React's own render — the home
// page's images and blog data are then already warm by the time anyone
// actually lands on "/", regardless of which page they open first.
preloadHomePage()
preloadCategoryFirstPages()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
