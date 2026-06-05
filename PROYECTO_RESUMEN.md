# Tienda Online Check-Oil - Resumen de Proyecto

## 📋 Descripción General
Plataforma ecommerce completa para franquicias Check-Oil (lubricantes y accesorios automotrices).
- **Frontend:** React 19 + Vite + Tailwind CSS (dark theme, naranja #F78E1E)
- **Backend:** Node.js 18+ + Express.js + PostgreSQL (Neon)
- **Hosting:** Hostinger (subdominio tienda.check-oil.com)
- **Estado:** Frontend listo y visualmente mejorado, Backend completado, Deployment bloqueado

---

## 🏗️ Estructura del Proyecto

```
C:\Users\matuf\tienda-online\
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.js                 (ESM wrapper)
│   ├── Procfile                 (web: node index.js)
│   ├── ecosystem.config.js       (PM2 config)
│   ├── src/
│   │   ├── index.js            (entry point - app.listen(3000))
│   │   ├── server.js           (Express app config)
│   │   ├── config/
│   │   │   ├── database.js      (Sequelize config)
│   │   │   └── environment.js   (env vars)
│   │   ├── controllers/         (35+ endpoints)
│   │   ├── models/              (10 Sequelize models)
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── migrations/
│   │   └── seeds/
│   └── public/                  (React frontend build - index.html + assets)
│
├── tienda-frontend/
│   ├── src/
│   │   ├── components/products/
│   │   │   ├── ProductCard.jsx     (Modern card design, dark theme)
│   │   │   ├── ProductGrid.jsx     (3-4 col responsive grid)
│   │   │   └── ProductFilters.jsx  (Filter bar with gradient)
│   │   ├── pages/
│   │   │   ├── Productos.jsx       (Catalog with hero section)
│   │   │   ├── ProductoDetalle.jsx
│   │   │   ├── Carrito.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── ...
│   │   ├── services/productosApi.js
│   │   ├── hooks/
│   │   ├── store/
│   │   └── App.jsx
│   ├── dist/                   (Built React - copied to backend/public/)
│   └── vite.config.js
│
└── backend-deploy/
    ├── test-minimal.zip       (285 bytes - Express hello world)
    ├── tienda-final.zip       (215 KB - Complete app)
    └── (ZIPs for Hostinger upload)
```

---

## 🛠️ Tech Stack

| Componente | Tecnología |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend API | Node.js 18+, Express 4.18, ESM modules |
| Database | PostgreSQL (Neon cloud), Sequelize ORM |
| Authentication | Firebase Auth + JWT |
| Payments | Mercado Pago API integration |
| Storage | Cloudinary (images) |
| Email | SendGrid SMTP |
| Deployment | Hostinger (Node.js App Manager) |

---

## 📦 package.json (Backend)

```json
{
  "name": "check-oil-backend",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "sequelize": "^6.35.0",
    "pg": "^8.10.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "mercadopago": "^2.0.0",
    "@sendgrid/mail": "^8.0.0",
    "axios": "^1.6.0"
  }
}
```

---

## 🔧 Archivos de Entrada

### index.js (raíz)
```javascript
import('./src/index.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```
**Propósito:** ESM wrapper para ejecutar src/index.js (CommonJS compatibility bridge)

### src/index.js
```javascript
import 'dotenv/config.js';
import app from './server.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
```
**Propósito:** Punto de entrada real que inicia el servidor Express

### src/server.js
- Configuración de Express
- Middleware (CORS, helmet, rate-limit)
- Rutas API (/api, /api/admin, /api/webhooks)
- Servir archivos estáticos del frontend (backend/public/)
- SPA fallback para React Router

### Procfile
```
web: node index.js
```
**Propósito:** Para que Hostinger sepa cómo ejecutar la app

---

## 🚀 Endpoint de Ejemplo

```
GET /api/productos
POST /api/productos/:id/add-to-cart
GET /api/categorias
GET /api/admin/ofertas
```

Todos retornan JSON con estructura definida.

---

## 🌐 Frontend Build

**Ubicación:** `backend/public/`

Contiene:
- `index.html` - React entry point
- `assets/index-*.js` - Bundled React code (~300KB)
- `assets/index-*.css` - Tailwind CSS (~9KB gzipped)

**Servido por:** Express desde `app.use(express.static(publicPath))`

---

## 🔴 PROBLEMA ACTUAL - Framework Detection en Hostinger

### Error Exacto
```
"Framework no compatible o estructura de proyecto no válida"
```

### Contexto
- **Último deploy exitoso:** tienda-hostinger.zip (2026-06-05 11:38)
  - Estado: **Completado** ✓
  - Sitio funciona (veía feo pero funcionaba)
  
- **Intentos posteriores:** Todos rechazados
  - Cambio estructura para mejorar diseño
  - Hostinger rechaza INCLUSO ZIPs mínimos

### Lo que hemos intentado
1. ✅ ZIP con estructura estándar Node.js (package.json + src/ + public/)
2. ✅ ZIP con Procfile (web: node index.js)
3. ✅ ZIP con ecosystem.config.js (PM2)
4. ✅ ZIP mínimo (solo package.json + index.js - 285 bytes)
5. ✅ Cambiar package.json main a index.js vs src/index.js
6. ✅ Eliminar y recrear app en Hostinger
7. ✅ Usar .zip vs .tar.gz
8. ✅ Subir con estructura en raíz vs en carpeta
9. ⚠️ Eliminar app y subdominio completamente - último intento

### Características del ZIP actual (tienda-final.zip)

```
package.json
├─ "name": "check-oil-backend"
├─ "type": "module" (ESM)
├─ "main": "index.js"
├─ "start": "node index.js"
├─ dependencies: [express, sequelize, pg, dotenv, cors, ...]

index.js (raíz)
└─ import('./src/index.js').catch(...)

src/index.js
├─ import app from './server.js'
├─ const PORT = process.env.PORT || 3000
└─ app.listen(PORT)

src/server.js
├─ Express app
├─ Middleware (CORS, helmet)
├─ API routes (/api/...)
├─ Static files (public/)
└─ SPA fallback

public/
└─ React frontend build

Procfile
└─ web: node index.js
```

### Configuración de Hostinger
- **Framework seleccionado:** Intenta auto-detect, falla
- **Node version:** 18+
- **Entry point:** Intenta auto-detect desde package.json

---

## 💡 Hipótesis de Causas

1. **Hostinger no detecta ESM modules** (type: "module")
   - Solución: Probar con CommonJS (.cjs) o transpilación

2. **Hostinger rechaza después de eliminar app**
   - Problema de caché o estado corrupto en hPanel
   - Solución: Contactar soporte Hostinger

3. **Falta variable de entorno crítica**
   - Hostinger necesita .env para inicializar
   - Solución: Crear .env manualmente en hPanel ANTES de subir ZIP

4. **Procfile tiene formato incorrecto para Hostinger**
   - Hostinger podría esperar formato diferente
   - Solución: Probar sin Procfile o con variante

5. **Limitaciones de plan Hostinger**
   - Quizás no soporta realmente Node.js con estructura actual
   - Solución: Cambiar de hosting o usar alternativa (Vercel, Railway)

---

## 🔍 Información para Diagnóstico

### Archivos Críticos Incluidos
- ✅ package.json - Válido, contiene todas las dependencias
- ✅ package-lock.json - Generado con npm install
- ✅ index.js - ESM wrapper
- ✅ src/index.js - Entry point real
- ✅ src/server.js - Express config
- ✅ src/config/* - Environment y database config
- ✅ src/controllers/* - 35+ endpoints
- ✅ src/models/* - 10 Sequelize models
- ✅ src/routes/* - API routing
- ✅ public/* - React frontend (index.html + assets)
- ✅ Procfile - Para Hostinger
- ❌ .env - NO incluido (seguridad, crear manualmente)

### Dependencias Críticas
```
express ^4.18.0
sequelize ^6.35.0
pg ^8.10.0
dotenv ^16.3.0
```

---

## 📝 Pasos Completados

1. ✅ Backend Node.js + Express completamente funcional
2. ✅ PostgreSQL Neon configurado y conectado
3. ✅ 35+ endpoints implementados y testeados
4. ✅ React frontend compilado y estilizado (dark theme + naranja)
5. ✅ Frontend build integrado en backend/public/
6. ✅ Servidor unificado (backend sirve frontend)
7. ✅ Primer deploy exitoso a Hostinger
8. ❌ Actualizaciones posteriores rechazadas por Hostinger

---

## 🎯 Necesario para Resolver

1. **Investigar:** ¿Por qué Hostinger rechaza el ZIP nuevo si el anterior funcionó?
2. **Alternativa:** ¿Cambiar a otro hosting (Vercel, Railway, Render)?
3. **Contact:** ¿Soporte de Hostinger sobre limitaciones Node.js?

---

## 📱 URLs Clave

- **Dominio:** tienda.check-oil.com (pendiente de deploy)
- **Admin:** admin.tienda.check-oil.com (preparado)
- **Base de datos:** Neon PostgreSQL (variable DATABASE_URL)

---

## 🔗 Archivos Generados

- Ubicación ZIPs: `C:\Users\matuf\tienda-online\backend-deploy\`
- Frontend source: `C:\Users\matuf\tienda-online\tienda-frontend\`
- Backend source: `C:\Users\matuf\tienda-online\backend\`

