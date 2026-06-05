import { useState } from 'react';
import { Search, Package, Mail } from 'lucide-react';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useUiStore } from '../store/uiStore.js';
import { pedidosApi } from '../services/pedidosApi.js';

export default function MisCompras() {
  const [email, setEmail] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const { addToast } = useUiStore();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await pedidosApi.getPedidosByEmail(email);
      setPedidos(data.pedidos || []);
      setSearched(true);

      if (!data.pedidos || data.pedidos.length === 0) {
        addToast('No se encontraron pedidos para este email', 'info');
      }
    } catch (err) {
      setError(err.message || 'Error al buscar pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text mb-2">Mis Compras</h1>
        <p className="text-dark-text-muted">
          Ingresa tu email para ver el historial de tus pedidos
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            error={error}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold px-8 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            Buscar
          </Button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Spinner size="lg" className="mb-4" />
          <p className="text-dark-text-muted">Buscando pedidos...</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && searched && pedidos.length > 0 && (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-dark-secondary rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-dark-text-muted uppercase tracking-wider">
                    Número de pedido
                  </p>
                  <p className="text-lg font-bold text-check-orange">
                    {pedido.numero_pedido}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-dark-text-muted uppercase tracking-wider">
                    Fecha
                  </p>
                  <p className="text-dark-text">
                    {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-dark-text-muted uppercase tracking-wider">
                    Total
                  </p>
                  <p className="text-lg font-bold text-dark-text">
                    ${pedido.total.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-dark-text-muted uppercase tracking-wider">
                    Estado
                  </p>
                  <p className={`font-semibold ${
                    pedido.estado === 'pago_confirmado'
                      ? 'text-green-400'
                      : pedido.estado === 'pendiente'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                  }`}>
                    {pedido.estado === 'pago_confirmado'
                      ? 'Confirmado'
                      : pedido.estado === 'pendiente'
                        ? 'Pendiente'
                        : pedido.estado}
                  </p>
                </div>
              </div>

              {/* Items Preview */}
              {pedido.items && pedido.items.length > 0 && (
                <div className="border-t border-dark-bg pt-4">
                  <p className="text-sm font-semibold text-dark-text mb-2">
                    Artículos ({pedido.items.length})
                  </p>
                  <ul className="text-sm text-dark-text-muted space-y-1">
                    {pedido.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>
                        {item.Producto?.nombre || 'Producto'} x{item.cantidad}
                      </li>
                    ))}
                    {pedido.items.length > 3 && (
                      <li className="text-check-orange">
                        +{pedido.items.length - 3} más
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && searched && pedidos.length === 0 && !error && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-dark-text-muted mb-4 opacity-50" />
          <p className="text-dark-text-muted text-lg">
            No se encontraron pedidos
          </p>
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto text-dark-text-muted mb-4 opacity-50" />
          <p className="text-dark-text-muted text-lg">
            Ingresa tu email para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
