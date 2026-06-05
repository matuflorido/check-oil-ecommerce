import Button from '../ui/Button.jsx';
import DiscountSummary from '../carrito/DiscountSummary.jsx';

const PAYMENT_METHOD_LABELS = {
  mercado_pago: 'Mercado Pago',
  transferencia: 'Transferencia Bancaria',
  efectivo: 'Efectivo',
};

export default function Step3Confirmacion({
  cliente,
  metodoPago,
  items,
  subtotal,
  descuentos,
  total,
  aplicableOfertas,
  onConfirm,
  onBack,
  isLoading = false,
}) {
  return (
    <div className="space-y-8">
      {/* Order Summary */}
      <div className="bg-dark-secondary rounded-lg p-6">
        <h3 className="text-lg font-bold text-dark-text mb-4">Resumen del pedido</h3>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId || 'base'}`} className="flex justify-between">
              <span className="text-dark-text">
                {item.nombre} x{item.cantidad}
              </span>
              <span className="font-semibold text-dark-text">
                ${(item.precioUnitario * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-dark-secondary rounded-lg p-6">
        <h3 className="text-lg font-bold text-dark-text mb-4">Datos de envío</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-dark-text-muted text-sm">
          <div>
            <p className="font-semibold text-dark-text">Nombre</p>
            <p>{cliente.nombre}</p>
          </div>
          <div>
            <p className="font-semibold text-dark-text">Email</p>
            <p>{cliente.email}</p>
          </div>
          <div>
            <p className="font-semibold text-dark-text">Teléfono</p>
            <p>{cliente.telefono}</p>
          </div>
          <div>
            <p className="font-semibold text-dark-text">Dirección</p>
            <p>
              {cliente.direccion}, {cliente.ciudad}, {cliente.provincia}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-dark-secondary rounded-lg p-6">
        <h3 className="text-lg font-bold text-dark-text mb-4">Método de pago</h3>
        <p className="text-dark-text">{PAYMENT_METHOD_LABELS[metodoPago]}</p>
      </div>

      {/* Price Summary */}
      <DiscountSummary
        subtotal={subtotal}
        descuentos={descuentos}
        total={total}
        aplicableOfertas={aplicableOfertas}
      />

      {/* Confirmation Message */}
      <div className="bg-check-orange/10 border border-check-orange rounded-lg p-4">
        <p className="text-sm text-dark-text-muted">
          Al confirmar, aceptas nuestros términos y condiciones de compra. Recibirás un email de confirmación con los detalles de tu pedido.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 bg-dark-secondary hover:bg-dark-bg text-dark-text font-bold px-8 py-3 rounded-lg disabled:opacity-50"
        >
          Atrás
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Confirmando...' : 'Confirmar pedido'}
        </Button>
      </div>
    </div>
  );
}
