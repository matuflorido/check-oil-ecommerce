import { useState, useEffect } from 'react';
import ProductGrid from '../components/products/ProductGrid.jsx';
import ProductFilters from '../components/products/ProductFilters.jsx';
import Button from '../components/ui/Button.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { useCarrito } from '../hooks/useCarrito.js';
import { useUiStore } from '../store/uiStore.js';
import { productosApi } from '../services/productosApi.js';

export default function Productos() {
  const { productos, total, page, totalPages, loading, error, filters, setFilter, setPage, resetFilters, fetchProductos } = useProductos();
  const { addToCart } = useCarrito();
  const { addToast } = useUiStore();
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
  }, []);

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
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dark-secondary via-dark-bg to-dark-secondary border-b border-dark-secondary py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-black text-dark-text mb-2 leading-tight">
            Catálogo de Productos
          </h1>
          <p className="text-lg text-check-orange font-semibold flex items-center gap-2">
            ⛽ {total} productos disponibles en stock
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <ProductFilters
          categorias={categorias}
          filters={filters}
          onFilterChange={setFilter}
          onReset={resetFilters}
        />

        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <p className="text-red-400 font-medium">{error.message}</p>
            <Button onClick={() => fetchProductos()} className="bg-red-600 hover:bg-red-700">
              Reintentar
            </Button>
          </div>
        )}

        <ProductGrid
          productos={productos}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-16">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-6 py-3 bg-check-orange hover:bg-orange-600 text-dark-bg font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </Button>

            <div className="bg-dark-secondary rounded-xl px-6 py-3 border border-dark-bg">
              <span className="text-dark-text font-semibold">
                Página <span className="text-check-orange">{page}</span> de <span className="text-check-orange">{totalPages}</span>
              </span>
            </div>

            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-6 py-3 bg-check-orange hover:bg-orange-600 text-dark-bg font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
