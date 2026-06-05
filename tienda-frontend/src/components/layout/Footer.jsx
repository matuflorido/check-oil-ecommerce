import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-secondary border-t border-dark-text/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-check-orange font-bold mb-4">Check-Oil Lubricentros</h3>
            <p className="text-dark-text-muted text-sm">
              Tu proveedor de confianza en aceites, filtros y accesorios automotrices de calidad.
            </p>
          </div>

          {/* Productos */}
          <div>
            <h4 className="font-semibold text-dark-text mb-4">Productos</h4>
            <ul className="space-y-2 text-sm text-dark-text-muted">
              <li><Link to="/productos" className="hover:text-check-orange">Catálogo</Link></li>
              <li><Link to="/" className="hover:text-check-orange">Ofertas</Link></li>
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h4 className="font-semibold text-dark-text mb-4">Cuenta</h4>
            <ul className="space-y-2 text-sm text-dark-text-muted">
              <li><Link to="/mis-compras" className="hover:text-check-orange">Mis Compras</Link></li>
              <li><a href="#" className="hover:text-check-orange">Contacto</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-dark-text mb-4">Contacto</h4>
            <p className="text-sm text-dark-text-muted">
              Email: <a href="mailto:franquicias@check-oil.com" className="text-check-orange hover:text-check-orange-light">franquicias@check-oil.com</a>
            </p>
          </div>
        </div>

        <div className="border-t border-dark-text/10 pt-8">
          <p className="text-center text-dark-text-muted text-sm">
            © 2026 Check-Oil Lubricentros. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
