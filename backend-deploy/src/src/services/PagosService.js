/**
 * Mercado Pago Integration Service
 * Handles payment initiation, webhooks, and status verification
 */

import crypto from 'crypto';
import env from '../config/environment.js';

class PagosService {
  constructor() {
    // Note: Mercado Pago SDK initialization happens in actual payment operations
    // Token is passed in each request
  }

  /**
   * Initiate Mercado Pago payment
   * @param {string} pedidoId - Order ID
   * @param {number} total - Total amount to pay
   * @param {Object} cliente - { nombre, email }
   * @returns {Promise<Object>} { success: boolean, link?: string, error?: string }
   */
  async initiateMercadoPagoPayment(pedidoId, total, cliente) {
    try {
      if (!env.MERCADOPAGO_ACCESS_TOKEN) {
        throw new Error('Mercado Pago credentials not configured');
      }

      // In production, this would call the actual Mercado Pago API
      // For now, return a mock payment link structure
      const paymentLink = `https://www.mercadopago.com.ar/checkout/v1/redirect?preference-id=${pedidoId}`;

      return {
        success: true,
        link: paymentLink,
        preferenceId: pedidoId,
      };
    } catch (error) {
      console.error('Error initiating Mercado Pago payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify Mercado Pago webhook signature
   * @param {string} signature - X-Signature header value
   * @param {Object} payload - Request body
   * @param {string} requestId - X-Request-ID header value
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(signature, payload, requestId) {
    try {
      if (!env.MERCADOPAGO_ACCESS_TOKEN) {
        console.warn('Mercado Pago credentials not configured for webhook verification');
        return false;
      }

      // Create the signing string: X-Request-ID|<payload_json>|access_token
      const stringToSign = `${requestId}|${JSON.stringify(payload)}|${env.MERCADOPAGO_ACCESS_TOKEN}`;

      // SHA-256 hash
      const hash = crypto.createHash('sha256').update(stringToSign).digest('hex');

      // Expected signature format: ts=<timestamp>,v1=<hash>
      const signatureParts = signature.split(',').reduce((acc, part) => {
        const [key, value] = part.split('=');
        acc[key.trim()] = value.trim();
        return acc;
      }, {});

      // Compare hashes
      return signatureParts.v1 === hash;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Handle payment.completed webhook event
   * @param {Object} data - Webhook data payload
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  processPaymentCompleted(data) {
    try {
      // Extract order ID from external_reference
      const pedidoId = data.external_reference;
      const paymentId = data.id;
      const status = data.status;

      if (!pedidoId) {
        throw new Error('Missing external_reference (order ID) in payment data');
      }

      return {
        success: true,
        data: {
          pedidoId,
          paymentId,
          status,
          transactionDate: data.date_created,
        },
      };
    } catch (error) {
      console.error('Error processing payment completed event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment status from Mercado Pago
   * @param {string} paymentId - Payment/Transaction ID
   * @returns {Promise<Object>}
   */
  async getPaymentStatus(paymentId) {
    try {
      if (!env.MERCADOPAGO_ACCESS_TOKEN) {
        throw new Error('Mercado Pago credentials not configured');
      }

      // In production, this would call the actual Mercado Pago API
      // For now, return mock data
      return {
        success: true,
        status: 'approved',
        id: paymentId,
        externalReference: paymentId,
        amount: 0,
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new PagosService();
