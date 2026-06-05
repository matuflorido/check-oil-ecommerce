# Check-Oil Public API Documentation

Complete API reference for the Check-Oil ecommerce platform (Tasks 7-8).

## Base URL

```
http://localhost:3000/api
```

## Authentication

Public endpoints do not require authentication. All requests should include standard HTTP headers.

## Response Format

All responses follow a consistent JSON structure:

### Success Response
```json
{
  "data": {
    "key": "value"
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [
    { "field": "fieldName", "message": "Error message" }
  ]
}
```

## Endpoints

### Products

#### GET /productos
Browse products with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 20, max: 100) - Items per page
- `categoria` (string, optional) - Category UUID filter
- `precioMin` (number, optional) - Minimum price filter
- `precioMax` (number, optional) - Maximum price filter
- `search` (string, optional) - Search by product name
- `ordenar` (string, default: 'nombre') - Sort by: 'nombre', 'precio', 'nuevo'

**Response:**
```json
{
  "data": {
    "productos": [
      {
        "id": "uuid",
        "nombre": "Product Name",
        "descripcion": "Description",
        "precio_base": 100.00,
        "imagen_url": "https://...",
        "stock_actual": 50,
        "category": {
          "id": "uuid",
          "nombre": "Category Name",
          "slug": "category-slug"
        },
        "variants": [
          {
            "id": "uuid",
            "nombre": "Variant Name",
            "precio_ajuste": 10.00,
            "stock_variante": 20,
            "atributos": {}
          }
        ],
        "aplicableOfertas": [],
        "descuentoTotal": 0,
        "precioFinal": 100.00
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid query parameters

---

#### GET /productos/:id
Get detailed information for a single product including applicable offers.

**URL Parameters:**
- `id` (string) - Product UUID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "nombre": "Product Name",
    "descripcion": "Description",
    "precio_base": 100.00,
    "imagen_url": "https://...",
    "stock_actual": 50,
    "stock_minimo": 5,
    "activo": true,
    "variants": [...],
    "category": {...},
    "aplicableOfertas": [
      {
        "ofertaId": "uuid",
        "nombre": "Offer Name",
        "descuento": 10,
        "condiciones": ["10% discount on subtotal"],
        "aplicaA": "productos"
      }
    ],
    "descuentoTotal": 10,
    "precioFinal": 90.00
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Product not found or inactive

---

### Categories

#### GET /categorias
Get all active product categories in hierarchical structure.

**Query Parameters:**
None

**Response:**
```json
{
  "data": {
    "categorias": [
      {
        "id": "uuid",
        "nombre": "Parent Category",
        "slug": "parent-category",
        "descripcion": "Description",
        "subcategorias": [
          {
            "id": "uuid",
            "nombre": "Subcategory",
            "slug": "subcategory",
            "descripcion": "Description"
          }
        ]
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success

---

### Offers

#### GET /ofertas
Get all currently active offers.

**Query Parameters:**
- `page` (number, default: 1) - Page number (optional)
- `limit` (number, default: 50, max: 100) - Items per page (optional)

**Response:**
```json
{
  "data": {
    "ofertas": [
      {
        "id": "uuid",
        "nombre": "Offer Name",
        "descripcion": "Description",
        "banner_imagen": "https://...",
        "condiciones": {
          "tipo": "monto_carrito",
          "minimo": 100,
          "descuento": "10%",
          "aplicar_a": "subtotal"
        },
        "aplicable_a": {
          "tipo": "productos",
          "ids": ["uuid1", "uuid2"]
        },
        "fecha_fin": "2024-12-31T23:59:59.000Z"
      }
    ],
    "total": 5
  }
}
```

**Status Codes:**
- `200 OK` - Success

---

### Cart

#### POST /carrito
Calculate cart totals with applicable discounts.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid (optional)",
      "cantidad": 2
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "items": [
      {
        "productId": "uuid",
        "variantId": "uuid or null",
        "nombre": "Product Name",
        "cantidad": 2,
        "precioUnitario": 110.00,
        "subtotal": 220.00
      }
    ],
    "subtotal": 220.00,
    "descuentos": 22.00,
    "costoEnvio": 0,
    "total": 198.00,
    "aplicableOfertas": [
      {
        "ofertaId": "uuid",
        "nombre": "10% Discount",
        "descuento": 22,
        "condiciones": ["Discount over subtotal"],
        "aplicaA": "productos"
      }
    ],
    "detalles": {
      "ofertaSeleccionada": "uuid",
      "nombre": "10% Discount",
      "condiciones": ["Discount over subtotal"]
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid request or product not found
- `409 Conflict` - Insufficient stock

---

### Orders

#### POST /pedidos
Create a new order.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid (optional)",
      "cantidad": 1
    }
  ],
  "cliente": {
    "email": "customer@example.com",
    "nombre": "Customer Name",
    "telefono": "1234567890 (optional)",
    "direccion": "123 Main St",
    "ciudad": "City Name",
    "provincia": "Province Name"
  },
  "metodoPago": "transferencia | mercado_pago | efectivo"
}
```

**Response:**
```json
{
  "data": {
    "numero_pedido": "CHK-12345678-9012",
    "estado": "pago_confirmado",
    "subtotal": 220.00,
    "descuentos": 22.00,
    "total": 198.00,
    "proximoPaso": "esperando_pago",
    "instrucciones": "Su pedido está siendo procesado. Nos contactaremos pronto."
  }
}
```

**For Mercado Pago payments:**
```json
{
  "data": {
    "numero_pedido": "CHK-12345678-9012",
    "estado": "pendiente",
    "subtotal": 220.00,
    "descuentos": 22.00,
    "total": 198.00,
    "proximoPaso": "ir_a_mercado_pago",
    "pagoLink": null
  }
}
```

**Order States:**
- `pendiente` - Payment pending (Mercado Pago)
- `pago_confirmado` - Payment confirmed (Transfer, Cash)
- `preparando` - Being prepared
- `envio_coordinado` - Ready for shipment
- `entregado` - Delivered
- `cancelado` - Cancelled

**Status Codes:**
- `201 Created` - Order created successfully
- `400 Bad Request` - Invalid request data or missing required fields
- `409 Conflict` - Insufficient stock available

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific error message for this field"
    }
  ]
}
```

### Common Error Codes

- `400 Bad Request` - Invalid input, missing required fields, or validation failed
- `404 Not Found` - Resource not found
- `409 Conflict` - Business logic conflict (e.g., insufficient stock)
- `500 Internal Server Error` - Server error

---

## Rate Limiting

The API implements rate limiting:
- **Window:** 15 minutes
- **Limit:** 100 requests per IP address
- **Headers:** Responses include `RateLimit-*` headers

---

## Validation Rules

### Products
- IDs must be valid UUIDs
- Prices must be positive numbers

### Cart Items
- `productId` is required and must be a valid UUID
- `cantidad` must be a positive integer
- `variantId` is optional but if provided must be a valid UUID

### Orders
- Email must be valid format
- All customer fields are required (email, nombre, direccion, ciudad, provincia)
- `metodoPago` must be one of: `transferencia`, `mercado_pago`, `efectivo`
- Items array must contain at least one item

---

## Example Workflows

### 1. Browse Products
```bash
GET /api/productos?categoria=abc-uuid&limit=20&page=1
```

### 2. Get Product Details
```bash
GET /api/productos/product-uuid
```

### 3. Calculate Cart
```bash
POST /api/carrito
Body: {
  "items": [
    {"productId": "uuid1", "cantidad": 2},
    {"productId": "uuid2", "variantId": "variant-uuid", "cantidad": 1}
  ]
}
```

### 4. Create Order
```bash
POST /api/pedidos
Body: {
  "items": [{"productId": "uuid1", "cantidad": 2}],
  "cliente": {
    "email": "user@example.com",
    "nombre": "John Doe",
    "direccion": "123 Main St",
    "ciudad": "Buenos Aires",
    "provincia": "Buenos Aires"
  },
  "metodoPago": "transferencia"
}
```

---

## Implementation Notes

- All prices are in the customer's local currency (ARS or USD)
- Stock is reserved immediately upon order creation
- Offers are evaluated in real-time based on current conditions
- Emails are sent asynchronously after successful order creation
- Timestamps are in ISO 8601 format (UTC)
