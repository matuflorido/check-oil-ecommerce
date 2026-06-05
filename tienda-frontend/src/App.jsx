import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Toast from './components/ui/Toast'
import WhatsAppButton from './components/common/WhatsAppButton'
import Home from './pages/Home'
import Productos from './pages/Productos'
import ProductoDetalle from './pages/ProductoDetalle'
import Carrito from './pages/CarritoPage'
import Checkout from './pages/CheckoutPage'
import PedidoConfirmacion from './pages/PedidoConfirmacion'
import MisCompras from './pages/MisCompras'

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <WhatsAppButton />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido-confirmacion/:numero" element={<PedidoConfirmacion />} />
          <Route path="/mis-compras" element={<MisCompras />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
