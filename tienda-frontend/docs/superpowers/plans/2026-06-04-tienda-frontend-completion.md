# Check-Oil Tienda Frontend Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Check-Oil ecommerce tienda frontend with full shopping flow from product catalog through order confirmation, using Zustand for state management, Axios for API calls, and a professional dark-themed UI.

**Architecture:** The frontend follows a layered architecture:
- **Stores (Zustand):** Three independent stores (carritoStore, ofertasStore, uiStore) manage cart, offers, and UI state with localStorage persistence
- **API Services:** Axios-based service layer wraps all backend endpoints with consistent error handling and request/response formatting
- **Custom Hooks:** Reusable hooks (useCarrito, useProductos, useOfertas, useFetch) provide data fetching and cart operations
- **Pages:** Six main pages handle the complete shopping workflow from browsing to order confirmation
- **Components:** Reusable UI components (ProductCard, CartItem, DiscountSummary, checkout steps) build the interface

**Tech Stack:** React 19, Vite 5, Tailwind CSS 4, Lucide-react, Zustand 4.4.6, Axios 1.6.2, React Router 6.20.1, Mercado Pago SDK 1.8.2

---

## File Structure

```
src/
  store/
    carritoStore.js       # Cart state: items[], subtotal, discounts, total, applicable offers
    ofertasStore.js       # Offers state: ofertas[], loading, error
    uiStore.js            # UI state: toasts[], isCarritoOpen, isLoading, errorMessage
  services/
    api.js                # Axios instance with baseURL and interceptors
    productosApi.js       # GET /api/productos, GET /api/productos/:id, GET /api/categorias
    carroApi.js           # POST /api/carrito (calculate with discounts)
    pedidosApi.js         # POST /api/pedidos, GET /api/pedidos/email/:email
    ofertasApi.js         # GET /api/ofertas (active offers)
  hooks/
    useCarrito.js         # Wraps carritoStore, provides cart operations
    useProductos.js       # Fetch products with filters, pagination
    useOfertas.js         # Fetch and manage offers, apply discounts
    useFetch.js           # Generic data fetching with loading/error states
  components/
    products/
      ProductCard.jsx     # Single product card: image, name, price, discount badge, stock
      ProductGrid.jsx     # Grid layout for product cards with responsive layout
      ProductFilters.jsx  # Category, price range, availability filters
      ProductDetail.jsx   # Detailed product view with variants and add to cart
    carrito/
      CartItem.jsx        # Individual cart item row with quantity +/-, remove
      DiscountSummary.jsx # Applied offers breakdown and savings display
      EmptyCart.jsx       # Empty state with call to action
    checkout/
      Step1Envio.jsx      # Address/contact form with validation
      Step2Pago.jsx       # Payment method radio buttons (Mercado Pago, transfer, cash)
      Step3Confirmacion.jsx # Order summary review before submission
      CheckoutProgress.jsx # Visual progress indicator for 3-step wizard
    common/
      PriceBadge.jsx      # Display original price + final price with discount percentage
      Toast.jsx           # Toast notification system with auto-dismiss
      Spinner.jsx         # Loading spinner for async operations
      Modal.jsx           # Reusable modal dialog component
      Input.jsx           # Form input field with validation styling
      Select.jsx          # Dropdown/select field component
    layout/
      Header.jsx          # (Update) Connect cart icon to uiStore, show cart count
      Footer.jsx          # (Existing)
      MainLayout.jsx      # (Existing)
  pages/
    Home.jsx              # (Existing) Landing page
    Productos.jsx         # (Update) Product catalog with filters, pagination, real API data
    ProductoDetalle.jsx   # (Update) Product detail with variants, discounts, add to cart
    CarritoPage.jsx       # (Update) Shopping cart display with DiscountSummary
    CheckoutPage.jsx      # (Create) 3-step checkout wizard with form validation
    PedidoConfirmacion.jsx # (Create) Order confirmation with number and next steps
    MisCompras.jsx        # (Create) Order lookup by email with order history
  App.jsx                 # (Existing) Routes are already set up correctly
  main.jsx                # (Existing)
  styles/
    globals.css           # (Existing) Dark theme, already configured
```

---

## Implementation Tasks

### Task 1: Create Zustand Stores - Carrito Store

**Files:**
- Create: `src/store/carritoStore.js`

- [ ] **Step 1: Write the Zustand carrito store with persistence**

