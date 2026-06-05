import { describe, it, expect, beforeEach } from '@jest/globals';
import StockService from '../../src/services/StockService.js';

describe('StockService', () => {
  let mockModels;

  beforeEach(() => {
    // Setup mock models
    mockModels = {
      Product: {
        findByPk: async (id) => {
          const products = {
            'prod-1': { id: 'prod-1', stock_actual: 100, stock_minimo: 5 },
            'prod-2': { id: 'prod-2', stock_actual: 2, stock_minimo: 5 },
            'prod-3': { id: 'prod-3', stock_actual: 0, stock_minimo: 5 },
          };
          return products[id] || null;
        },
        update: async (data, options) => {
          // Mock update - would normally update DB
          return [1];
        },
        findAll: async (options) => {
          // Mock findAll for stock alerts
          return [
            { id: 'prod-2', nombre: 'Low Stock Product', stock_actual: 2, stock_minimo: 5 },
            { id: 'prod-3', nombre: 'Out of Stock', stock_actual: 0, stock_minimo: 5 },
          ];
        },
      },
      Variant: {
        findByPk: async (id) => {
          const variants = {
            'var-1': { id: 'var-1', stock_variante: 50 },
            'var-2': { id: 'var-2', stock_variante: 2 },
          };
          return variants[id] || null;
        },
        update: async (data, options) => {
          return [1];
        },
      },
      StockHistory: {
        create: async (data) => {
          return data;
        },
      },
    };

    StockService.setModels(mockModels);
  });

  describe('reserveStock', () => {
    it('should reserve stock successfully when sufficient inventory exists', async () => {
      const result = await StockService.reserveStock('prod-1', null, 30);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(70); // 100 - 30
      expect(result.alert).toBe(false); // 70 is not below 5
    });

    it('should throw error when insufficient stock', async () => {
      await expect(
        StockService.reserveStock('prod-2', null, 10),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should set alert flag when stock falls below minimum', async () => {
      const result = await StockService.reserveStock('prod-1', null, 96); // 100 - 96 = 4, which is < 5

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(4);
      expect(result.alert).toBe(true);
    });

    it('should reserve stock from variant when variant ID provided', async () => {
      const result = await StockService.reserveStock('prod-1', 'var-1', 20);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(30); // 50 - 20
    });

    it('should throw error when variant not found', async () => {
      await expect(
        StockService.reserveStock('prod-1', 'invalid-var', 10),
      ).rejects.toThrow('Variant not found');
    });

    it('should throw error when product not found', async () => {
      await expect(
        StockService.reserveStock('invalid-prod', null, 10),
      ).rejects.toThrow('Product not found');
    });

    it('should create stock history entry on reservation', async () => {
      let historyCreated = false;
      mockModels.StockHistory.create = async (data) => {
        historyCreated = true;
        expect(data.tipo).toBe('compra');
        expect(data.cantidad_cambio).toBe(-20);
        expect(data.producto_id).toBe('prod-1');
        return data;
      };

      await StockService.reserveStock('prod-1', null, 20);
      expect(historyCreated).toBe(true);
    });
  });

  describe('releaseReservation', () => {
    it('should release stock and increase inventory', async () => {
      const newStock = await StockService.releaseReservation('prod-1', null, 30);

      expect(newStock).toBe(130); // 100 + 30
    });

    it('should create stock history entry with tipo devolucion', async () => {
      let historyType = null;
      mockModels.StockHistory.create = async (data) => {
        historyType = data.tipo;
        return data;
      };

      await StockService.releaseReservation('prod-1', null, 20);
      expect(historyType).toBe('devolucion');
    });

    it('should release stock from variant', async () => {
      const newStock = await StockService.releaseReservation('prod-1', 'var-1', 10);

      expect(newStock).toBe(60); // 50 + 10
    });

    it('should throw error when product not found', async () => {
      await expect(
        StockService.releaseReservation('invalid-prod', null, 10),
      ).rejects.toThrow('Product not found');
    });
  });

  describe('getStockAlerts', () => {
    it('should return products with stock below minimum', async () => {
      const alerts = await StockService.getStockAlerts();

      expect(alerts).toHaveLength(2);
      expect(alerts[0].productId).toBe('prod-2');
      expect(alerts[0].stock_actual).toBe(2);
      expect(alerts[0].stock_minimo).toBe(5);
    });

    it('should calculate urgency score correctly', async () => {
      const alerts = await StockService.getStockAlerts();

      // prod-2: (5-2)/5 * 100 = 60
      // prod-3: 0 items = 100 (critical)
      expect(alerts[0].urgency).toBeGreaterThan(0);
      expect(alerts[1].urgency).toBe(100); // Out of stock = max urgency
    });

    it('should include product names in alerts', async () => {
      const alerts = await StockService.getStockAlerts();

      expect(alerts[0].nombre).toBeDefined();
      expect(typeof alerts[0].nombre).toBe('string');
    });
  });

  describe('adjustStockManually', () => {
    it('should increase stock with positive adjustment', async () => {
      const newStock = await StockService.adjustStockManually(
        'prod-1',
        null,
        25,
        'Inventory count correction',
        'admin-1',
      );

      expect(newStock).toBe(125); // 100 + 25
    });

    it('should decrease stock with negative adjustment', async () => {
      const newStock = await StockService.adjustStockManually(
        'prod-1',
        null,
        -15,
        'Loss due to damage',
        'admin-1',
      );

      expect(newStock).toBe(85); // 100 - 15
    });

    it('should throw error if stock would go negative', async () => {
      await expect(
        StockService.adjustStockManually('prod-2', null, -10, 'Invalid', 'admin-1'),
      ).rejects.toThrow('Stock cannot be negative');
    });

    it('should create stock history entry with tipo ajuste_manual', async () => {
      let historyType = null;
      mockModels.StockHistory.create = async (data) => {
        historyType = data.tipo;
        return data;
      };

      await StockService.adjustStockManually('prod-1', null, 20, 'Test', 'admin-1');
      expect(historyType).toBe('ajuste_manual');
    });

    it('should record admin user ID in history', async () => {
      let adminId = null;
      mockModels.StockHistory.create = async (data) => {
        adminId = data.usuario_admin_id;
        return data;
      };

      await StockService.adjustStockManually('prod-1', null, 20, 'Test', 'admin-123');
      expect(adminId).toBe('admin-123');
    });

    it('should adjust variant stock', async () => {
      const newStock = await StockService.adjustStockManually(
        'prod-1',
        'var-1',
        15,
        'Restock',
        'admin-1',
      );

      expect(newStock).toBe(65); // 50 + 15
    });

    it('should throw error when models not initialized', async () => {
      const service = new (StockService.constructor)();
      await expect(
        service.adjustStockManually('prod-1', null, 10, 'Test', 'admin-1'),
      ).rejects.toThrow('Models not initialized');
    });
  });

  describe('reserveStock with edge cases', () => {
    it('should reserve exact quantity at minimum threshold', async () => {
      const result = await StockService.reserveStock('prod-1', null, 100);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(0);
      expect(result.alert).toBe(true); // 0 is below 5
    });

    it('should not reserve when stock equals required amount', async () => {
      const result = await StockService.reserveStock('prod-2', null, 2);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(0);
    });
  });
});
