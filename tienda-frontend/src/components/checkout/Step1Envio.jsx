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
