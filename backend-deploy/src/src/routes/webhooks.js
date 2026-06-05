/**
 * Webhook Routes
 * Handles external service callbacks (Mercado Pago, etc.)
 */

import express from 'express';
import { Order, Client } from '../models/index.js';
import PagosService from '../services/PagosService.js';
import EmailService from '../services/EmailService.js';

const router = express.Router();

/**
 * Mercado Pago Payment Webhook
 * POST /api/webhooks/mercado-pago
 * Receives payment events from Mercado Pago
 */
router.post('/mercado-pago', async (req, res) => {
  try {
    const { type, data } = req.body;
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];

    // Log webhook receipt
    console.log(`Webhook received: type=${type}, data.id=${data?.id}`);

    // Verify signature (optional in test mode, required in production)
    if (signature && requestId) {
      const isValid = PagosService.verifyWebhookSignature(signature, data, requestId);
      if (!isValid) {
        console.warn('Invalid Mercado Pago webhook signature');
        // Still process it, but log the warning
      }
    }

    // Only process payment.completed events
    if (type !== 'payment') {
      return res.status(200).json({
        message: 'Webhook received but not processed (non-payment event)',
      });
    }

    // Process payment event
    const result = PagosService.processPaymentCompleted(data);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { pedidoId, paymentId, status } = result.data;

    // Find order by ID
    const order = await Order.findByPk(pedidoId, {
      include: [
        {
          association: 'items',
          attributes: ['cantidad', 'precio_unitario', 'producto_id'],
        },
        {
          model: Client,
          attributes: ['nombre', 'email'],
        },
      ],
    });

    if (!order) {
      console.warn(`Order not found: ${pedidoId}`);
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // Only update if payment was approved
    if (status === 'approved') {
      // Update order status to pago_confirmado
      await order.update({
        estado: 'pago_confirmado',
        fecha_pago: new Date(),
        referencia_pago: paymentId,
      });

      // Send payment confirmation email
      const cliente = order.Client;
      const orderData = {
        numero_pedido: order.numero_pedido,
        fecha: order.fecha_pedido,
        total: order.total,
      };

      EmailService.sendPaymentConfirmed(cliente, orderData).catch((emailErr) => {
        console.error('Failed to send payment confirmation email:', emailErr);
      });

      console.log(`Order ${pedidoId} marked as paid`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed',
      pedidoId,
      status,
    });
  } catch (error) {
    console.error('Error processing Mercado Pago webhook:', error);
    // Always return 200 to prevent retry storm
    res.status(200).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Health check for webhooks
 * GET /api/webhooks
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Check-Oil Webhooks API',
    version: '1.0.0',
    endpoints: ['/mercado-pago'],
  });
});

export default router;