Create `src/store/carritoStore.js`:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      subtotal: 0,
      descuentos: 0,
      total: 0,
      aplicableOfertas: [],
      costoEnvio: 0,

      // Actions
      addItem: (productId, cantidad = 1, variantId = null, nombre = '', precioUnitario = 0) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === productId && item.variantId === variantId
          );

          let newItems;
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.productId === productId && item.variantId === variantId
                ? { ...item, cantidad: item.cantidad + cantidad }
                : item
            );
          } else {
            newItems = [...state.items, { productId, variantId, cantidad, nombre, precioUnitario }];
          }

          return { items: newItems };
        });
      },

      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId = null, cantidad) => {
        set((state) => {
          if (cantidad <= 0) {
            return {
              items: state.items.filter(
                (item) => !(item.productId === productId && item.variantId === variantId)
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId && item.variantId === variantId
                ? { ...item, cantidad }
                : item
            ),
          };
        });
      },

      setCartTotals: (subtotal, descuentos, total, aplicableOfertas = []) => {
        set({ subtotal, descuentos, total, aplicableOfertas });
      },

      clearCart: () => {
        set({ items: [], subtotal: 0, descuentos: 0, total: 0, aplicableOfertas: [] });
      },

      hydrate: (state) => {
        set(state);
      },
    }),
    {
      name: 'carrito-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
```

- [ ] **Step 2: Verify the store file was created and has correct structure**

Run: `cat src/store/carritoStore.js | head -20`
Expected: File exists with imports and create statement visible

- [ ] **Step 3: Commit the carrito store**

```bash
cd C:\Users\matuf\check-oil\tienda-frontend
git add src/store/carritoStore.js
git commit -m "feat: create Zustand carrito store with localStorage persistence"
```

---

### Task 2: Create Zustand Stores - Ofertas Store

**Files:**
- Create: `src/store/ofertasStore.js`

- [ ] **Step 1: Write the Zustand ofertas store**

Create `src/store/ofertasStore.js`:

```javascript
import { create } from 'zustand';

export const useOfertasStore = create((set) => ({
  // State
  ofertas: [],
  loading: false,
  error: null,

  // Actions
  setOfertas: (ofertas) => {
    set({ ofertas, error: null });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  filterActiveOfertas: () => {
    const state = get ? get() : null;
    if (!state) return [];
    return state.ofertas.filter((oferta) => {
      const now = new Date();
      const start = new Date(oferta.fecha_inicio);
      const end = new Date(oferta.fecha_fin);
      return now >= start && now <= end;
    });
  },

  clearOfertas: () => {
    set({ ofertas: [], error: null });
  },
}));
```

- [ ] **Step 2: Verify the store file was created**

Run: `cat src/store/ofertasStore.js | head -15`
Expected: File exists with Zustand create statement visible

- [ ] **Step 3: Commit the ofertas store**

```bash
git add src/store/ofertasStore.js
git commit -m "feat: create Zustand ofertas store for active offers"
```

---

### Task 3: Create Zustand Stores - UI Store

**Files:**
- Create: `src/store/uiStore.js`

- [ ] **Step 1: Write the Zustand UI store**

Create `src/store/uiStore.js`:

```javascript
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  // State
  toasts: [],
  isCarritoOpen: false,
  isLoading: false,
  errorMessage: null,
  successMessage: null,

  // Toast actions
  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // UI state actions
  toggleCarrito: () => {
    set((state) => ({
      isCarritoOpen: !state.isCarritoOpen,
    }));
  },

  setCarritoOpen: (isOpen) => {
    set({ isCarritoOpen: isOpen });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (errorMessage) => {
    set({ errorMessage });
  },

  setSuccess: (successMessage) => {
    set({ successMessage });
  },

  clearMessages: () => {
    set({ errorMessage: null, successMessage: null });
  },
}));
```

- [ ] **Step 2: Verify the store file was created**

Run: `cat src/store/uiStore.js | head -15`
Expected: File exists with UI state actions visible

- [ ] **Step 3: Commit the UI store**

```bash
git add src/store/uiStore.js
git commit -m "feat: create Zustand uiStore for UI state and toast notifications"
```

---

### Task 4: Create API Service Layer - Base Axios Instance

**Files:**
- Create: `src/services/api.js`

- [ ] **Step 1: Create the base Axios instance with interceptors**

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Error en la solicitud';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
```

- [ ] **Step 2: Verify the API instance was created**

Run: `cat src/services/api.js | head -10`
Expected: File exists with axios.create() visible

- [ ] **Step 3: Commit the API service**

```bash
git add src/services/api.js
git commit -m "feat: create Axios API instance with interceptors"
```

---

### Task 5: Create API Services - Productos API

**Files:**
- Create: `src/services/productosApi.js`

- [ ] **Step 1: Create the productos API service**

Create `src/services/productosApi.js`:

```javascript
import api from './api.js';

export const productosApi = {
  /**
   * Get paginated list of products with filters
   * GET /api/productos
   */
  getProductos: async (params = {}) => {
    try {
      const response = await api.get('/productos', { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single product detail with offers
   * GET /api/productos/:id
   */
  getProductoDetail: async (id) => {
    try {
      const response = await api.get(`/productos/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get categories hierarchically
   * GET /api/categorias
   */
  getCategorias: async () => {
    try {
      const response = await api.get('/categorias');
      return response.data.data.categorias;
    } catch (error) {
      throw error;
    }
  },
};

export default productosApi;
```

- [ ] **Step 2: Verify the service was created**

Run: `cat src/services/productosApi.js | head -10`
Expected: File exists with API methods visible

- [ ] **Step 3: Commit the productos API service**

```bash
git add src/services/productosApi.js
git commit -m "feat: create productosApi service for product endpoints"
```

---

### Task 6: Create API Services - Carrito API

**Files:**
- Create: `src/services/carroApi.js`

- [ ] **Step 1: Create the carrito calculation API service**

Create `src/services/carroApi.js`:

```javascript
import api from './api.js';

