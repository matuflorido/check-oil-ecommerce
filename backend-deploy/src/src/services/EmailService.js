/**
 * EmailService - SendGrid Integration
 * Handles sending transactional emails for orders, payments, and status updates
 */

import sgMail from '@sendgrid/mail';
import {
  orderConfirmationTemplate,
  paymentConfirmedTemplate,
  statusUpdateTemplate,
  shippingCoordinationTemplate,
} from '../utils/emailTemplates.js';

class EmailService {
  constructor() {
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
    }
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@check-oil.com';
  }

  /**
   * Send order confirmation email
   * @param {Object} cliente - { nombre, email }
   * @param {Object} pedido - { numero_pedido, fecha, total, descuento }
   * @param {Array} items - [{ nombre, cantidad, precio }]
   * @returns {Promise<Object>} SendGrid response
   */
  async sendOrderConfirmation(cliente, pedido, items) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured. Email not sent.');
        return { success: false, message: 'SendGrid not configured' };
      }

      const htmlContent = orderConfirmationTemplate(cliente, pedido, items);

      const msg = {
        to: cliente.email,
        from: this.fromEmail,
        subject: `Confirmación de tu pedido Check-Oil #${pedido.numero_pedido}`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment confirmation email
   * @param {Object} cliente - { nombre, email }
   * @param {Object} pedido - { numero_pedido, fecha, total }
   * @returns {Promise<Object>} SendGrid response
   */
  async sendPaymentConfirmed(cliente, pedido) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured. Email not sent.');
        return { success: false, message: 'SendGrid not configured' };
      }

      const htmlContent = paymentConfirmedTemplate(cliente, pedido);

      const msg = {
        to: cliente.email,
        from: this.fromEmail,
        subject: `Pago confirmado - Pedido #${pedido.numero_pedido}`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order status update email
   * @param {Object} cliente - { nombre, email }
   * @param {Object} pedido - { numero_pedido, fecha }
   * @param {string} nuevoEstado - New order state
   * @returns {Promise<Object>} SendGrid response
   */
  async sendStatusUpdate(cliente, pedido, nuevoEstado) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured. Email not sent.');
        return { success: false, message: 'SendGrid not configured' };
      }

      const htmlContent = statusUpdateTemplate(cliente, pedido, nuevoEstado);

      const stateLabels = {
        preparando: 'siendo preparado',
        envio_coordinado: 'listo para envío',
        entregado: 'entregado',
        cancelado: 'cancelado',
      };

      const stateLabel = stateLabels[nuevoEstado] || nuevoEstado;

      const msg = {
        to: cliente.email,
        from: this.fromEmail,
        subject: `Tu pedido #${pedido.numero_pedido} está ${stateLabel}`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending status update email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send shipping coordination request email
   * @param {Object} cliente - { nombre, email }
   * @param {Object} pedido - { numero_pedido }
   * @param {string} instrucciones - Shipping instructions
   * @returns {Promise<Object>} SendGrid response
   */
  async sendCoordinateShipping(cliente, pedido, instrucciones) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured. Email not sent.');
        return { success: false, message: 'SendGrid not configured' };
      }

      const htmlContent = shippingCoordinationTemplate(cliente, pedido, instrucciones);

      const msg = {
        to: cliente.email,
        from: this.fromEmail,
        subject: `Coordina tu envío - Pedido #${pedido.numero_pedido}`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending shipping coordination email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send generic email (internal use)
   * @param {Object} msg - SendGrid message object
   * @returns {Promise<Object>}
   */
  async send(msg) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured. Email not sent.');
        return { success: false, message: 'SendGrid not configured' };
      }

      const response = await sgMail.send(msg);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
