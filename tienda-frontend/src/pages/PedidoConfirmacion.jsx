import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Mail, Home } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function PedidoConfirmacion() {
  const { numero } = useParams();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center">
        {/* Success Icon */}
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

        {/* Title */}
        <h1 className="text-4xl font-bold text-dark-text mb-2">
          ¡Pedido confirmado!
        </h1>

        {/* Order Number */}
        <div className="bg-dark-secondary rounded-lg p-6 my-8">
          <p className="text-dark-text-muted text-sm mb-2">Número de pedido</p>
          <p className="text-3xl font-bold text-check-orange">{numero}</p>
        </div>

        {/* Message */}
        <p className="text-dark-text-muted text-lg mb-8">
          Tu pedido ha sido creado exitosamente. Recibirás un email de confirmación con los detalles.
        </p>

        {/* What's Next */}
        <div className="bg-dark-secondary rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-bold text-dark-text mb-4">Próximos pasos</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-check-orange flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-dark-text">Confirma tu email</p>
                <p className="text-sm text-dark-text-muted">
                  Revisa tu bandeja de entrada para el email de confirmación del pedido
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-check-orange flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-dark-text">Prepararemos tu pedido</p>
                <p className="text-sm text-dark-text-muted">
                  Nos pondremos en contacto para coordinar la entrega
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Home className="w-6 h-6 text-check-orange flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-dark-text">Recibirás tu pedido</p>
                <p className="text-sm text-dark-text-muted">
                  Te entregaremos tu compra según lo acordado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link to="/mis-compras" className="flex-1">
            <Button className="w-full bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold py-3 rounded-lg">
              Ver mis compras
            </Button>
          </Link>

          <Link to="/productos" className="flex-1">
            <Button className="w-full bg-dark-secondary hover:bg-dark-bg text-dark-text font-bold py-3 rounded-lg">
              Continuar comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
