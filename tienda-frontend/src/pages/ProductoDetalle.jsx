import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import PriceBadge from '../components/common/PriceBadge.jsx';
import Input from '../components/ui/Input.jsx';
import { productosApi } from '../services/productosApi.js';
import { useCarrito } from '../hooks/useCarrito.js';
import { useUiStore } from '../store/uiStore.js';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCarrito();
  const { addToast } = useUiStore();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const loadProducto = async () => {
      try {
        setLoading(true);
        const data = await productosApi.getProductoDetail(id);
        setProducto(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error cargando producto');
      } finally {
        setLoading(false);
      }
    };

    loadProducto();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      const result = await addToCart(producto, cantidad, selectedVariant);
      if (result.success) {
        addToast('Producto añadido al carrito', 'success');
        setCantidad(1);
        setSelectedVariant(null);
      }
    } catch (err) {
      addToast('Error al añadir producto', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Spinner size="lg" className="h-96" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error || 'Producto no encontrado'}</p>
        <Button onClick={() => navigate('/productos')}>Volver al catálogo</Button>
      </div>
    );
  }

  const outOfStock = producto.stock_actual <= 0;
  const finalPrice = producto.precioFinal || producto.precio_base;
  const hasDiscount = producto.descuentoTotal > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/productos')}
        className="flex items-center gap-2 text-check-orange hover:text-check-orange-light mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Volver al catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-dark-secondary rounded-lg overflow-hidden flex items-center justify-center min-h-96">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-dark-text-muted">Sin imagen</div>
          )}
        </div>

        {/* Details */}
        <div>
          {producto.category && (
            <p className="text-check-orange text-sm font-semibold mb-2">
              {producto.category.nombre}
            </p>
          )}

          <h1 className="text-3xl font-bold text-dark-text mb-4">{producto.nombre}</h1>

          {/* Price */}
          <div className="mb-6">
            <PriceBadge
              originalPrice={producto.precio_base}
              finalPrice={finalPrice}
            />
            {hasDiscount && (
              <p className="text-sm text-green-400 mt-2">
                Ahorras ${producto.descuentoTotal.toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {outOfStock ? (
              <p className="text-red-500 font-semibold">Agotado</p>
            ) : (
              <p className="text-green-400 font-semibold">
                Stock disponible: {producto.stock_actual}
              </p>
            )}
          </div>

          {/* Variants */}
          {producto.variants && producto.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-text mb-2">
                Variantes
              </label>
              <div className="flex flex-wrap gap-2">
                {producto.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedVariant === variant.id
                        ? 'bg-check-orange text-dark-bg'
                        : 'bg-dark-secondary text-dark-text hover:border-check-orange'
                    }`}
                  >
                    {variant.nombre}
                    {variant.precio_ajuste > 0 && (
                      <span className="text-xs ml-1">+${variant.precio_ajuste.toFixed(2)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark-text mb-2">
              Cantidad
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="bg-dark-secondary hover:bg-dark-bg text-dark-text px-4 py-2 rounded-lg transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={producto.stock_actual}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-2 bg-dark-secondary text-dark-text text-center rounded-lg focus:outline-none"
              />
              <button
                onClick={() => setCantidad(Math.min(producto.stock_actual, cantidad + 1))}
                className="bg-dark-secondary hover:bg-dark-bg text-dark-text px-4 py-2 rounded-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={outOfStock || isAdding}
            className="w-full bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold py-3 rounded-lg mb-4 disabled:opacity-50"
          >
            {isAdding ? 'Añadiendo...' : 'Añadir al carrito'}
          </Button>

          {/* Applicable Offers */}
          {producto.aplicableOfertas && producto.aplicableOfertas.length > 0 && (
            <div className="bg-dark-secondary rounded-lg p-4 mt-6">
              <h3 className="text-sm font-bold text-check-orange mb-2">Ofertas aplicables</h3>
              {producto.aplicableOfertas.map((oferta) => (
                <p key={oferta.id} className="text-xs text-dark-text-muted">
                  {oferta.nombre}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
