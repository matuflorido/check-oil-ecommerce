import { Gift } from 'lucide-react';

export default function DiscountSummary({ subtotal, descuentos, total, aplicableOfertas = [] }) {
  return (
    <div className="bg-dark-secondary rounded-lg p-6">
      {/* Pricing Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-dark-text">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {descuentos > 0 && (
          <div className="flex justify-between text-green-400 font-semibold">
            <span>Descuento</span>
            <span>-${descuentos.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-dark-bg pt-3 flex justify-between text-lg font-bold text-dark-text">
          <span>Total</span>
          <span className="text-check-orange">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Applied Offers */}
      {aplicableOfertas && aplicableOfertas.length > 0 && (
        <div className="bg-dark-bg rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 text-check-orange">
            <Gift className="w-5 h-5" />
            <h4 className="font-semibold">Ofertas aplicadas</h4>
          </div>
          <ul className="space-y-2">
            {aplicableOfertas.map((oferta) => (
              <li key={oferta.id} className="text-sm text-dark-text-muted">
                <span className="inline-block bg-check-orange/20 text-check-orange px-2 py-1 rounded text-xs mr-2">
                  -{oferta.porcentaje || '10'}%
                </span>
                {oferta.nombre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
