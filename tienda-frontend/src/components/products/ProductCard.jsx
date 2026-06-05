import { ShoppingCart, AlertCircle, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function ProductCard({ product, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false);
  const hasDiscount = product.descuentoTotal > 0;
  const discountPercent = product.precio_base > 0
    ? Math.round((product.descuentoTotal / product.precio_base) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  const outOfStock = product.stock_actual <= 0;

  return (
    <Link to={`/productos/${product.id}`}>
      <div className="h-full flex flex-col bg-dark-secondary rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group border border-dark-bg">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-dark-bg to-dark-secondary h-64 flex items-center justify-center flex-shrink-0">
          {product.imagen_url ? (
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-dark-text-muted group-hover:text-check-orange transition-colors">
              <Droplet className="w-16 h-16 opacity-40" />
              <span className="text-sm font-medium">Sin imagen</span>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-check-orange to-orange-600 text-dark-bg px-4 py-2 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform">
              <span className="text-xs block opacity-75">Oferta</span>
              <span className="text-lg">-{discountPercent}%</span>
            </div>
          )}

          {/* Stock Badge - Low Stock */}
          {product.stock_actual > 0 && product.stock_actual <= 5 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              ⚠️ Último stock
            </div>
          )}

          {/* Stock Badge - Out of Stock */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                <span className="text-white font-bold">Agotado</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          {/* Product Name */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-dark-text line-clamp-2 group-hover:text-check-orange transition-colors duration-300 leading-tight">
              {product.nombre}
            </h3>
          </div>

          {/* Price Section */}
          <div className="mb-5 bg-dark-bg rounded-xl p-3">
            {hasDiscount ? (
              <div className="space-y-1">
                <span className="text-xs text-dark-text-muted line-through block">
                  ${product.precio_base.toFixed(2)}
                </span>
                <span className="text-2xl font-black text-check-orange block">
                  ${product.precioFinal.toFixed(2)}
                </span>
                <span className="text-xs text-green-400 font-semibold block">
                  Ahorras ${product.descuentoTotal.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-black text-dark-text block">
                ${product.precio_base.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={outOfStock || isAdding}
            className="w-full bg-gradient-to-r from-check-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-dark-bg font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAdding ? 'Añadiendo...' : 'Añadir al carrito'}
          </Button>
        </div>
      </div>
    </Link>
  );
}
