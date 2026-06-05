import { describe, it, expect } from '@jest/globals';
import OfertasService from '../../src/services/OfertasService.js';

describe('OfertasService', () => {
  describe('evaluateOffersForCart', () => {
    it('should return empty result when no ofertas provided', () => {
      const carrito = {
        items: [
          { productId: '1', variantId: null, cantidad: 5, precio: 100 },
        ],
        subtotal: 500,
      };

      const result = OfertasService.evaluateOffersForCart(carrito, []);

      expect(result).toEqual({
        aplicableOfertas: [],
        totalDescuento: 0,
        detalles: {},
      });
    });

    it('should return empty result when carrito is empty', () => {
      const carrito = {
        items: [],
        subtotal: 0,
      };

      const oferta = {
        id: 'oferta-1',
        nombre: 'Test Offer',
        activa: true,
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_fin: new Date(Date.now() + 86400000),
        condiciones: { tipo: 'cantidad_producto', producto_id: '1', minimo: 5, descuento: '15%' },
        aplicable_a: { tipo: 'productos', ids: ['1'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(0);
    });

    it('should apply single quantity discount correctly', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 6, precio: 100 },
        ],
        subtotal: 600,
      };

      const oferta = {
        id: 'oferta-1',
        nombre: 'Qty Discount 15%',
        activa: true,
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_fin: new Date(Date.now() + 86400000),
        condiciones: {
          tipo: 'cantidad_producto',
          producto_id: 'prod-1',
          minimo: 5,
          descuento: '15%',
        },
        aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(90); // 600 * 0.15
      expect(result.aplicableOfertas.length).toBe(1);
      expect(result.detalles.nombre).toBe('Qty Discount 15%');
    });

    it('should apply cart total amount discount', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 10, precio: 100 },
        ],
        subtotal: 1000,
      };

      const oferta = {
        id: 'oferta-2',
        nombre: 'Cart Amount Discount',
        activa: true,
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_fin: new Date(Date.now() + 86400000),
        condiciones: {
          tipo: 'monto_carrito',
          minimo: 500,
          descuento: '20%',
        },
        aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(200); // 1000 * 0.20
    });

    it('should apply cart quantity discount', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 5, precio: 100 },
          { productId: 'prod-2', variantId: null, cantidad: 8, precio: 50 },
        ],
        subtotal: 900,
      };

      const oferta = {
        id: 'oferta-3',
        nombre: 'Cart Items Discount',
        activa: true,
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_fin: new Date(Date.now() + 86400000),
        condiciones: {
          tipo: 'cantidad_carrito_items',
          minimo: 10,
          descuento: '10%',
        },
        aplicable_a: { tipo: 'productos', ids: ['prod-1', 'prod-2'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(90); // 900 * 0.10
    });

    it('should select best discount when multiple ofertas apply', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 15, precio: 100 },
        ],
        subtotal: 1500,
      };

      const ofertas = [
        {
          id: 'oferta-1',
          nombre: 'Offer 1: 10% discount',
          activa: true,
          fecha_inicio: new Date(Date.now() - 86400000),
          fecha_fin: new Date(Date.now() + 86400000),
          condiciones: { tipo: 'cantidad_carrito_items', minimo: 10, descuento: '10%' },
          aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
        },
        {
          id: 'oferta-2',
          nombre: 'Offer 2: 5% discount',
          activa: true,
          fecha_inicio: new Date(Date.now() - 86400000),
          fecha_fin: new Date(Date.now() + 86400000),
          condiciones: { tipo: 'cantidad_carrito_items', minimo: 5, descuento: '5%' },
          aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
        },
      ];

      const result = OfertasService.evaluateOffersForCart(carrito, ofertas);

      expect(result.totalDescuento).toBe(150); // Best discount: 1500 * 0.10
      expect(result.detalles.nombre).toBe('Offer 1: 10% discount');
    });

    it('should support AND conditions', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 5, precio: 100 },
        ],
        subtotal: 500,
      };

      const oferta = {
        id: 'oferta-4',
        nombre: 'AND Condition Discount',
        activa: true,
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_fin: new Date(Date.now() + 86400000),
        condiciones: {
          tipo: 'AND',
          condiciones: [
            { tipo: 'cantidad_producto', producto_id: 'prod-1', minimo: 5 },
            { tipo: 'monto_carrito', minimo: 400 },
          ],
          descuento: '25%',
        },
        aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(125); // 500 * 0.25
    });

    it('should not apply expired ofertas', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 5, precio: 100 },
        ],
        subtotal: 500,
      };

      const oferta = {
        id: 'oferta-5',
        nombre: 'Expired Offer',
        activa: true,
        fecha_inicio: new Date(Date.now() - 172800000), // 2 days ago
        fecha_fin: new Date(Date.now() - 86400000), // 1 day ago
        condiciones: { tipo: 'cantidad_producto', producto_id: 'prod-1', minimo: 5, descuento: '15%' },
        aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(0);
    });

    it('should not apply inactive ofertas', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 5, precio: 100 },
        ],
        subtotal: 500,
      };

      const oferta = {
        id: 'oferta-6',
        nombre: 'Inactive Offer',
        activa: false,
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_fin: new Date(Date.now() + 86400000),
        condiciones: { tipo: 'cantidad_producto', producto_id: 'prod-1', minimo: 5, descuento: '15%' },
        aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(0);
    });

    it('should handle fixed amount discounts', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', variantId: null, cantidad: 5, precio: 100 },
        ],
        subtotal: 500,
      };

      const oferta = {
        id: 'oferta-7',
        nombre: 'Fixed Discount',
        activa: true,
        fecha_inicio: new Date(Date.now() - 86400000),
        fecha_fin: new Date(Date.now() + 86400000),
        condiciones: {
          tipo: 'monto_carrito',
          minimo: 400,
          descuento: 50,
        },
        aplicable_a: { tipo: 'productos', ids: ['prod-1'] },
      };

      const result = OfertasService.evaluateOffersForCart(carrito, [oferta]);

      expect(result.totalDescuento).toBe(50);
    });
  });

  describe('evaluateCondition', () => {
    it('should evaluate cantidad_producto condition correctly', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', cantidad: 5 },
          { productId: 'prod-2', cantidad: 3 },
        ],
        subtotal: 0,
      };

      const condition = {
        tipo: 'cantidad_producto',
        producto_id: 'prod-1',
        minimo: 5,
      };

      const result = OfertasService.evaluateCondition(condition, carrito);
      expect(result).toBe(true);
    });

    it('should return false for cantidad_producto when minimum not met', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', cantidad: 3 },
        ],
        subtotal: 0,
      };

      const condition = {
        tipo: 'cantidad_producto',
        producto_id: 'prod-1',
        minimo: 5,
      };

      const result = OfertasService.evaluateCondition(condition, carrito);
      expect(result).toBe(false);
    });

    it('should evaluate monto_carrito condition', () => {
      const carrito = {
        items: [],
        subtotal: 600,
      };

      const condition = {
        tipo: 'monto_carrito',
        minimo: 500,
      };

      const result = OfertasService.evaluateCondition(condition, carrito);
      expect(result).toBe(true);
    });

    it('should evaluate cantidad_carrito_items condition', () => {
      const carrito = {
        items: [
          { cantidad: 5 },
          { cantidad: 8 },
        ],
        subtotal: 0,
      };

      const condition = {
        tipo: 'cantidad_carrito_items',
        minimo: 10,
      };

      const result = OfertasService.evaluateCondition(condition, carrito);
      expect(result).toBe(true);
    });

    it('should evaluate AND conditions', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', cantidad: 6 },
        ],
        subtotal: 600,
      };

      const condition = {
        tipo: 'AND',
        condiciones: [
          { tipo: 'cantidad_producto', producto_id: 'prod-1', minimo: 5 },
          { tipo: 'monto_carrito', minimo: 500 },
        ],
      };

      const result = OfertasService.evaluateCondition(condition, carrito);
      expect(result).toBe(true);
    });

    it('should evaluate OR conditions', () => {
      const carrito = {
        items: [
          { productId: 'prod-1', cantidad: 3 },
        ],
        subtotal: 300,
      };

      const condition = {
        tipo: 'OR',
        condiciones: [
          { tipo: 'cantidad_producto', producto_id: 'prod-1', minimo: 5 },
          { tipo: 'monto_carrito', minimo: 200 },
        ],
      };

      const result = OfertasService.evaluateCondition(condition, carrito);
      expect(result).toBe(true);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const carrito = {
        items: [],
        subtotal: 1000,
      };

      const condition = {
        descuento: '20%',
      };

      const result = OfertasService.calculateDiscount(condition, carrito);
      expect(result).toBe(200);
    });

    it('should calculate fixed amount discount', () => {
      const carrito = {
        items: [],
        subtotal: 1000,
      };

      const condition = {
        descuento: 50,
      };

      const result = OfertasService.calculateDiscount(condition, carrito);
      expect(result).toBe(50);
    });

    it('should return 0 for null condition', () => {
      const carrito = {
        items: [],
        subtotal: 1000,
      };

      const result = OfertasService.calculateDiscount(null, carrito);
      expect(result).toBe(0);
    });
  });

  describe('filterApplicableItems', () => {
    it('should filter items by product IDs', () => {
      const items = [
        { productId: 'prod-1', cantidad: 5 },
        { productId: 'prod-2', cantidad: 3 },
        { productId: 'prod-3', cantidad: 2 },
      ];

      const aplicableA = {
        tipo: 'productos',
        ids: ['prod-1', 'prod-3'],
      };

      const result = OfertasService.filterApplicableItems(items, aplicableA);
      expect(result).toHaveLength(2);
      expect(result[0].productId).toBe('prod-1');
      expect(result[1].productId).toBe('prod-3');
    });

    it('should return all items when no filter is provided', () => {
      const items = [
        { productId: 'prod-1', cantidad: 5 },
        { productId: 'prod-2', cantidad: 3 },
      ];

      const aplicableA = {
        tipo: 'productos',
        ids: [],
      };

      const result = OfertasService.filterApplicableItems(items, aplicableA);
      expect(result).toEqual(items);
    });
  });
});
