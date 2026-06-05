# Tienda Online Check-Oil: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, visually striking ecommerce platform (Backend API + 2 React Frontends) for Check-Oil to sell lubricants and automotive accessories with flexible discount rules, inventory management, and admin panel.

**Design Priority:** Dark theme (#1A1A1A), Orange accent (#F78E1E), smooth interactions, trust signals in checkout, premium aesthetic

---

## Task 1: Initialize Project Structure & Git Repos

**Files:**
- Create: `backend/.gitignore`, `backend/package.json`, `backend/.env.example`
- Create: `tienda-frontend/.gitignore`, `tienda-frontend/package.json`
- Create: `admin-frontend/.gitignore`, `admin-frontend/package.json`

**Context:** Set up three separate Node/React projects in directories alongside existing check-oil code

- [ ] Create backend directory with package.json (Express, pg, JWT, bcrypt, Joi, etc.)
- [ ] Create tienda-frontend directory with package.json (React 19, Vite, Tailwind, Zustand, etc.)
- [ ] Create admin-frontend directory with package.json (React 19, Vite, Tailwind, React Hook Form, Recharts)
- [ ] Create .env.example files for each project
- [ ] Create .gitignore files (node_modules/, .env, dist/)
- [ ] Initialize git at root, add all directories, make initial commit "chore: initialize project structure"

---

## Task 2: Set Up Backend Express Server & Database Connection

**Files:**
- Create: `backend/src/index.js`
- Create: `backend/src/server.js`
- Create: `backend/src/config/environment.js`
- Create: `backend/src/config/database.js`
- Create: `backend/.sequelizerc`

**Context:** Backend entry point, Express app setup with CORS/security, PostgreSQL connection via Sequelize

- [ ] Create `backend/src/index.js` that requires dotenv and starts server on PORT
- [ ] Create `backend/src/server.js` with Express app, CORS for localhost:5173/5174 + production domains, helmet security, rate limiting, body parsing
- [ ] Create `backend/src/config/environment.js` with Joi validation of required env vars (DATABASE_URL, JWT_SECRET, CLOUDINARY keys, SENDGRID key, MERCADOPAGO token)
- [ ] Create `backend/src/config/database.js` with Sequelize instance connecting to PostgreSQL
- [ ] Create `.sequelizerc` pointing to migrations/models folders
- [ ] Run `npm install` in backend, copy .env from .env.example, test `npm run dev` starts server
- [ ] Commit: "feat: setup Express server and database connection"

---

## Task 3: Create Sequelize Models - Productos, Categorías, Variantes

**Files:**
- Create: `backend/src/models/index.js`
- Create: `backend/src/models/Category.js`
- Create: `backend/src/models/Product.js`
- Create: `backend/src/models/Variant.js`
- Create: `backend/src/migrations/001-create-categories.js`
- Create: `backend/src/migrations/002-create-products.js`
- Create: `backend/src/migrations/003-create-variants.js`

**Context:** Database schema for product catalog with hierarchical categories and flexible variants

- [ ] Create Category model (id UUID, nombre, slug unique, descripcion, orden, parent_id for subcategories, activa boolean)
- [ ] Create Product model (id UUID, nombre, descripcion, categoria_id FK, subcategoria_id FK, precio_base decimal, imagen_url, stock_actual/minimo integer, activo)
- [ ] Create Variant model (id UUID, producto_id FK, nombre, precio_ajuste decimal, stock_variante integer, atributos JSONB)
- [ ] Set up associations: Category hasMany Product, Category hasMany Category (self), Product hasMany Variant
- [ ] Create migrations for all three tables with proper foreign keys and indexes
- [ ] Create `backend/src/models/index.js` that imports all models, sets associations, exports sequelize instance
- [ ] Run migrations: `npm run migrate`
- [ ] Verify tables exist in PostgreSQL
- [ ] Commit: "feat: create database models and migrations for products, categories, variants"

---

## Task 4: Create Order, Client, Admin User, Stock History Models

**Files:**
- Create: `backend/src/models/Order.js`
- Create: `backend/src/models/OrderItem.js`
- Create: `backend/src/models/Client.js`
- Create: `backend/src/models/AdminUser.js`
- Create: `backend/src/models/StockHistory.js`
- Create: `backend/src/migrations/004-create-clients.js`
- Create: `backend/src/migrations/005-create-admin-users.js`
- Create: `backend/src/migrations/006-create-orders.js`
- Create: `backend/src/migrations/007-create-order-items.js`
- Create: `backend/src/migrations/008-create-stock-history.js`

**Context:** Models for customers, orders, admin auth, inventory tracking

- [ ] Create Client model (id UUID, email unique, nombre, telefono, direccion, ciudad, provincia)
- [ ] Create AdminUser model (id UUID, email unique, password_hash, rol enum: super_admin/admin_productos/admin_ofertas/viewer, permisos JSONB, activo boolean, last_login)
- [ ] Create Order model (id UUID, numero_pedido string, cliente_id FK, estado enum: pendiente/pago_confirmado/preparando/envio_coordinado/entregado/cancelado, subtotal/descuentos/costo_envio/total decimals, metodo_pago enum, direccion_envio JSONB, created_at, fecha_entrega)
- [ ] Create OrderItem model (id UUID, pedido_id FK, producto_id FK, variante_id FK nullable, cantidad integer, precio_unitario decimal)
- [ ] Create StockHistory model (id UUID, producto_id FK, variante_id FK nullable, tipo enum: compra/ajuste_manual/devolucion, cantidad integer, motivo string, usuario_admin_id FK nullable, timestamp)
- [ ] Create migrations for all 5 tables with indexes on frequently queried columns
- [ ] Update models/index.js with new associations and exports
- [ ] Run migrations
- [ ] Commit: "feat: create order, client, admin user, and inventory tracking models"

---

## Task 5: Create Offer Model & Discount Engine Service

**Files:**
- Create: `backend/src/models/Offer.js`
- Create: `backend/src/migrations/009-create-offers.js`
- Create: `backend/src/services/OfertasService.js`

**Context:** Offers with flexible JSON rules, core discount calculation engine

- [ ] Create Offer model (id UUID, nombre, descripcion, fecha_inicio/fin datetime, banner_imagen URL, condiciones JSONB, aplicable_a JSONB, activa boolean, created_at, updated_at)
- [ ] Create migration for offers table
- [ ] Create OfertasService with method `evaluateOffersForCart(carrito)`:
  - Query active offers from DB (fecha_inicio <= now <= fecha_fin, activa=true)
  - For each offer, evaluate conditions against carrito:
    - Support qty >= X of same product → discount Y%
    - Support total items in carrito >= X → discount Y%
    - Support total monto >= X → discount Y% or free shipping
    - Support specific producto_id → discount Y%
    - Support complex combinations (AND/OR logic)
  - Return array of applicable offers + total discount amount
  - Handle edge cases: no applicable offers, overlapping discounts (use best one)
- [ ] Write unit tests for OfertasService with multiple scenarios
- [ ] Update models/index.js
- [ ] Commit: "feat: add Offer model and discount engine service"

---

## Task 6: Create Stock Management & Email Service

**Files:**
- Create: `backend/src/services/StockService.js`
- Create: `backend/src/services/EmailService.js`
- Create: `backend/src/utils/emailTemplates.js`

**Context:** Inventory reservation, alert generation; email notifications for orders/payments

- [ ] Create StockService with methods:
  - `reserveStock(productId, variantId, quantity)` - Check availability, deduct from stock_actual or stock_variante, create StockHistory entry, check if stock < minimo and create alert
  - `releaseReservation(productId, variantId, quantity)` - Increase stock (e.g., if order cancelled)
  - `getStockAlerts()` - Return all products where stock < minimo
  - `adjustStockManually(productId, variantId, quantity, motivo, usuarioAdminId)` - Admin override
- [ ] Create EmailService with SendGrid integration:
  - Method `sendOrderConfirmation(cliente, pedido)` - HTML email with order number, items, total
  - Method `sendPaymentConfirmed(cliente, pedido)` - Confirmation that payment received
  - Method `sendStatusUpdate(cliente, pedido, nuevoEstado)` - Status change notification
  - Method `sendCoordinateShipping(cliente, pedido, instrucciones)` - Instructions for delivery coordination
- [ ] Create emailTemplates.js with HTML template functions (responsive, branded with orange/black)
- [ ] Write unit tests
- [ ] Commit: "feat: add stock management and email notification services"

---

## Task 7: Create Backend API Routes - Products & Ofertas (Public)

**Files:**
- Create: `backend/src/routes/public.js`
- Create: `backend/src/controllers/productsController.js`
- Create: `backend/src/controllers/ofertasController.js`
- Create: `backend/src/middleware/validation.js`
- Create: `backend/src/utils/validators.js`

**Context:** Public API for tienda frontend: browse products with filters, view active offers

- [ ] Create validators.js with Joi schemas: queryProductos (page, limit, categoria, precioMin, precioMax, search), queryOfertas
- [ ] Create productsController:
  - `GET /api/productos` - List products with pagination (default 20/page), filters, search. Return {products[], total, page}
  - `GET /api/productos/:id` - Detail product with variants, current stock, applicable discounts (call OfertasService)
  - `GET /api/categorias` - List all categories hierarchically
- [ ] Create ofertasController:
  - `GET /api/ofertas` - Return active offers only (not expired, activa=true) with banners
- [ ] Create validation middleware (Joi)
- [ ] Create routes/public.js that wires up endpoints
- [ ] Write integration tests for products endpoint (test filters, pagination, search)
- [ ] Update server.js to use routes/public
- [ ] Test with Postman/curl
- [ ] Commit: "feat: add public API endpoints for products and offers"

---

## Task 8: Create Backend API Routes - Carrito & Pedidos

**Files:**
- Create: `backend/src/controllers/carritoController.js`
- Create: `backend/src/controllers/pedidosController.js`
- Create: `backend/src/utils/orderHelpers.js`

**Context:** Shopping cart calculation, order creation with automatic discount application

- [ ] Create carritoController:
  - `POST /api/carrito` - Accept {items: [{productId, variantId, cantidad}]} 
  - Validate stock for each item
  - Call OfertasService.evaluateOffersForCart()
  - Return {items, subtotal, descuentos, total, aplicableOfertas}
- [ ] Create pedidosController:
  - `POST /api/pedidos` - Accept {items, cliente: {email, nombre, telefono, direccion, ciudad, provincia}, metodoPago}
  - Validate all data
  - Create Client if new
  - Create Order in DB
  - Call StockService.reserveStock() for each item
  - If metodoPago === 'mercado_pago': Init MP payment flow, return payment link
  - Else: Set order status to 'pendiente', return numero_pedido
  - Send order confirmation email via EmailService
  - Return {numero_pedido, proximoPaso, pagoLink?}
- [ ] Create orderHelpers.js with utility functions
- [ ] Write integration tests for carrito and pedidos (test discount application, stock reservation)
- [ ] Commit: "feat: add cart and order creation endpoints"

---

## Task 9: Implement Mercado Pago Integration & Webhooks

**Files:**
- Create: `backend/src/services/PagosService.js`
- Create: `backend/src/routes/webhooks.js`
- Create: `backend/src/controllers/webhooksController.js`

**Context:** Payment processing, webhook handling for MP payment confirmation

- [ ] Create PagosService:
  - `initiateMercadoPagoPayment(pedidoId, cliente, items, total)` - Create preference in MP, return payment link
  - `verifyWebhookSignature(signature, payload)` - Validate MP webhook (not real signature validation for now)
- [ ] Create webhooksController:
  - `POST /api/webhooks/mercado-pago` - Receive MP payment.completed event
  - Update order status to 'pago_confirmado'
  - Send payment confirmation email
  - Return 200 OK to MP
- [ ] Create routes/webhooks.js with webhook endpoint
- [ ] Update server.js to use webhooks routes
- [ ] Mock test webhook payload locally
- [ ] Write integration test for webhook (mock payment.completed event, verify order status updated)
- [ ] Commit: "feat: implement Mercado Pago payment integration"

---

## Task 10: Create Admin Authentication & Protected Routes

**Files:**
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/routes/admin.js`
- Create: `backend/src/controllers/authController.js`
- Create: `backend/src/utils/jwt.js`

**Context:** JWT-based admin auth, role-based access control

- [ ] Create jwt.js with `generateToken(adminId, role, expiresIn='24h')` and `verifyToken(token)`
- [ ] Create auth middleware that:
  - Extract JWT from Authorization header
  - Verify token
  - Check if user still active
  - Attach adminUser to req.user
  - Handle expired/invalid tokens (return 401)
- [ ] Create authController:
  - `POST /api/admin/login` - Accept {email, password}
  - Query AdminUser by email
  - Compare password via bcrypt
  - Generate JWT token
  - Return {token, expiresIn, user: {id, email, rol, permisos}}
- [ ] Create routes/admin.js that:
  - POST /login (no auth required)
  - All other endpoints: require auth middleware
  - Placeholder routes for CRUD (will fill in next tasks)
- [ ] Write tests for login endpoint (valid/invalid credentials)
- [ ] Commit: "feat: implement JWT authentication for admin panel"

---

## Task 11: Create Admin API - Products CRUD

**Files:**
- Create: `backend/src/controllers/admin/productsController.js`
- Create: `backend/src/services/CloudinaryService.js`

**Context:** Full product management for admin: create, edit, delete, upload images

- [ ] Create CloudinaryService:
  - `uploadImage(file)` - Upload to Cloudinary, return secure URL
  - `deleteImage(publicId)` - Delete from Cloudinary
- [ ] Create admin/productsController (protected endpoints):
  - `GET /api/admin/productos` - List all products (admin view, no filters)
  - `POST /api/admin/productos` - Create product {nombre, descripcion, categoriaId, subcategoriaId, precioBase, imagenUrl, stockActual, stockMinimo}
  - Validate required fields, set activo=true
  - Return created product
  - `PUT /api/admin/productos/:id` - Update product fields
  - `DELETE /api/admin/productos/:id` - Soft delete (set activo=false)
  - `POST /api/admin/productos/:id/upload-image` - Upload and update imagen_url
  - `POST /api/admin/productos/:id/variantes` - Create variant
  - `PUT /api/admin/productos/:id/variantes/:varianteId` - Update variant
  - `DELETE /api/admin/productos/:id/variantes/:varianteId` - Delete variant
- [ ] Add route handlers to routes/admin.js
- [ ] Write integration tests
- [ ] Commit: "feat: add admin product CRUD endpoints and image upload"

---

## Task 12: Create Admin API - Ofertas Management

**Files:**
- Create: `backend/src/controllers/admin/ofertasController.js`

**Context:** Admin creates/edits/deletes offers with complex discount rules

- [ ] Create admin/ofertasController (protected):
  - `GET /api/admin/ofertas` - List all offers (active and inactive)
  - `POST /api/admin/ofertas` - Create offer {nombre, descripcion, condiciones JSON, aplicable_a JSON, fechaInicio, fechaFin, bannerImagen, activa}
  - Validate conditions structure (must be evaluable by OfertasService)
  - Return created offer
  - `PUT /api/admin/ofertas/:id` - Update offer
  - `DELETE /api/admin/ofertas/:id` - Delete offer
  - `PATCH /api/admin/ofertas/:id/toggle` - Toggle activa flag
- [ ] Add routes to routes/admin.js
- [ ] Write integration tests (test valid/invalid rule structures)
- [ ] Commit: "feat: add admin offer management endpoints"

---

## Task 13: Create Admin API - Stock & Reporting

**Files:**
- Create: `backend/src/controllers/admin/stockController.js`
- Create: `backend/src/controllers/admin/reportesController.js`

**Context:** Stock tracking, alerts; sales/popular products/client reports

- [ ] Create admin/stockController:
  - `GET /api/admin/stock` - Return all products with stock_actual, stock_minimo, flag if below minimum
  - `POST /api/admin/stock/:id/ajustar` - Adjust stock {cantidad, motivo, usuarioAdminId}
  - Call StockService.adjustStockManually()
  - `GET /api/admin/stock/:id/historial` - Return StockHistory entries for product
- [ ] Create admin/reportesController:
  - `GET /api/admin/reportes/ventas` - Sales by date range, return aggregated data for charting
  - `GET /api/admin/reportes/productos-populares` - Top 10 products by quantity sold
  - `GET /api/admin/reportes/clientes` - List all clients with purchase count, total spent
  - `GET /api/admin/reportes/stock-bajo` - Products with stock < minimo
  - `GET /api/admin/reportes/export` - Export as CSV (ventas, productos, clientes)
- [ ] Add routes
- [ ] Write tests
- [ ] Commit: "feat: add stock and reporting endpoints"

---

## Task 14: Create Admin API - Users & Permissions

**Files:**
- Create: `backend/src/controllers/admin/usuariosController.js`

**Context:** Super admin manages other admin users and their roles/permissions

- [ ] Create admin/usuariosController (super_admin only):
  - `GET /api/admin/usuarios` - List all admin users
  - `POST /api/admin/usuarios` - Create admin user {email, password, rol, permisos}
  - Hash password with bcrypt
  - Return {id, email, rol, permisos}
  - `PUT /api/admin/usuarios/:id` - Update rol/permisos
  - `DELETE /api/admin/usuarios/:id` - Delete user
  - Prevent self-deletion
- [ ] Add permission check middleware: verify req.user.rol === 'super_admin' for these endpoints
- [ ] Add routes
- [ ] Write tests
- [ ] Commit: "feat: add admin user management endpoints"

---

## Task 15: Create Admin API - Order Management

**Files:**
- Create: `backend/src/controllers/admin/pedidosController.js`

**Context:** Admin views orders, changes status, coordinates shipping

- [ ] Create admin/pedidosController:
  - `GET /api/admin/pedidos` - List all orders with filters (estado, dateRange, search by cliente email/nombre)
  - Return paginated {orders[], total, page}
  - `GET /api/admin/pedidos/:id` - Order detail with cliente, items, discounts applied, timeline
  - `PATCH /api/admin/pedidos/:id/estado` - Change order estado {nuevoEstado}
  - Validate valid status transitions
  - Send status update email if status changed
  - `POST /api/admin/pedidos/:id/coordinar-envio` - Send shipping coordination email
  - Accept {instrucciones} and email client with details
- [ ] Add routes
- [ ] Write tests
- [ ] Commit: "feat: add admin order management endpoints"

---

## Task 16: Write Backend Integration Tests

**Files:**
- Create: `backend/tests/integration/products.test.js`
- Create: `backend/tests/integration/ofertas.test.js`
- Create: `backend/tests/integration/carrito.test.js`
- Create: `backend/tests/unit/OfertasService.test.js`

**Context:** Comprehensive testing of backend logic

- [ ] Write product endpoint tests: GET /api/productos filters, pagination, search; GET /api/productos/:id with discounts
- [ ] Write offers endpoint tests: GET /api/ofertas returns only active
- [ ] Write cart tests: POST /api/carrito applies discounts correctly with multiple scenarios
- [ ] Write order tests: POST /api/pedidos creates order, reserves stock, sends email
- [ ] Write OfertasService unit tests: qty discounts, amount discounts, complex rules
- [ ] All tests passing
- [ ] Commit: "test: add comprehensive backend integration and unit tests"

---

## FRONTEND TIENDA SETUP & UI COMPONENTS

## Task 17: Setup Tienda Frontend Project & Tailwind

**Files:**
- Create: `tienda-frontend/src/App.jsx`
- Create: `tienda-frontend/src/main.jsx`
- Create: `tienda-frontend/src/index.html`
- Create: `tienda-frontend/vite.config.js`
- Create: `tienda-frontend/tailwind.config.js`
- Create: `tienda-frontend/postcss.config.js`
- Create: `tienda-frontend/src/styles/globals.css`
- Create: `tienda-frontend/src/styles/theme.js`

**Context:** Dark theme with orange accents, modern responsive setup

- [ ] Run `npm install` in tienda-frontend
- [ ] Create vite.config.js with React plugin, proxy to http://localhost:3000/api for dev
- [ ] Create tailwind.config.js:
  - Dark mode: 'class'
  - Extend colors: orange: '#F78E1E', darkBg: '#1A1A1A', darkText: '#E5E5E5'
  - Custom spacing, typography
- [ ] Create postcss.config.js with tailwindcss and autoprefixer
- [ ] Create src/styles/globals.css with:
  - Tailwind directives (@tailwind base, components, utilities)
  - Custom CSS variables for colors, fonts
  - Base styling (dark mode default, smooth transitions)
- [ ] Create src/styles/theme.js exporting color constants
- [ ] Create src/index.html as entry point
- [ ] Create src/main.jsx rendering App
- [ ] Create src/App.jsx with React Router setup (Routes, Outlet)
- [ ] Test: `npm run dev` starts server on localhost:5173
- [ ] Commit: "feat: setup tienda frontend with Vite and Tailwind dark theme"

---

## Task 18: Create Reusable UI Components (Tienda)

**Files:**
- Create: `tienda-frontend/src/components/ui/Button.jsx`
- Create: `tienda-frontend/src/components/ui/Input.jsx`
- Create: `tienda-frontend/src/components/ui/Modal.jsx`
- Create: `tienda-frontend/src/components/ui/Toast.jsx`
- Create: `tienda-frontend/src/components/ui/Badge.jsx`
- Create: `tienda-frontend/src/components/ui/Spinner.jsx`

**Context:** Reusable, themeable components with Tailwind

- [ ] Create Button component:
  - Props: children, variant (primary/secondary/danger), size (sm/md/lg), disabled, onClick, className
  - Primary: bg-orange-500 hover:bg-orange-600, text-white
  - Secondary: border border-gray-600 hover:bg-gray-900
  - Danger: bg-red-600
  - All: rounded, transition, font-semibold
- [ ] Create Input component:
  - Props: type, placeholder, value, onChange, error, label, className
  - Dark background, light text, orange border on focus
- [ ] Create Modal component:
  - Props: isOpen, title, children, onClose, onConfirm, confirmText
  - Dark background, centered, close button
- [ ] Create Toast component:
  - Props: type (success/error/info), message, duration
  - Position: top-right, auto-dismiss after duration
- [ ] Create Badge component:
  - Props: children, type (success/warning/danger/info), className
  - Show discount %, stock status, etc.
- [ ] Create Spinner component:
  - Loading animation, orange color
- [ ] Test components with Storybook (optional) or manual
- [ ] Commit: "feat: create reusable UI components for tienda frontend"

---

## Task 19: Create Layout Components (Header, Footer)

**Files:**
- Create: `tienda-frontend/src/components/layout/Header.jsx`
- Create: `tienda-frontend/src/components/layout/Footer.jsx`
- Create: `tienda-frontend/src/components/layout/MainLayout.jsx`

**Context:** Professional header with logo, search, cart; footer with links

- [ ] Create Header component:
  - Logo (Check Oil - Lubricentros) on left
  - Search bar center (search box + button)
  - Cart icon right (with item count badge, orange highlight)
  - Sticky top, dark background, light text
  - On cart click: open CarritoDrawer (will implement later)
- [ ] Create Footer component:
  - Company info (Check Oil, contact email, phone)
  - Links sections (Productos, Ofertas, Cuenta)
  - Copyright
  - Dark background
- [ ] Create MainLayout wrapper component:
  - Header on top
  - {children} in middle
  - Footer at bottom
  - Min height 100vh
- [ ] Commit: "feat: create header and footer layout components"

---

## Task 20: Create Product Components

**Files:**
- Create: `tienda-frontend/src/components/products/ProductCard.jsx`
- Create: `tienda-frontend/src/components/products/ProductGrid.jsx`
- Create: `tienda-frontend/src/components/products/ProductFilters.jsx`

**Context:** Product display with discount highlighting, filters

- [ ] Create ProductCard component:
  - Props: product {id, nombre, precioBase, imagenUrl, stock, descuentos}
  - Image (lazy load), product name, price
  - If descuentos exist: show original price strikethrough + new price + orange "DESCUENTO X%" badge
  - Stock indicator: "En stock" (green) / "Stock bajo" (yellow) / "Agotado" (gray)
  - Hover effect: slight scale, shadow
  - Click: navigate to product detail
- [ ] Create ProductGrid component:
  - Props: products[], isLoading
  - Grid layout (responsive: 1 col mobile, 2 col tablet, 3-4 col desktop)
  - Show spinner while loading
- [ ] Create ProductFilters component:
  - Props: onFilterChange callback
  - Category select (dropdown from API)
  - Price range slider (min/max)
  - Availability checkbox
  - Apply button
  - Dark theme with orange accents
- [ ] Commit: "feat: create product card and grid components"

---

## Task 21: Create Home Page

**Files:**
- Create: `tienda-frontend/src/pages/Home.jsx`
- Create: `tienda-frontend/src/components/common/HeroBanner.jsx`
- Create: `tienda-frontend/src/components/common/OfferBanner.jsx`

**Context:** Landing page with hero, featured products, promotional offers

- [ ] Create HeroBanner component:
  - Large banner image (placeholder for now)
  - Headline "Ofertas Especiales en Aceites y Accesorios"
  - Subheadline + CTA button "Ver Catálogo"
  - Dark overlay for text contrast
- [ ] Create OfferBanner component:
  - Display featured offers (top 2-3)
  - Orange background, white text, call to action
  - Show discount %, deadline if available
- [ ] Create Home page:
  - HeroBanner at top
  - OfferBanner below
  - "Productos Destacados" section with 6-8 popular products
  - Fetch from GET /api/ofertas and GET /api/productos
  - Responsive layout
- [ ] Commit: "feat: create home page with banners and featured products"

---

## Task 22: Create Catalog Page

**Files:**
- Create: `tienda-frontend/src/pages/Productos.jsx`

**Context:** Full product listing with filters and search

- [ ] Create Productos page:
  - Sidebar: ProductFilters
  - Main area: search bar + ProductGrid
  - Fetch products from GET /api/productos with query params (categoria, precioMin, precioMax, search, page, limit=20)
  - Implement pagination controls
  - Loading state while fetching
  - Error handling (show message if fetch fails)
  - URL params reflect filters (shareable links)
- [ ] Commit: "feat: create catalog page with filters and search"

---

## Task 23: Create Product Detail Page

**Files:**
- Create: `tienda-frontend/src/pages/ProductoDetalle.jsx`
- Create: `tienda-frontend/src/components/products/VariantSelector.jsx`
- Create: `tienda-frontend/src/components/common/PriceBadge.jsx`

**Context:** Detailed product view with variant selection, discount display

- [ ] Create VariantSelector component:
  - Props: variants[], onSelect callback
  - Display as buttons or dropdown
  - Show variant name + price adjustment
- [ ] Create PriceBadge component:
  - Props: precioBase, descuentos
  - Show original price (if discount)
  - Show final price in bold orange
  - Show discount % badge
- [ ] Create ProductoDetalle page (route: /productos/:id):
  - Fetch product from GET /api/productos/:id
  - Display: large image, name, description
  - VariantSelector (if variants exist)
  - PriceBadge with discounts applied
  - Stock indicator + quantity selector
  - "Agregar al Carrito" button
  - On button click: call addToCart (Zustand store), show toast "Producto agregado"
  - Related products section (optional)
- [ ] Commit: "feat: create product detail page with variant selection"

---

## Task 24: Create Cart & Checkout Components

**Files:**
- Create: `tienda-frontend/src/components/carrito/CarritoDrawer.jsx`
- Create: `tienda-frontend/src/components/carrito/CartItem.jsx`
- Create: `tienda-frontend/src/components/carrito/DiscountSummary.jsx`
- Create: `tienda-frontend/src/pages/CarritoPage.jsx`

**Context:** Shopping cart display with discount breakdown

- [ ] Create CartItem component:
  - Props: item {productId, nombre, cantidad, precioUnitario, varianteId?}
  - Show product name, cantidad, price, remove button
  - Allow quantity adjustment (+/- buttons)
- [ ] Create DiscountSummary component:
  - Props: aplicableOfertas[], subtotal, descuentos, total
  - List each applied offer (name + discount amount in orange)
  - Show subtotal, total discount, final total
  - Emphasize savings with colored text
- [ ] Create CarritoDrawer component:
  - Side panel (right side, slides in)
  - List CartItems
  - DiscountSummary at bottom
  - "Ir a Checkout" button
  - On close: collapse drawer
- [ ] Create CarritoPage:
  - Full-page cart view
  - Same layout as drawer but larger
  - Items list + DiscountSummary + button to proceed
- [ ] Commit: "feat: create cart components with discount display"

---

## Task 25: Create Checkout Wizard (3 Steps)

**Files:**
- Create: `tienda-frontend/src/pages/CheckoutPage.jsx`
- Create: `tienda-frontend/src/components/checkout/Step1Envio.jsx`
- Create: `tienda-frontend/src/components/checkout/Step2Pago.jsx`
- Create: `tienda-frontend/src/components/checkout/Step3Confirmacion.jsx`

**Context:** Multi-step checkout with address, payment method, confirmation

- [ ] Create Step1Envio component:
  - Form: nombre, email, telefono, direccion, ciudad, provincia
  - Validation (email format, required fields)
  - Save to component state
- [ ] Create Step2Pago component:
  - Radio buttons: Mercado Pago / Transferencia / Efectivo
  - Show info for each method
  - Validate selection
- [ ] Create Step3Confirmacion component:
  - Display order summary: items, subtotal, descuentos, total
  - Show cliente data (name, email, direccion)
  - Show payment method
  - Disclaimer: "Al confirmar, aceptas nuestros términos"
  - "Confirmar Pedido" button
- [ ] Create CheckoutPage (route: /checkout):
  - Wizard: displays current step
  - Navigation buttons (Previous, Next, Submit)
  - Form validation on next step
  - On Step3 confirm:
    - POST /api/pedidos with cart data
    - If Mercado Pago: redirect to MP payment link
    - Else: show order confirmation page
  - Error handling (show error modal if POST fails)
- [ ] Commit: "feat: create 3-step checkout wizard"

---

## Task 26: Create Order Confirmation & History Pages

**Files:**
- Create: `tienda-frontend/src/pages/PedidoConfirmacion.jsx`
- Create: `tienda-frontend/src/pages/MisCompras.jsx`

**Context:** Order success page, order history lookup

- [ ] Create PedidoConfirmacion page (route: /pedido-confirmacion/:numeropedido):
  - Display success message "¡Gracias por tu compra!"
  - Show order number prominently (orange, bold)
  - Show "Email de confirmación enviado a: [email]"
  - Display order summary (items, total)
  - If metodoPago === mercado_pago: "Completá el pago en Mercado Pago"
  - Else: "Esperamos tu confirmación de pago / efectivo en sucursal"
  - Button: "Volver al catálogo"
  - Button: "Ver historial de compras"
- [ ] Create MisCompras page (route: /mis-compras):
  - Lookup form: email input + search button
  - Fetch orders from backend (endpoint needed: GET /api/pedidos?email=xxx)
  - Display list of orders: numero_pedido, fecha, estado, total
  - Click order: show detail modal (items, status, fecha_entrega if applicable)
  - Download invoice button (generate PDF, optional for v1)
- [ ] Commit: "feat: create order confirmation and history pages"

---

## Task 27: Setup Zustand Global State

**Files:**
- Create: `tienda-frontend/src/store/carritoStore.js`
- Create: `tienda-frontend/src/store/ofertasStore.js`
- Create: `tienda-frontend/src/store/uiStore.js`

**Context:** Centralized state management for cart, offers, UI

- [ ] Create carritoStore (Zustand):
  - State: items[], subtotal, descuentos, total, aplicableOfertas
  - Methods: addItem, removeItem, updateQuantity, clearCart, setOfertas
  - Persist to localStorage (Zustand persist middleware)
- [ ] Create ofertasStore:
  - State: ofertas[], loading, error
  - Methods: fetchOfertas, filterActiveOfertas
- [ ] Create uiStore:
  - State: toasts[], isCarritoOpen, isLoading, errorMessage
  - Methods: addToast, removeToast, toggleCarrito, setLoading, setError
- [ ] Commit: "feat: setup Zustand global state stores"

---

## Task 28: Create Custom Hooks

**Files:**
- Create: `tienda-frontend/src/hooks/useCarrito.js`
- Create: `tienda-frontend/src/hooks/useProductos.js`
- Create: `tienda-frontend/src/hooks/useOfertas.js`

**Context:** Custom hooks for data fetching and cart logic

- [ ] Create useCarrito hook:
  - Returns: {items, total, descuentos, addItem, removeItem, updateQuantity, clearCart}
  - Wraps carritoStore methods
- [ ] Create useProductos hook:
  - Returns: {productos, loading, error, fetchProductos, filterProductos}
  - Handles GET /api/productos API calls
- [ ] Create useOfertas hook:
  - Returns: {ofertas, calculateDiscount}
  - Fetch active offers
  - Calculate applicable discounts for given carrito
- [ ] Commit: "feat: create custom hooks for data fetching and state management"

---

## Task 29: Create API Services

**Files:**
- Create: `tienda-frontend/src/services/api.js`
- Create: `tienda-frontend/src/services/productosApi.js`
- Create: `tienda-frontend/src/services/carroApi.js`
- Create: `tienda-frontend/src/services/pedidosApi.js`

**Context:** Centralized API calls to backend

- [ ] Create api.js (Axios instance):
  - baseURL: import.meta.env.VITE_API_URL or http://localhost:3000/api
  - Default headers, timeout
  - Request/response interceptors
- [ ] Create productosApi.js:
  - getProductos(filters) → GET /api/productos
  - getProductoDetail(id) → GET /api/productos/:id
  - getCategorias() → GET /api/categorias
- [ ] Create carroApi.js:
  - calculateCarrito(items) → POST /api/carrito
- [ ] Create pedidosApi.js:
  - createPedido(pedidoData) → POST /api/pedidos
  - getPedidosByEmail(email) → GET /api/pedidos?email=xxx (endpoint needs to be created in backend)
- [ ] Create ofertasApi.js:
  - getOfertasActivas() → GET /api/ofertas
- [ ] Commit: "feat: create API service layer"

---

## Task 30: Integrate Mercado Pago Payment

**Files:**
- Create: `tienda-frontend/src/services/mercadopagoApi.js`
- Modify: `tienda-frontend/src/pages/CheckoutPage.jsx` (update with MP integration)
- Create: `tienda-frontend/src/pages/PagoExitoso.jsx` (optional)

**Context:** Mercado Pago SDK integration for payment

- [ ] Install @mercadopago/sdk-react
- [ ] Create mercadopagoApi.js:
  - Init MP with public key from env
  - initializePayment(preferenceId) → return payment link
- [ ] Update CheckoutPage:
  - On Step3 confirm with metodoPago=mercado_pago:
    - POST /api/pedidos (backend returns pagoLink)
    - Redirect to pagoLink (opens MP payment in new window or modal)
  - After payment success: redirect back to PedidoConfirmacion
- [ ] Create .env.example with VITE_MERCADOPAGO_PUBLIC_KEY
- [ ] Test with MP sandbox account
- [ ] Commit: "feat: integrate Mercado Pago payment SDK"

---

## Task 31: Style Tienda Frontend (Dark Theme + Polish)

**Files:**
- Modify: Global CSS, individual components

**Context:** Professional, modern aesthetic with dark theme

- [ ] Apply global dark theme: dark background (#1A1A1A), light text (#E5E5E5)
- [ ] Polish components:
  - Smooth transitions on hover/interactions
  - Orange accents on buttons, badges, highlights
  - Responsive spacing
  - Button hover effects (subtle scale/brightness)
  - Card shadows (dark shadow on dark background)
- [ ] Test on mobile, tablet, desktop
- [ ] Ensure all text is readable (sufficient contrast)
- [ ] Commit: "feat: complete styling for tienda frontend with dark theme"

---

## FRONTEND ADMIN SETUP & COMPONENTS

## Task 32: Setup Admin Frontend Project

**Files:** Same as Task 17, but for admin-frontend directory

- [ ] Setup Vite, Tailwind dark theme, React Router
- [ ] Configure .env.example with VITE_API_URL
- [ ] Test dev server starts
- [ ] Commit: "feat: setup admin frontend with Vite and Tailwind"

---

## Task 33: Create Admin UI Components

**Files:**
- Create: `admin-frontend/src/components/ui/Table.jsx`
- Create: `admin-frontend/src/components/ui/Input.jsx`
- Create: `admin-frontend/src/components/ui/Select.jsx`
- Create: `admin-frontend/src/components/ui/ConfirmDialog.jsx`
- Create: `admin-frontend/src/components/common/KpiCard.jsx`

**Context:** Reusable admin panel components

- [ ] Create Table component:
  - Props: columns[], data[], onSort, onEdit, onDelete
  - Sortable columns, pagination controls
  - Dark theme, striped rows
- [ ] Create Input/Select as forms components
- [ ] Create ConfirmDialog:
  - Props: isOpen, title, message, onConfirm, onCancel
  - Dark theme, centered
- [ ] Create KpiCard:
  - Props: title, value, icon, color, trend?
  - Display metric (sales, orders, etc.)
  - Orange accent color
- [ ] Commit: "feat: create admin UI components"

---

## Task 34: Create Admin Sidebar & Auth

**Files:**
- Create: `admin-frontend/src/components/layout/Sidebar.jsx`
- Create: `admin-frontend/src/pages/Login.jsx`
- Create: `admin-frontend/src/store/authStore.js`

**Context:** Admin navigation and authentication

- [ ] Create authStore (Zustand):
  - State: token, user, isLoading, error
  - Methods: login, logout, setToken
  - Persist token to localStorage
- [ ] Create Login page:
  - Form: email, password, submit button
  - POST /api/admin/login
  - On success: save token, redirect to dashboard
  - Show error message on failure
- [ ] Create Sidebar:
  - Menu items: Dashboard, Productos, Categorias, Ofertas, Inventario, Pedidos, Reportes, Usuarios, Configuración, Logout
  - Highlight active page
  - Collapse/expand (optional)
  - Dark theme with orange highlight on active
- [ ] Update App.jsx with protected routes (require token)
- [ ] Commit: "feat: create admin authentication and sidebar navigation"

---

## Task 35: Create Admin Dashboard

**Files:**
- Create: `admin-frontend/src/pages/Dashboard.jsx`

**Context:** Overview with KPIs and charts

- [ ] Create Dashboard page:
  - Fetch today's sales, pending orders, low stock count from GET /api/admin/reportes/...
  - Display KPI cards: "Ventas Hoy", "Pedidos Pendientes", "Stock Bajo"
  - Chart (Recharts): Sales trend (last 7 days)
  - Chart: Top 5 productos by quantity
  - Alerts section: List of stock alerts
  - All data real-time from backend
- [ ] Commit: "feat: create admin dashboard with KPIs and charts"

---

## Task 36-46: Create Remaining Admin Pages

(Productos, Categorias, Ofertas, Inventario, Pedidos, Reportes, Usuarios, Configuración)

Each page follows pattern:
- Fetch data from backend API (protected endpoints)
- Display Table with edit/delete actions
- Form modal for create/edit
- Validation with React Hook Form
- Loading/error states
- Dark theme with orange accents

Tasks 36-46 are similar patterns, so summarizing:

- [ ] Task 36: ProductosPage - CRUD products, upload images, manage variants
- [ ] Task 37: CategoriasPage - CRUD categories, drag-drop reorder
- [ ] Task 38: OfertasPage - CRUD offers, RuleBuilder component for conditions
- [ ] Task 39: InventarioPage - Stock table with alerts, manual adjustments, history
- [ ] Task 40: PedidosPage - Order list with filters, detail modal, status changes, email coordinator
- [ ] Task 41: ReportesPage - Sales chart, top products, clients list, export CSV
- [ ] Task 42: UsuariosPage - Admin user CRUD (super_admin only), role/permission selector
- [ ] Task 43: ConfiguracionPage - Store settings, payment method toggles, email templates
- [ ] Task 44-46: Setup API services, hooks, global state for admin

Each task:
- Create page component
- Create API service calls
- Create form/modal components if needed
- Write tests
- Commit

---

## TESTING & DEPLOYMENT

## Task 47-55: Write E2E & Integration Tests

- [ ] Test full purchase flow (add to cart → discount applied → checkout → order created)
- [ ] Test admin flow (login → create product → create offer → see in reports)
- [ ] Test Mercado Pago webhook
- [ ] Test stock reservation and alerts
- [ ] All tests passing

---

## Task 56-65: Deploy & Finalize

- [ ] Deploy backend to Railway/Render
- [ ] Deploy tienda to Vercel (tienda.check-oil.com)
- [ ] Deploy admin to Vercel (admin-tienda.check-oil.com)
- [ ] Configure SSL/HTTPS
- [ ] Performance optimization
- [ ] Final QA
- [ ] Create README
- [ ] Tag v1.0.0

---

**Total: 65 tasks to full production-ready tienda online.**

