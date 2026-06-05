import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import CartItem from '../components/carrito/CartItem.jsx';
import DiscountSummary from '../components/carrito/DiscountSummary.jsx';
import Button from '../components/ui/Button.jsx';
import { useCarrito } from '../hooks/useCarrito.js';

export default function CarritoPage() {
  const navigate = useNavigate();
  const { items, subtotal, descuentos, total, aplicableOfertas, removeItem, updateQuantity, calculateCart } = useCarrito();

  useEffect(() => {
    if (items.length > 0) {
      calculateCart();
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-dark-text-muted mb-4 opacity-50" />
          <h1 className="text-3xl font-bold text-dark-text mb-2">Tu carrito está vacío</h1>
          <p className="text-dark-text-muted mb-8">
            Comienza a comprar y descubre nuestros mejores productos
          </p>
          <Link to="/productos">
            <Button className="bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold">
              Ir al catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-dark-text mb-8">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={`${item.productId}-${item.variantId || 'base'}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <Link to="/productos" className="mt-6 inline-block text-check-orange hover:text-check-orange-light">
            Continuar comprando
          </Link>
        </div>

        {/* Summary */}
        <div>
          <DiscountSummary
            subtotal={subtotal}
            descuentos={descuentos}
            total={total}
            aplicableOfertas={aplicableOfertas}
          />

          <Button
            onClick={() => navigate('/checkout')}
            className="w-full bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold py-3 rounded-lg mt-6"
          >
            Proceder al pago
          </Button>
        </div>
      </div>
    </div>
  );
}
