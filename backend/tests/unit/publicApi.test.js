import { describe, test, expect } from '@jest/globals';
import {
  generateOrderNumber,
  validateOrderInput,
  calculateOrderFromCart,
} from '../../src/utils/orderHelpers.js';

/**
 * Unit tests for public API utilities (TASKS 7-8)
 * Tests helper functions for orders and cart
 */

describe('Order Helpers', () => {
  describe('generateOrderNumber', () => {
    test('should generate unique order numbers in correct format', () => {
      const num1 = generateOrderNumber();
      const num2 = generateOrderNumber();

      // Check format CHK-[timestamp]-[random]
      expect(num1).toMatch(/^CHK-\d{8}-\d{4}$/);
      expect(num2).toMatch(/^CHK-\d{8}-\d{4}$/);

      // Check uniqueness (very high probability)
      expect(num1).not.toBe(num2);
    });

    test('should always start with CHK-', () => {
      for (let i = 0; i < 10; i += 1) {
        const num = generateOrderNumber();
        expect(num.startsWith('CHK-')).toBe(true);
      }
    });
  });

  describe('validateOrderInput', () => {
    test('should validate correct order input', () => {
      const input = {
        items: [
          { productId: '123e4567-e89b-12d3-a456-426614174000', cantidad: 1 },
        ],
        cliente: {
          email: 'test@example.com',
          nombre: 'Test User',
          telefono: '1234567890',
          direccion: '123 Test St',
          ciudad: 'Test City',
          provincia: 'Test Province',
        },
        metodoPago: 'transferencia',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should reject empty items array', () => {
      const input = {
        items: [],
        cliente: { email: 'test@example.com', nombre: 'Test', direccion: 'Test', ciudad: 'City', provincia: 'Province' },
        metodoPago: 'transferencia',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject item without productId', () => {
      const input = {
        items: [{ cantidad: 1 }],
        cliente: { email: 'test@example.com', nombre: 'Test', direccion: 'Test', ciudad: 'City', provincia: 'Province' },
        metodoPago: 'transferencia',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(false);
    });

    test('should reject item with cantidad < 1', () => {
      const input = {
        items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', cantidad: 0 }],
        cliente: { email: 'test@example.com', nombre: 'Test', direccion: 'Test', ciudad: 'City', provincia: 'Province' },
        metodoPago: 'transferencia',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(false);
    });

    test('should reject invalid email', () => {
      const input = {
        items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', cantidad: 1 }],
        cliente: {
          email: 'not-an-email',
          nombre: 'Test',
          direccion: 'Test',
          ciudad: 'City',
          provincia: 'Province',
        },
        metodoPago: 'transferencia',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('email'))).toBe(true);
    });

    test('should reject invalid payment method', () => {
      const input = {
        items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', cantidad: 1 }],
        cliente: {
          email: 'test@example.com',
          nombre: 'Test',
          direccion: 'Test',
          ciudad: 'City',
          provincia: 'Province',
        },
        metodoPago: 'invalid_method',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('metodoPago'))).toBe(true);
    });

    test('should reject missing cliente object', () => {
      const input = {
        items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', cantidad: 1 }],
        metodoPago: 'transferencia',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(false);
    });

    test('should require all cliente fields', () => {
      const input = {
        items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', cantidad: 1 }],
        cliente: {
          email: 'test@example.com',
          nombre: 'Test',
          // Missing direccion, ciudad, provincia
        },
        metodoPago: 'transferencia',
      };

      const result = validateOrderInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('calculateOrderFromCart', () => {
    test('should calculate totals correctly without discounts', () => {
      const cart = {
        subtotal: 100,
        descuentos: 0,
        costoEnvio: 0,
      };

      const result = calculateOrderFromCart(cart);
      expect(result.subtotal).toBe(100);
      expect(result.descuentos).toBe(0);
      expect(result.costoEnvio).toBe(0);
      expect(result.total).toBe(100);
    });

    test('should apply discounts correctly', () => {
      const cart = {
        subtotal: 100,
        descuentos: 10,
        costoEnvio: 0,
      };

      const result = calculateOrderFromCart(cart);
      expect(result.total).toBe(90);
    });

    test('should add shipping cost', () => {
      const cart = {
        subtotal: 100,
        descuentos: 0,
        costoEnvio: 15,
      };

      const result = calculateOrderFromCart(cart);
      expect(result.total).toBe(115);
    });

    test('should calculate all together', () => {
      const cart = {
        subtotal: 100,
        descuentos: 10,
        costoEnvio: 15,
      };

      const result = calculateOrderFromCart(cart);
      expect(result.total).toBe(105); // 100 - 10 + 15
    });

    test('should never return negative total', () => {
      const cart = {
        subtotal: 10,
        descuentos: 100,
        costoEnvio: 0,
      };

      const result = calculateOrderFromCart(cart);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    test('should parse string values to numbers', () => {
      const cart = {
        subtotal: '100.50',
        descuentos: '10.25',
        costoEnvio: '5.00',
      };

      const result = calculateOrderFromCart(cart);
      expect(typeof result.subtotal).toBe('number');
      expect(typeof result.total).toBe('number');
      expect(result.total).toBe(95.25); // 100.50 - 10.25 + 5.00
    });

    test('should handle missing properties with defaults', () => {
      const cart = {};

      const result = calculateOrderFromCart(cart);
      expect(result.subtotal).toBe(0);
      expect(result.descuentos).toBe(0);
      expect(result.costoEnvio).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
