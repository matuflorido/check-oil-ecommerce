import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { X } from 'lucide-react';

export default function ProductFilters({
  categorias = [],
  filters,
  onFilterChange,
  onReset,
  isOpen = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="bg-gradient-to-r from-dark-secondary to-dark-bg rounded-2xl p-6 mb-8 border border-dark-bg shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-dark-text">🔍 Filtros</h3>
        <button
          onClick={onReset}
          className="text-sm text-check-orange hover:text-orange-400 transition-colors font-semibold flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-dark-text-muted mb-2 uppercase tracking-wide">
            Buscar
          </label>
          <Input
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
            <label className="block text-xs font-bold text-dark-text-muted mb-2 uppercase tracking-wide">
              Categoría
            </label>
            <select
              value={filters.categoria || ''}
              onChange={(e) => onFilterChange('categoria', e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg bg-dark-bg text-dark-text border border-dark-bg focus:border-check-orange focus:outline-none transition-colors font-medium text-sm"
            >
              <option value="">Todas</option>
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

        {/* Price Range - Min */}
        <div>
          <label className="block text-xs font-bold text-dark-text-muted mb-2 uppercase tracking-wide">
            Precio mín.
          </label>
          <Input
            type="number"
            placeholder="Desde"
            value={filters.precioMin || ''}
            onChange={(e) =>
              onFilterChange('precioMin', e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>

        {/* Price Range - Max */}
        <div>
          <label className="block text-xs font-bold text-dark-text-muted mb-2 uppercase tracking-wide">
            Precio máx.
          </label>
          <Input
            type="number"
            placeholder="Hasta"
            value={filters.precioMax || ''}
            onChange={(e) =>
              onFilterChange('precioMax', e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-bold text-dark-text-muted mb-2 uppercase tracking-wide">
            Ordenar
          </label>
          <select
            value={filters.ordenar || 'nombre'}
            onChange={(e) => onFilterChange('ordenar', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-dark-bg text-dark-text border border-dark-bg focus:border-check-orange focus:outline-none transition-colors font-medium text-sm"
          >
            <option value="nombre">Nombre A-Z</option>
            <option value="precio">Precio ↑</option>
            <option value="nuevo">Nuevos</option>
          </select>
        </div>
      </div>
    </div>
  );
}
