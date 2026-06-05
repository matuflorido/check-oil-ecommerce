import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutProgress from '../components/checkout/CheckoutProgress.jsx';
import Step1Envio from '../components/checkout/Step1Envio.jsx';
import Step2Pago from '../components/checkout/Step2Pago.jsx';
import Step3Confirmacion from '../components/checkout/Step3Confirmacion.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useCarrito } from '../hooks/useCarrito.js';
import { useUiStore } from '../store/uiStore.js';
import { pedidosApi } from '../services/pedidosApi.js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, descuentos, total, aplicableOfertas, clearCart } = useCarrito();
  const { addToast } = useUiStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      provincia: '',
    },
    metodoPago: 'mercado_pago',
  });

  useEffect(() => {
    if (items.length === 0) {
      addToast('El carrito está vacío', 'warning');
      navigate('/productos');
    }
  }, []);

  const handleStep1Next = (clienteData) => {
    setFormData((prev) => ({
      ...prev,
      cliente: clienteData,
    }));
    setCurrentStep(2);
  };

  const handleStep2Next = (pagoData) => {
    setFormData((prev) => ({
      ...prev,
      metodoPago: pagoData.metodoPago,
    }));
    setCurrentStep(3);
  };

  const handleStep3Confirm = async () => {
    try {
      setIsLoading(true);

      // Prepare order data
      const orderData = {
        items,
        cliente: formData.cliente,
        metodoPago: formData.metodoPago,
      };

      // Create order via API
      const response = await pedidosApi.createPedido(orderData);

      if (response && response.numero_pedido) {
        // Clear cart
        clearCart();

        // Show success
        addToast('Pedido creado exitosamente', 'success');

        // Redirect to confirmation
        navigate(`/pedido-confirmacion/${response.numero_pedido}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      addToast(error.message || 'Error al crear el pedido', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Spinner size="lg" className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-dark-text mb-8">Finalizar compra</h1>

      <CheckoutProgress currentStep={currentStep} />

      <div className="bg-dark-secondary rounded-lg p-8">
        {currentStep === 1 && (
          <Step1Envio
            onNext={handleStep1Next}
            initialData={formData.cliente}
          />
        )}

        {currentStep === 2 && (
          <Step2Pago
            onNext={handleStep2Next}
            onBack={() => setCurrentStep(1)}
            initialData={formData}
          />
        )}

        {currentStep === 3 && (
          <Step3Confirmacion
            cliente={formData.cliente}
            metodoPago={formData.metodoPago}
            items={items}
            subtotal={subtotal}
            descuentos={descuentos}
            total={total}
            aplicableOfertas={aplicableOfertas}
            onConfirm={handleStep3Confirm}
            onBack={() => setCurrentStep(2)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
