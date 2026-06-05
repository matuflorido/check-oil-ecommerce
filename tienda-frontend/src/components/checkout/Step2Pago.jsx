import { useState } from 'react';
import { CreditCard, Banknote, DollarSign } from 'lucide-react';
import Button from '../ui/Button.jsx';

const PAYMENT_METHODS = [
  {
    id: 'mercado_pago',
    nombre: 'Mercado Pago',
    descripcion: 'Tarjeta de crédito, débito o billetera',
    icon: CreditCard,
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia Bancaria',
    descripcion: 'Transferencia directa a nuestra cuenta',
    icon: Banknote,
  },
  {
    id: 'efectivo',
    nombre: 'Efectivo',
    descripcion: 'Pago en efectivo al recibir el pedido',
    icon: DollarSign,
  },
];

export default function Step2Pago({ onNext, onBack, initialData = {} }) {
  const [selectedMethod, setSelectedMethod] = useState(initialData.metodoPago || 'mercado_pago');

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ metodoPago: selectedMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <label
              key={method.id}
              className={`
                flex items-center p-4 rounded-lg cursor-pointer
                border-2 transition-colors
                ${
                  isSelected
                    ? 'border-check-orange bg-check-orange/10'
                    : 'border-dark-secondary bg-dark-secondary hover:border-check-orange'
                }
              `}
            >
              <input
                type="radio"
                name="metodoPago"
                value={method.id}
                checked={isSelected}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-4 h-4 accent-check-orange"
              />
              <Icon className="w-6 h-6 mx-4 text-check-orange" />
              <div>
                <p className="font-semibold text-dark-text">{method.nombre}</p>
                <p className="text-sm text-dark-text-muted">{method.descripcion}</p>
              </div>
            </label>
          );
        })}
      </div>

      {selectedMethod === 'efectivo' && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-100">
          <p>El pago en efectivo se realizará al momento de la entrega.</p>
        </div>
      )}

      {selectedMethod === 'transferencia' && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-100">
          <p>Recibirás los datos bancarios en el próximo paso.</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={onBack}
          className="bg-dark-secondary hover:bg-dark-bg text-dark-text px-8 py-2 rounded-lg"
        >
          Atrás
        </Button>
        <Button
          type="submit"
          className="bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold px-8 py-2 rounded-lg"
        >
          Siguiente
        </Button>
      </div>
    </form>
  );
}
