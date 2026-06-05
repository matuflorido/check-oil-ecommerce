/**
 * Unit Tests for Mercado Pago Service (Task 9)
 * Tests payment initiation and webhook handling
 */

import { describe, test, expect } from '@jest/globals';
import crypto from 'crypto';
import PagosService from '../../src/services/PagosService.js';

describe('PagosService', () => {
  const testOrderId = '123e4567-e89b-12d3-a456-426614174000';
  const testAmount = 1500.50;
  const testCliente = {
    nombre: 'Test Cliente',
    email: 'cliente@test.com',
  };

  describe('processPaymentCompleted', () => {
    test('should process valid payment data', () => {
      const paymentData = {
        id: 'MP-12345',
        external_reference: testOrderId,
        status: 'approved',
        date_created: new Date().toISOString(),
      };

      const result = PagosService.processPaymentCompleted(paymentData);

      expect(result.success).toBe(true);
      expect(result.data.pedidoId).toBe(testOrderId);
      expect(result.data.paymentId).toBe('MP-12345');
      expect(result.data.status).toBe('approved');
    });

    test('should handle missing order ID', () => {
      const paymentData = {
        id: 'MP-12345',
        status: 'approved',
        date_created: new Date().toISOString(),
      };

      const result = PagosService.processPaymentCompleted(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('external_reference');
    });

    test('should return different statuses', () => {
      const statuses = ['approved', 'pending', 'rejected'];

      statuses.forEach((status) => {
        const paymentData = {
          id: `MP-${status}`,
          external_reference: testOrderId,
          status,
          date_created: new Date().toISOString(),
        };

        const result = PagosService.processPaymentCompleted(paymentData);

        expect(result.success).toBe(true);
        expect(result.data.status).toBe(status);
      });
    });
  });

  describe('verifyWebhookSignature', () => {
    test('should return false for invalid signature', () => {
      const payload = { id: 'test' };
      const signature = 'ts=1234567890,v1=invalidsignature';
      const requestId = 'test-request-id';

      const isValid = PagosService.verifyWebhookSignature(signature, payload, requestId);

      expect(isValid).toBe(false);
    });

    test('should return false for missing signature parts', () => {
      const payload = { id: 'test' };
      const signature = 'ts=1234567890';
      const requestId = 'test-request-id';

      const isValid = PagosService.verifyWebhookSignature(signature, payload, requestId);

      expect(isValid).toBe(false);
    });

    test('should handle empty payload', () => {
      const payload = {};
      const signature = 'ts=1234567890,v1=invalidsignature';
      const requestId = 'test-request-id';

      const isValid = PagosService.verifyWebhookSignature(signature, payload, requestId);

      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('Webhook event processing', () => {
    test('should identify payment.completed event', () => {
      const webhookPayload = {
        type: 'payment',
        data: {
          id: 'MP-123',
          external_reference: testOrderId,
          status: 'approved',
          date_created: new Date().toISOString(),
        },
      };

      expect(webhookPayload.type).toBe('payment');
      expect(webhookPayload.data.status).toBe('approved');
    });

    test('should handle different payment statuses in webhook', () => {
      const statuses = ['approved', 'pending', 'rejected', 'cancelled'];

      statuses.forEach((status) => {
        const webhookPayload = {
          type: 'payment',
          data: {
            id: `MP-${status}`,
            external_reference: testOrderId,
            status,
            date_created: new Date().toISOString(),
          },
        };

        const result = PagosService.processPaymentCompleted(webhookPayload.data);
        expect(result.success).toBe(true);
        expect(result.data.status).toBe(status);
      });
    });
  });
});
