import { Link } from 'react-router-dom'
import { ShoppingCart, Search, Menu } from 'lucide-react'
import { useState } from 'react'
import { useCarritoStore } from '../../store/carritoStore.js'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const items = useCarritoStore((state) => state.items)
  const cartCount = items.length

  return (
    <header className="sticky top-0 z-50 bg-dark-secondary border-b border-dark-text/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-check-orange rounded flex items-center justify-center">
              <span className="text-dark-bg font-bold text-sm">☑</span>
            </div>
            <span className="text-xl font-bold text-check-orange hidden sm:inline">
              Check Oil
            </span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 bg-dark-bg border border-dark rounded text-dark-text text-sm focus:outline-none focus:border-check-orange"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-dark-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/carrito" className="relative group">
              <ShoppingCart className="w-6 h-6 group-hover:text-check-orange transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-check-orange text-dark-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-dark-bg rounded"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 border-t border-dark">
            <Link to="/productos" className="block px-4 py-2 text-check-orange hover:bg-dark-bg rounded">
              Catálogo
            </Link>
            <Link to="/mis-compras" className="block px-4 py-2 hover:text-check-orange rounded">
              Mis Compras
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