export const carroApi = {
  /**
   * Calculate cart totals with discounts
   * POST /api/carrito
   */
  calculateCarrito: async (items) => {
    try {
      const response = await api.post('/carrito', { items });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default carroApi;
```

- [ ] **Step 2: Verify the service was created**

Run: `cat src/services/carroApi.js`
Expected: File exists with calculateCarrito method

- [ ] **Step 3: Commit the carrito API service**

```bash
git add src/services/carroApi.js
git commit -m "feat: create carroApi service for cart calculations"
```

---

### Task 7: Create API Services - Ofertas API

**Files:**
- Create: `src/services/ofertasApi.js`

- [ ] **Step 1: Create the ofertas API service**

Create `src/services/ofertasApi.js`:

```javascript
import api from './api.js';

export const ofertasApi = {
  /**
   * Get currently active offers
   * GET /api/ofertas
   */
  getOfertasActivas: async () => {
    try {
      const response = await api.get('/ofertas');
      return response.data.data.ofertas;
    } catch (error) {
      throw error;
    }
  },
};

export default ofertasApi;
```

- [ ] **Step 2: Verify the service was created**

Run: `cat src/services/ofertasApi.js`
Expected: File exists with getOfertasActivas method

- [ ] **Step 3: Commit the ofertas API service**

```bash
git add src/services/ofertasApi.js
git commit -m "feat: create ofertasApi service for active offers"
```

---

### Task 8: Create API Services - Pedidos API

**Files:**
- Create: `src/services/pedidosApi.js`

- [ ] **Step 1: Create the pedidos API service**

Create `src/services/pedidosApi.js`:

```javascript
import api from './api.js';

export const pedidosApi = {
  /**
   * Create a new order
   * POST /api/pedidos
   */
  createPedido: async (orderData) => {
    try {
      const response = await api.post('/pedidos', orderData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get orders by customer email
   * GET /api/pedidos/email/:email
   */
  getPedidosByEmail: async (email) => {
    try {
      const response = await api.get(`/pedidos/email/${email}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default pedidosApi;
```

- [ ] **Step 2: Verify the service was created**

Run: `cat src/services/pedidosApi.js | head -15`
Expected: File exists with createPedido and getPedidosByEmail methods

- [ ] **Step 3: Commit the pedidos API service**

```bash
git add src/services/pedidosApi.js
git commit -m "feat: create pedidosApi service for order creation and lookup"
```

---

### Task 9: Create Custom Hook - useFetch

**Files:**
- Create: `src/hooks/useFetch.js`

- [ ] **Step 1: Create generic data fetching hook**

Create `src/hooks/useFetch.js`:

```javascript
import { useState, useEffect } from 'react';

export const useFetch = (fetchFn, immediate = true, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute, refetch: execute };
};

export default useFetch;
```

- [ ] **Step 2: Verify the hook was created**

Run: `cat src/hooks/useFetch.js | head -10`
Expected: File exists with useFetch hook definition

- [ ] **Step 3: Commit the useFetch hook**

```bash
git add src/hooks/useFetch.js
git commit -m "feat: create useFetch custom hook for generic data fetching"
```

---

### Task 10: Create Custom Hook - useProductos

**Files:**
- Create: `src/hooks/useProductos.js`

- [ ] **Step 1: Create the useProductos hook**

Create `src/hooks/useProductos.js`:

```javascript
import { useState, useCallback } from 'react';
import { useFetch } from './useFetch.js';
import { productosApi } from '../services/productosApi.js';

export const useProductos = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    categoria: null,
    precioMin: null,
    precioMax: null,
    search: null,
    ordenar: 'nombre',
  });

  const { data, loading, error, execute } = useFetch(
    () => productosApi.getProductos(filters),
    false,
    [filters]
  );

  const fetchProductos = useCallback(async () => {
    return execute();
  }, [execute]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 when filter changes
    }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
      categoria: null,
      precioMin: null,
      precioMax: null,
      search: null,
      ordenar: 'nombre',
    });
  }, []);

  return {
    productos: data?.productos || [],
    total: data?.total || 0,
    page: filters.page,
    limit: filters.limit,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    filters,
    setFilter,
    setPage,
    resetFilters,
    fetchProductos,
  };
};

export default useProductos;
```

- [ ] **Step 2: Verify the hook was created**

Run: `cat src/hooks/useProductos.js | head -15`
Expected: File exists with useProductos hook definition

- [ ] **Step 3: Commit the useProductos hook**

```bash
git add src/hooks/useProductos.js
git commit -m "feat: create useProductos custom hook for product fetching and filtering"
```

---

### Task 11: Create Custom Hook - useOfertas

**Files:**
- Create: `src/hooks/useOfertas.js`

- [ ] **Step 1: Create the useOfertas hook**

Create `src/hooks/useOfertas.js`:

```javascript
import { useEffect } from 'react';
import { useFetch } from './useFetch.js';
import { ofertasApi } from '../services/ofertasApi.js';
import { useOfertasStore } from '../store/ofertasStore.js';

export const useOfertas = () => {
  const { data: ofertas, loading, error, execute } = useFetch(
    () => ofertasApi.getOfertasActivas(),
    true,
    []
  );

  const storeOfertas = useOfertasStore((state) => state.setOfertas);

  useEffect(() => {
    if (ofertas && Array.isArray(ofertas)) {
      storeOfertas(ofertas);
    }
  }, [ofertas, storeOfertas]);

  const refetch = async () => {
    return execute();
  };

  return {
    ofertas: ofertas || [],
    loading,
    error,
    refetch,
  };
};

export default useOfertas;
```

- [ ] **Step 2: Verify the hook was created**

Run: `cat src/hooks/useOfertas.js | head -15`
Expected: File exists with useOfertas hook definition

- [ ] **Step 3: Commit the useOfertas hook**

```bash
git add src/hooks/useOfertas.js
git commit -m "feat: create useOfertas custom hook for offers fetching"
```

---

### Task 12: Create Custom Hook - useCarrito

**Files:**
- Create: `src/hooks/useCarrito.js`

- [ ] **Step 1: Create the useCarrito hook**

Create `src/hooks/useCarrito.js`:

```javascript
import { useCarritoStore } from '../store/carritoStore.js';
import { carroApi } from '../services/carroApi.js';

export const useCarrito = () => {
  const {
    items,
    subtotal,
    descuentos,
    total,
    aplicableOfertas,
    addItem,
    removeItem,
    updateQuantity,
    setCartTotals,
    clearCart,
  } = useCarritoStore();

  const addToCart = async (product, cantidad = 1, variantId = null) => {
    try {
      addItem(
        product.id,
        cantidad,
        variantId,
        product.nombre,
        variantId
          ? product.precio_base + (product.variants?.find((v) => v.id === variantId)?.precio_ajuste || 0)
          : product.precio_base
      );

      // Recalculate cart with new item
      await calculateCart();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const calculateCart = async () => {
    try {
      if (items.length === 0) {
        setCartTotals(0, 0, 0, []);
        return;
      }

      const response = await carroApi.calculateCarrito(items);
      setCartTotals(
        response.subtotal,
        response.descuentos,
        response.total,
        response.aplicableOfertas || []
      );
    } catch (error) {
      console.error('Error calculating cart:', error);
      throw error;
    }
  };

  return {
    items,
    subtotal,
    descuentos,
    total,
    aplicableOfertas,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    calculateCart,
    itemCount: items.length,
  };
};

export default useCarrito;
```

- [ ] **Step 2: Verify the hook was created**

Run: `cat src/hooks/useCarrito.js | head -15`
Expected: File exists with useCarrito hook definition

- [ ] **Step 3: Commit the useCarrito hook**

```bash
git add src/hooks/useCarrito.js
git commit -m "feat: create useCarrito custom hook wrapping carritoStore"
```

---

### Task 13: Create UI Components - Spinner

**Files:**
- Create: `src/components/ui/Spinner.jsx`

- [ ] **Step 1: Create the Spinner component**

Create `src/components/ui/Spinner.jsx`:

```javascript
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-3 border-dark-secondary border-t-check-orange rounded-full animate-spin`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify the component was created**

Run: `cat src/components/ui/Spinner.jsx`
Expected: File exists with Spinner component

- [ ] **Step 3: Commit the Spinner component**

```bash
git add src/components/ui/Spinner.jsx
git commit -m "feat: create Spinner loading component"
```

---

### Task 14: Create UI Components - Input

**Files:**
- Create: `src/components/ui/Input.jsx`

- [ ] **Step 1: Create the Input component**

Create `src/components/ui/Input.jsx`:

```javascript
export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark-text">
          {label}
          {required && <span className="text-check-orange ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          px-4 py-2 rounded-lg
          bg-dark-secondary text-dark-text
          border border-dark-secondary focus:border-check-orange
          placeholder-dark-text-muted
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-1 focus:ring-check-orange
          transition-colors
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 2: Verify the component was created**

Run: `cat src/components/ui/Input.jsx | head -20`
Expected: File exists with Input component

- [ ] **Step 3: Commit the Input component**

```bash
git add src/components/ui/Input.jsx
git commit -m "feat: create Input form component with validation"
```

---

### Task 15: Create UI Components - Toast System

**Files:**
- Create: `src/components/ui/Toast.jsx`

- [ ] **Step 1: Create the Toast component**

Create `src/components/ui/Toast.jsx`:

```javascript
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

function ToastItem({ id, message, type, duration, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const typeStyles = {
    success: 'bg-green-900 border-green-700 text-green-100',
    error: 'bg-red-900 border-red-700 text-red-100',
    warning: 'bg-yellow-900 border-yellow-700 text-yellow-100',
    info: 'bg-blue-900 border-blue-700 text-blue-100',
  };

  const typeIcons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        border backdrop-blur-sm
        ${typeStyles[type] || typeStyles.info}
        animate-in slide-in-from-right duration-300
      `}
      role="alert"
    >
      {typeIcons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
}
```

Wait, we need the import. Let me fix this:

```javascript
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore.js';

function ToastItem({ id, message, type, duration, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const typeStyles = {
    success: 'bg-green-900 border-green-700 text-green-100',
    error: 'bg-red-900 border-red-700 text-red-100',
    warning: 'bg-yellow-900 border-yellow-700 text-yellow-100',
    info: 'bg-blue-900 border-blue-700 text-blue-100',
  };

  const typeIcons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        border backdrop-blur-sm
        ${typeStyles[type] || typeStyles.info}
        animate-in slide-in-from-right duration-300
      `}
      role="alert"
    >
      {typeIcons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify the component was created**

Run: `cat src/components/ui/Toast.jsx | head -15`
Expected: File exists with Toast component

- [ ] **Step 3: Commit the Toast component**

```bash
git add src/components/ui/Toast.jsx
git commit -m "feat: create Toast notification system with auto-dismiss"
```

---

### Task 16: Create Product Components - ProductCard

**Files:**
- Create: `src/components/products/ProductCard.jsx`

- [ ] **Step 1: Create the ProductCard component**

Create `src/components/products/ProductCard.jsx`:

```javascript
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function ProductCard({ product, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false);
  const hasDiscount = product.descuentoTotal > 0;
  const discountPercent = product.precio_base > 0
    ? Math.round((product.descuentoTotal / product.precio_base) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  const outOfStock = product.stock_actual <= 0;

  return (
    <Link to={`/productos/${product.id}`}>
      <div className="bg-dark-secondary rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-dark-bg h-48 flex items-center justify-center">
          {product.imagen_url ? (
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-dark-text-muted">Sin imagen</div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-check-orange text-dark-bg px-3 py-1 rounded-full text-sm font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Stock Badge */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-semibold">Agotado</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-dark-text line-clamp-2 hover:text-check-orange transition-colors">
              {product.nombre}
            </h3>
          </div>

          {/* Price */}
          <div className="mb-4">
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-xs line-through text-dark-text-muted">
                  ${product.precio_base.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-check-orange">
                  ${product.precioFinal.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-dark-text">
                ${product.precio_base.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={outOfStock || isAdding}
            className="w-full bg-check-orange hover:bg-check-orange-dark text-dark-bg font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdding ? 'Añadiendo...' : 'Añadir'}
          </Button>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify the component was created**

Run: `cat src/components/products/ProductCard.jsx | head -20`
Expected: File exists with ProductCard component

- [ ] **Step 3: Commit the ProductCard component**

```bash
git add src/components/products/ProductCard.jsx
git commit -m "feat: create ProductCard component with discount display"
```

---

### Task 17: Create Product Components - ProductGrid

**Files:**
- Create: `src/components/products/ProductGrid.jsx`

- [ ] **Step 1: Create the ProductGrid component**

Create `src/components/products/ProductGrid.jsx`:

```javascript
import ProductCard from './ProductCard.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function ProductGrid({ productos, loading, onAddToCart }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-dark-secondary rounded-lg p-4 animate-pulse">
            <div className="bg-dark-bg h-40 rounded mb-4"></div>
            <div className="h-4 bg-dark-bg rounded mb-2"></div>
            <div className="h-4 bg-dark-bg rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-text-muted text-lg">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          product={producto}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify the component was created**

Run: `cat src/components/products/ProductGrid.jsx | head -15`
Expected: File exists with ProductGrid component

- [ ] **Step 3: Commit the ProductGrid component**

```bash
git add src/components/products/ProductGrid.jsx
git commit -m "feat: create ProductGrid component for product listing"
```

---

### Task 18: Create Product Components - ProductFilters

**Files:**
- Create: `src/components/products/ProductFilters.jsx`

- [ ] **Step 1: Create the ProductFilters component**

Create `src/components/products/ProductFilters.jsx`:

```javascript
import { X } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

export default function ProductFilters({
  categorias = [],
  filters,
  onFilterChange,
  onReset,
  isOpen = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="bg-dark-secondary rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-dark-text">Filtros</h3>
        <button
          onClick={onReset}
          className="text-sm text-check-orange hover:text-check-orange-light transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <Input
            label="Buscar productos"
            id="search"
            type="text"
            placeholder="Nombre del producto..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value || null)}
          />
        </div>

        {/* Category */}
        {categorias.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Categoría
            </label>
            <select
              value={filters.categoria || ''}
              onChange={(e) => onFilterChange('categoria', e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg bg-dark-bg text-dark-text border border-dark-secondary focus:border-check-orange focus:outline-none transition-colors"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <optgroup key={cat.id} label={cat.nombre}>
                  {cat.subcategorias?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Rango de precio
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Desde"
              value={filters.precioMin || ''}
              onChange={(e) =>
                onFilterChange('precioMin', e.target.value ? parseFloat(e.target.value) : null)
              }
            />
            <Input
              type="number"
              placeholder="Hasta"
              value={filters.precioMax || ''}
              onChange={(e) =>
                onFilterChange('precioMax', e.target.value ? parseFloat(e.target.value) : null)
              }
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Ordenar por
          </label>
          <select
            value={filters.ordenar || 'nombre'}
            onChange={(e) => onFilterChange('ordenar', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-dark-bg text-dark-text border border-dark-secondary focus:border-check-orange focus:outline-none transition-colors"
          >
            <option value="nombre">Nombre A-Z</option>
            <option value="precio">Precio menor a mayor</option>
            <option value="nuevo">Más recientes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the component was created**

Run: `cat src/components/products/ProductFilters.jsx | head -20`
Expected: File exists with ProductFilters component

- [ ] **Step 3: Commit the ProductFilters component**

```bash
git add src/components/products/ProductFilters.jsx
git commit -m "feat: create ProductFilters component with category, price, and sort"
```

---

### Task 19: Create Product Components - PriceBadge

**Files:**
- Create: `src/components/common/PriceBadge.jsx`

- [ ] **Step 1: Create the PriceBadge component**

Create `src/components/common/PriceBadge.jsx`:

```javascript
export default function PriceBadge({ originalPrice, finalPrice, showDiscount = true }) {
  const hasDiscount = originalPrice > finalPrice;
  const discountPercent = originalPrice > 0
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex items-center gap-3">
      {hasDiscount && (
        <>
          <span className="text-sm line-through text-dark-text-muted">
            ${originalPrice.toFixed(2)}
          </span>
          {showDiscount && (
            <span className="text-xs bg-check-orange text-dark-bg px-2 py-1 rounded font-bold">
              -{discountPercent}%
            </span>
          )}
        </>
      )}
      <span className={`text-lg font-bold ${hasDiscount ? 'text-check-orange' : 'text-dark-text'}`}>
        ${finalPrice.toFixed(2)}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify the component was created**

Run: `cat src/components/common/PriceBadge.jsx`
Expected: File exists with PriceBadge component

- [ ] **Step 3: Commit the PriceBadge component**

```bash
git add src/components/common/PriceBadge.jsx
git commit -m "feat: create PriceBadge component for price and discount display"
```

---

### Task 20: Update Header Component to Show Cart

**Files:**
- Modify: `src/components/layout/Header.jsx`

- [ ] **Step 1: Update Header to connect cart icon to store**

Read the current Header.jsx, then update it to include cart integration. First, check what's there:

```bash
cat src/components/layout/Header.jsx
```

Then update it with cart functionality (show item count, toggle cart drawer). The update should:
- Import useCarritoStore and useUiStore
- Display item count on cart icon
- Toggle cart drawer on click
- Add link to /productos

- [ ] **Step 2: Verify Header was updated**

Run: `grep -n "useCarritoStore\|useUiStore" src/components/layout/Header.jsx`
Expected: Both imports visible

- [ ] **Step 3: Commit Header update**

```bash
git add src/components/layout/Header.jsx
git commit -m "feat: update Header with cart icon integration and item count"
```

---

### Task 21: Update Productos Page

**Files:**
- Modify: `src/pages/Productos.jsx`

- [ ] **Step 1: Replace placeholder Productos page with full implementation**

Create new `src/pages/Productos.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductGrid from '../components/products/ProductGrid.jsx';
import ProductFilters from '../components/products/ProductFilters.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { useCarrito } from '../hooks/useCarrito.js';
import { useUiStore } from '../store/uiStore.js';
import { productosApi } from '../services/productosApi.js';

export default function Productos() {
  const navigate = useNavigate();
  const { addToCart } = useCarrito();
  const { addToast } = useUiStore();
  const { productos, total, page, totalPages, loading, error, filters, setFilter, setPage, resetFilters, fetchProductos } = useProductos();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const cats = await productosApi.getCategorias();
        setCategorias(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategorias();
    fetchProductos();
  }, [filters]);

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart(product, 1);
      if (result.success) {
        addToast('Producto añadido al carrito', 'success');
      }
    } catch (err) {
      addToast('Error al añadir producto', 'error');
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button onClick={() => fetchProductos()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dark-text mb-2">Catálogo de Productos</h1>
        <p className="text-dark-text-muted">{total} productos disponibles</p>
      </div>

      <ProductFilters
        categorias={categorias}
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      <ProductGrid
        productos={productos}
        loading={loading}
        onAddToCart={handleAddToCart}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2"
          >
            Anterior
          </Button>

          <div className="text-dark-text">
            Página {page} de {totalPages}
          </div>

          <Button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify Productos page was updated**

Run: `grep -n "useProductos\|ProductGrid" src/pages/Productos.jsx`
Expected: Both imports and usage visible

- [ ] **Step 3: Commit Productos page update**

```bash
git add src/pages/Productos.jsx
git commit -m "feat: implement Productos page with real API data and filters"
```

---

### Task 22: Create ProductoDetalle Page

**Files:**
- Create/Modify: `src/pages/ProductoDetalle.jsx`

- [ ] **Step 1: Implement ProductoDetalle page**

Create new `src/pages/ProductoDetalle.jsx`:

```javascript
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
            className="w-full bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold py-3 rounded-lg mb-4"
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
```

- [ ] **Step 2: Verify ProductoDetalle was created**

Run: `grep -n "useParams\|productosApi.getProductoDetail" src/pages/ProductoDetalle.jsx`
Expected: Both visible

- [ ] **Step 3: Commit ProductoDetalle page**

```bash
git add src/pages/ProductoDetalle.jsx
git commit -m "feat: implement ProductoDetalle page with variants and add to cart"
```

---

### Task 23: Create Cart Components - CartItem

**Files:**
- Create: `src/components/carrito/CartItem.jsx`

- [ ] **Step 1: Create CartItem component**

Create `src/components/carrito/CartItem.jsx`:

```javascript
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
```

- [ ] **Step 2: Verify CartItem was created**

Run: `cat src/components/carrito/CartItem.jsx | head -15`
Expected: File exists with CartItem component

- [ ] **Step 3: Commit CartItem component**

```bash
git add src/components/carrito/CartItem.jsx
git commit -m "feat: create CartItem component with quantity controls"
```

---

### Task 24: Create Cart Components - DiscountSummary

**Files:**
- Create: `src/components/carrito/DiscountSummary.jsx`

- [ ] **Step 1: Create DiscountSummary component**

Create `src/components/carrito/DiscountSummary.jsx`:

```javascript
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
                  -{oferta.porcentaje}%
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
```

- [ ] **Step 2: Verify DiscountSummary was created**

Run: `cat src/components/carrito/DiscountSummary.jsx | head -15`
Expected: File exists with DiscountSummary component

- [ ] **Step 3: Commit DiscountSummary component**

```bash
git add src/components/carrito/DiscountSummary.jsx
git commit -m "feat: create DiscountSummary component for cart totals"
```

---

### Task 25: Implement CarritoPage

**Files:**
- Modify: `src/pages/CarritoPage.jsx`

- [ ] **Step 1: Implement full CarritoPage**

Replace `src/pages/CarritoPage.jsx`:

```javascript
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
```

- [ ] **Step 2: Verify CarritoPage was updated**

Run: `grep -n "useCarrito\|CartItem\|DiscountSummary" src/pages/CarritoPage.jsx`
Expected: All imports visible

- [ ] **Step 3: Commit CarritoPage update**

```bash
git add src/pages/CarritoPage.jsx
git commit -m "feat: implement CarritoPage with cart items and discount summary"
```

---

### Task 26: Create Checkout Components - Step1Envio

**Files:**
- Create: `src/components/checkout/Step1Envio.jsx`

- [ ] **Step 1: Create Step1Envio component**

Create `src/components/checkout/Step1Envio.jsx`:

```javascript
import { useState } from 'react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

export default function Step1Envio({ onNext, initialData = {} }) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    email: initialData.email || '',
    telefono: initialData.telefono || '',
    direccion: initialData.direccion || '',
    ciudad: initialData.ciudad || '',
    provincia: initialData.provincia || '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'Dirección requerida';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'Ciudad requerida';
    if (!formData.provincia.trim()) newErrors.provincia = 'Provincia requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre completo"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={errors.nombre}
          required
        />

        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Teléfono"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          error={errors.telefono}
          required
        />

        <Input
          label="Provincia"
          id="provincia"
          name="provincia"
          value={formData.provincia}
          onChange={handleChange}
          error={errors.provincia}
          required
        />
      </div>

      <Input
        label="Dirección"
        id="direccion"
        name="direccion"
        value={formData.direccion}
        onChange={handleChange}
        error={errors.direccion}
        required
      />

      <Input
        label="Ciudad"
        id="ciudad"
        name="ciudad"
        value={formData.ciudad}
        onChange={handleChange}
        error={errors.ciudad}
        required
      />

      <div className="flex justify-end">
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
```

- [ ] **Step 2: Verify Step1Envio was created**

Run: `cat src/components/checkout/Step1Envio.jsx | head -20`
Expected: File exists with form component

- [ ] **Step 3: Commit Step1Envio component**

```bash
git add src/components/checkout/Step1Envio.jsx
git commit -m "feat: create Step1Envio checkout component with form validation"
```

---

### Task 27: Create Checkout Components - Step2Pago

**Files:**
- Create: `src/components/checkout/Step2Pago.jsx`

- [ ] **Step 1: Create Step2Pago component**

Create `src/components/checkout/Step2Pago.jsx`:

```javascript
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
```

- [ ] **Step 2: Verify Step2Pago was created**

Run: `cat src/components/checkout/Step2Pago.jsx | head -20`
Expected: File exists with payment method selector

- [ ] **Step 3: Commit Step2Pago component**

```bash
git add src/components/checkout/Step2Pago.jsx
git commit -m "feat: create Step2Pago checkout component with payment methods"
```

---

### Task 28: Create Checkout Components - Step3Confirmacion

**Files:**
- Create: `src/components/checkout/Step3Confirmacion.jsx`

- [ ] **Step 1: Create Step3Confirmacion component**

Create `src/components/checkout/Step3Confirmacion.jsx`:

```javascript
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
          className="flex-1 bg-dark-secondary hover:bg-dark-bg text-dark-text font-bold px-8 py-3 rounded-lg"
        >
          Atrás
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold px-8 py-3 rounded-lg"
        >
          {isLoading ? 'Confirmando...' : 'Confirmar pedido'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify Step3Confirmacion was created**

Run: `cat src/components/checkout/Step3Confirmacion.jsx | head -20`
Expected: File exists with confirmation component

- [ ] **Step 3: Commit Step3Confirmacion component**

```bash
git add src/components/checkout/Step3Confirmacion.jsx
git commit -m "feat: create Step3Confirmacion checkout component with order review"
```

---

### Task 29: Create Checkout Components - CheckoutProgress

**Files:**
- Create: `src/components/checkout/CheckoutProgress.jsx`

- [ ] **Step 1: Create CheckoutProgress component**

Create `src/components/checkout/CheckoutProgress.jsx`:

```javascript
import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Envío' },
  { number: 2, label: 'Pago' },
  { number: 3, label: 'Confirmación' },
];

export default function CheckoutProgress({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                transition-colors flex-shrink-0
                ${
                  step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : step.number === currentStep
                      ? 'bg-check-orange text-dark-bg'
                      : 'bg-dark-secondary text-dark-text'
                }
              `}
            >
              {step.number < currentStep ? <Check className="w-6 h-6" /> : step.number}
            </div>

            {/* Label */}
            <p
              className={`
                ml-3 font-medium
                ${
                  step.number <= currentStep
                    ? 'text-check-orange'
                    : 'text-dark-text-muted'
                }
              `}
            >
              {step.label}
            </p>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 rounded
                  ${
                    step.number < currentStep
                      ? 'bg-green-600'
                      : 'bg-dark-secondary'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify CheckoutProgress was created**

Run: `cat src/components/checkout/CheckoutProgress.jsx | head -15`
Expected: File exists with progress component

- [ ] **Step 3: Commit CheckoutProgress component**

```bash
git add src/components/checkout/CheckoutProgress.jsx
git commit -m "feat: create CheckoutProgress component for 3-step wizard"
```

---

### Task 30: Implement CheckoutPage

**Files:**
- Modify: `src/pages/CheckoutPage.jsx`

- [ ] **Step 1: Implement full CheckoutPage**

Replace `src/pages/CheckoutPage.jsx`:

```javascript
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
```

- [ ] **Step 2: Verify CheckoutPage was updated**

Run: `grep -n "CheckoutProgress\|Step1Envio" src/pages/CheckoutPage.jsx`
Expected: Both imports visible

- [ ] **Step 3: Commit CheckoutPage update**

```bash
git add src/pages/CheckoutPage.jsx
git commit -m "feat: implement CheckoutPage with 3-step wizard"
```

---

### Task 31: Create PedidoConfirmacion Page

**Files:**
- Create: `src/pages/PedidoConfirmacion.jsx`

- [ ] **Step 1: Implement PedidoConfirmacion page**

Create `src/pages/PedidoConfirmacion.jsx`:

```javascript
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
```

- [ ] **Step 2: Verify PedidoConfirmacion was created**

Run: `cat src/pages/PedidoConfirmacion.jsx | head -20`
Expected: File exists with confirmation page

- [ ] **Step 3: Commit PedidoConfirmacion page**

```bash
git add src/pages/PedidoConfirmacion.jsx
git commit -m "feat: implement PedidoConfirmacion success page"
```

---

### Task 32: Create MisCompras Page

**Files:**
- Create: `src/pages/MisCompras.jsx`

- [ ] **Step 1: Implement MisCompras page**

Create `src/pages/MisCompras.jsx`:

```javascript
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
            className="bg-check-orange hover:bg-check-orange-dark text-dark-bg font-bold px-8 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
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
```

- [ ] **Step 2: Verify MisCompras was created**

Run: `cat src/pages/MisCompras.jsx | head -20`
Expected: File exists with order lookup page

- [ ] **Step 3: Commit MisCompras page**

```bash
git add src/pages/MisCompras.jsx
git commit -m "feat: implement MisCompras page for order history lookup"
```

---

### Task 33: Update App.jsx to Include Toast System

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add Toast component to App.jsx**

Update `src/App.jsx` to render Toast component:

Read the file, then add `import Toast from './components/ui/Toast'` and render it in the component.

- [ ] **Step 2: Verify Toast was added to App**

Run: `grep -n "Toast" src/App.jsx`
Expected: Import and usage visible

- [ ] **Step 3: Commit App.jsx update**

```bash
git add src/App.jsx
git commit -m "feat: add Toast notification system to App"
```

---

### Task 34: Create .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Update .env.example with required variables**

Update `.env.example`:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MERCADO_PAGO_PUBLIC_KEY=your_public_key_here
```

- [ ] **Step 2: Commit .env.example update**

```bash
git add .env.example
git commit -m "docs: update .env.example with API and Mercado Pago config"
```

---

## Summary

This plan covers the complete implementation of the Check-Oil tienda frontend:

**Stores (3 tasks):**
- Task 1-3: Create Zustand stores (carrito, ofertas, ui) with persistence

**API Services (5 tasks):**
- Task 4-8: Create Axios instance and service layers for productos, carrito, ofertas, pedidos

**Custom Hooks (4 tasks):**
- Task 9-12: Create generic and domain-specific hooks (useFetch, useProductos, useOfertas, useCarrito)

**UI Components (7 tasks):**
- Task 13-19: Create reusable components (Spinner, Input, Toast, ProductCard, ProductGrid, ProductFilters, PriceBadge)

**Product Pages (2 tasks):**
- Task 20-21: Update Header and implement Productos catalog page
- Task 22: Implement ProductoDetalle page

**Cart & Checkout (6 tasks):**
- Task 23-25: Create CartItem, DiscountSummary, and implement CarritoPage
- Task 26-30: Create checkout wizard components and implement CheckoutPage

**Order Management (2 tasks):**
- Task 31-32: Implement PedidoConfirmacion and MisCompras pages

**Final (2 tasks):**
- Task 33-34: Add Toast system to App and update .env.example

---

Plan complete and saved to `docs/superpowers/plans/2026-06-04-tienda-frontend-completion.md`. 

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using superpowers:executing-plans, batch execution with checkpoints

Which approach?