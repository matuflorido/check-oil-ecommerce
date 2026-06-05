import ProductCard from './ProductCard.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function ProductGrid({ productos, loading, onAddToCart }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-dark-secondary rounded-2xl overflow-hidden animate-pulse border border-dark-bg">
            <div className="bg-gradient-to-br from-dark-bg to-dark-secondary h-64"></div>
            <div className="p-5 space-y-3">
              <div className="h-5 bg-dark-bg rounded-lg w-4/5"></div>
              <div className="h-4 bg-dark-bg rounded-lg w-3/5"></div>
              <div className="h-12 bg-dark-bg rounded-lg mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-text-muted text-lg font-medium">
          No se encontraron productos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          product={producto}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
