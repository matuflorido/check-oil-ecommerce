import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-dark-secondary to-dark-bg py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Zap className="w-6 h-6 text-check-orange" />
            <Badge type="discount">Ofertas especiales hasta fin de mes</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-dark-text">
            Lubricantes y Accesorios
            <span className="text-check-orange"> de Calidad</span>
          </h1>
          <p className="text-xl text-dark-text-muted mb-8 max-w-2xl">
            Todo lo que necesitas para mantener tu vehículo en perfecto estado. Aceites, filtros y accesorios automotrices con descuentos exclusivos.
          </p>
          <div className="flex gap-4">
            <Link to="/productos">
              <Button>
                Ver Catálogo
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="secondary">
              Mis Compras
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Categorías Destacadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Aceites Automotrices', 'Filtros', 'Accesorios'].map((cat, i) => (
              <Link key={i} to="/productos" className="group">
                <div className="bg-dark-secondary p-8 rounded-lg hover:bg-dark-secondary/80 transition h-40 flex items-center justify-center">
                  <h3 className="text-xl font-semibold text-center group-hover:text-check-orange transition">
                    {cat}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-check-orange/10 border border-check-orange/30 py-12 px-4 mx-4 mb-16 rounded-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas asesoramiento?</h2>
          <p className="text-dark-text-muted mb-6">
            Contáctanos a franquicias@check-oil.com para ofertas personalizadas
          </p>
        </div>
      </section>
    </div>
  )
}
