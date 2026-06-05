import { Trash2 } from 'lucide-react';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const subtotal = item.precioUnitario * item.cantidad;

  return (
    <div className="flex gap-4 p-4 bg-dark-secondary rounded-lg">
      {/* Image placeholder */}
      <div className="w-20 h-20 bg-dark-bg rounded flex items-center justify-center flex-shrink-0">
        <span className="text-dark-text-muted text-xs">Imagen</span>
      </div>

      {/* Details */}
      <div className="flex-1">
        <h4 className="font-semibold text-dark-text">{item.nombre}</h4>
        <p className="text-sm text-dark-text-muted">${item.precioUnitario.toFixed(2)} c/u</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.productId, item.variantId, item.cantidad - 1)}
          className="bg-dark-bg hover:bg-dark-secondary text-dark-text px-3 py-1 rounded transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center font-semibold text-dark-text">{item.cantidad}</span>
        <button
          onClick={() => onUpdateQuantity(item.productId, item.variantId, item.cantidad + 1)}
          className="bg-dark-bg hover:bg-dark-secondary text-dark-text px-3 py-1 rounded transition-colors"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-dark-text">${subtotal.toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.productId, item.variantId)}
        className="text-red-500 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
