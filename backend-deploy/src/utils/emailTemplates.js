/**
 * Email Template Generators
 * Creates professional HTML email templates with dark theme and orange accents
 */

const COLORS = {
  background: '#1A1A1A',
  text: '#E8E8E8',
  textLight: '#B0B0B0',
  orange: '#F78E1E',
  border: '#333333',
  cardBg: '#242424',
};

/**
 * Generate order confirmation email template
 * @param {Object} cliente - { nombre, email }
 * @param {Object} pedido - { numero_pedido, fecha, total }
 * @param {Array} items - [{ nombre, cantidad, precio }]
 * @returns {string} HTML email template
 */
function orderConfirmationTemplate(cliente, pedido, items) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid ${COLORS.border};">
        <td style="padding: 12px; color: ${COLORS.text}; text-align: left;">
          ${item.nombre}
        </td>
        <td style="padding: 12px; color: ${COLORS.text}; text-align: center;">
          ${item.cantidad}
        </td>
        <td style="padding: 12px; color: ${COLORS.text}; text-align: right;">
          $${(item.precio * item.cantidad).toFixed(2)}
        </td>
      </tr>
    `,
    )
    .join('');

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const descuento = pedido.descuento || 0;
  const total = pedido.total || subtotal - descuento;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${COLORS.background}; }
        .header { padding: 40px 20px; text-align: center; background-color: ${COLORS.cardBg}; }
        .logo { font-size: 28px; font-weight: bold; color: ${COLORS.orange}; }
        .content { padding: 30px 20px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; color: ${COLORS.orange}; margin-bottom: 15px; }
        .order-number { font-size: 24px; font-weight: bold; color: ${COLORS.orange}; margin: 15px 0; }
        .info { background-color: ${COLORS.cardBg}; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info-label { font-size: 12px; color: ${COLORS.textLight}; text-transform: uppercase; }
        .info-value { font-size: 16px; color: ${COLORS.text}; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { text-align: left; padding: 12px; background-color: ${COLORS.cardBg}; color: ${COLORS.orange}; font-weight: bold; }
        .total-row { background-color: ${COLORS.cardBg}; font-weight: bold; }
        .total-row td { padding: 12px; color: ${COLORS.orange}; }
        .message { color: ${COLORS.text}; line-height: 1.6; }
        .footer { background-color: ${COLORS.cardBg}; padding: 20px; text-align: center; color: ${COLORS.textLight}; font-size: 12px; }
        .cta { background-color: ${COLORS.orange}; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CHECK-OIL</div>
          <p style="color: ${COLORS.textLight}; margin: 10px 0 0 0;">Lubricantes de Calidad</p>
        </div>

        <div class="content">
          <div class="section">
            <p style="color: ${COLORS.text}; font-size: 16px;">Hola <strong>${cliente.nombre}</strong>,</p>
            <p style="color: ${COLORS.text}; line-height: 1.6;">
              ¡Gracias por tu compra! Tu pedido ha sido registrado correctamente.
              Te contactaremos pronto para coordinar el envío.
            </p>
          </div>

          <div class="section">
            <div class="section-title">Detalles del Pedido</div>
            <div class="order-number">#${pedido.numero_pedido}</div>
            <div class="info">
              <div class="info-label">Fecha</div>
              <div class="info-value">${new Date(pedido.fecha).toLocaleDateString('es-AR')}</div>
            </div>
            <div class="info">
              <div class="info-label">Email</div>
              <div class="info-value">${cliente.email}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Productos Solicitados</div>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right;">Subtotal:</td>
                  <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
                </tr>
                ${
  descuento > 0
    ? `<tr style="border-bottom: 1px solid ${COLORS.border};">
                  <td colspan="2" style="padding: 12px; color: ${COLORS.orange}; text-align: right;">Descuento:</td>
                  <td style="padding: 12px; color: ${COLORS.orange}; text-align: right;">-$${descuento.toFixed(2)}</td>
                </tr>`
    : ''
}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right;">TOTAL:</td>
                  <td style="text-align: right;">$${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <p style="color: ${COLORS.textLight}; font-size: 14px; text-align: center;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">Check-Oil © 2024. Todos los derechos reservados.</p>
          <p style="margin: 5px 0 0 0;">Distribuidora de Lubricantes Automotrices</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate payment confirmation email template
 * @param {Object} cliente - { nombre, email }
 * @param {Object} pedido - { numero_pedido, fecha, total }
 * @returns {string} HTML email template
 */
function paymentConfirmedTemplate(cliente, pedido) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${COLORS.background}; }
        .header { padding: 40px 20px; text-align: center; background-color: ${COLORS.cardBg}; }
        .logo { font-size: 28px; font-weight: bold; color: ${COLORS.orange}; }
        .content { padding: 30px 20px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; color: ${COLORS.orange}; margin-bottom: 15px; }
        .success-badge { background-color: #00BFA5; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold; margin: 15px 0; }
        .info { background-color: ${COLORS.cardBg}; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info-label { font-size: 12px; color: ${COLORS.textLight}; text-transform: uppercase; }
        .info-value { font-size: 16px; color: ${COLORS.text}; margin-top: 5px; }
        .footer { background-color: ${COLORS.cardBg}; padding: 20px; text-align: center; color: ${COLORS.textLight}; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CHECK-OIL</div>
          <p style="color: ${COLORS.textLight}; margin: 10px 0 0 0;">Lubricantes de Calidad</p>
        </div>

        <div class="content">
          <div class="section">
            <p style="color: ${COLORS.text}; font-size: 16px;">Hola <strong>${cliente.nombre}</strong>,</p>
            <p style="color: ${COLORS.text}; line-height: 1.6;">
              Tu pago fue procesado exitosamente.
            </p>
          </div>

          <div class="section" style="text-align: center;">
            <div class="success-badge">✓ Pago Confirmado</div>
          </div>

          <div class="section">
            <div class="section-title">Resumen del Pago</div>
            <div class="info">
              <div class="info-label">Pedido #</div>
              <div class="info-value">${pedido.numero_pedido}</div>
            </div>
            <div class="info">
              <div class="info-label">Monto</div>
              <div class="info-value" style="color: ${COLORS.orange}; font-size: 20px;">$${pedido.total.toFixed(2)}</div>
            </div>
            <div class="info">
              <div class="info-label">Fecha</div>
              <div class="info-value">${new Date(pedido.fecha).toLocaleDateString('es-AR')}</div>
            </div>
          </div>

          <div class="section">
            <p style="color: ${COLORS.textLight}; font-size: 14px; text-align: center;">
              A continuación, te contactaremos para coordinar la entrega de tu compra.
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">Check-Oil © 2024. Todos los derechos reservados.</p>
          <p style="margin: 5px 0 0 0;">Distribuidora de Lubricantes Automotrices</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate order status update email template
 * @param {Object} cliente - { nombre, email }
 * @param {Object} pedido - { numero_pedido, fecha }
 * @param {string} estado - Order state
 * @returns {string} HTML email template
 */
function statusUpdateTemplate(cliente, pedido, estado) {
  const statusMessages = {
    preparando: {
      title: 'Tu pedido está siendo preparado',
      message: 'Estamos alistando los productos de tu pedido. Te notificaremos cuando esté listo para envío.',
      icon: '📦',
    },
    envio_coordinado: {
      title: 'Coordina tu envío',
      message: 'Tu pedido está listo. Por favor, contacta con nosotros para coordinar el envío.',
      icon: '🚚',
    },
    entregado: {
      title: '¡Tu pedido fue entregado!',
      message: 'Esperamos que disfrutes de nuestros productos. ¡Gracias por tu compra!',
      icon: '✓',
    },
    cancelado: {
      title: 'Pedido Cancelado',
      message: 'Tu pedido ha sido cancelado. Si tienes dudas, contacta con nosotros.',
      icon: '✗',
    },
  };

  const statusInfo = statusMessages[estado] || {
    title: 'Actualización de tu Pedido',
    message: `Tu pedido está en estado: ${estado}`,
    icon: 'ℹ',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${COLORS.background}; }
        .header { padding: 40px 20px; text-align: center; background-color: ${COLORS.cardBg}; }
        .logo { font-size: 28px; font-weight: bold; color: ${COLORS.orange}; }
        .content { padding: 30px 20px; }
        .status-section { background-color: ${COLORS.cardBg}; padding: 30px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .status-icon { font-size: 48px; margin-bottom: 15px; }
        .status-title { font-size: 24px; font-weight: bold; color: ${COLORS.orange}; margin-bottom: 10px; }
        .status-message { color: ${COLORS.text}; font-size: 16px; line-height: 1.6; }
        .info { background-color: ${COLORS.cardBg}; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info-label { font-size: 12px; color: ${COLORS.textLight}; text-transform: uppercase; }
        .info-value { font-size: 16px; color: ${COLORS.text}; margin-top: 5px; }
        .footer { background-color: ${COLORS.cardBg}; padding: 20px; text-align: center; color: ${COLORS.textLight}; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CHECK-OIL</div>
          <p style="color: ${COLORS.textLight}; margin: 10px 0 0 0;">Lubricantes de Calidad</p>
        </div>

        <div class="content">
          <p style="color: ${COLORS.text}; font-size: 16px;">Hola <strong>${cliente.nombre}</strong>,</p>

          <div class="status-section">
            <div class="status-icon">${statusInfo.icon}</div>
            <div class="status-title">${statusInfo.title}</div>
            <div class="status-message">${statusInfo.message}</div>
          </div>

          <div class="section">
            <div style="font-size: 16px; font-weight: bold; color: ${COLORS.orange}; margin-bottom: 15px;">Detalles del Pedido</div>
            <div class="info">
              <div class="info-label">Pedido #</div>
              <div class="info-value">${pedido.numero_pedido}</div>
            </div>
            <div class="info">
              <div class="info-label">Fecha</div>
              <div class="info-value">${new Date(pedido.fecha).toLocaleDateString('es-AR')}</div>
            </div>
          </div>

          <div class="section">
            <p style="color: ${COLORS.textLight}; font-size: 14px; text-align: center;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">Check-Oil © 2024. Todos los derechos reservados.</p>
          <p style="margin: 5px 0 0 0;">Distribuidora de Lubricantes Automotrices</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate shipping coordination email template
 * @param {Object} cliente - { nombre, email }
 * @param {Object} pedido - { numero_pedido }
 * @param {string} instrucciones - Shipping instructions
 * @returns {string} HTML email template
 */
function shippingCoordinationTemplate(cliente, pedido, instrucciones) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${COLORS.background}; }
        .header { padding: 40px 20px; text-align: center; background-color: ${COLORS.cardBg}; }
        .logo { font-size: 28px; font-weight: bold; color: ${COLORS.orange}; }
        .content { padding: 30px 20px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; color: ${COLORS.orange}; margin-bottom: 15px; }
        .instructions { background-color: ${COLORS.cardBg}; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${COLORS.orange}; }
        .instructions-text { color: ${COLORS.text}; line-height: 1.8; white-space: pre-wrap; }
        .cta { background-color: ${COLORS.orange}; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; font-weight: bold; }
        .footer { background-color: ${COLORS.cardBg}; padding: 20px; text-align: center; color: ${COLORS.textLight}; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CHECK-OIL</div>
          <p style="color: ${COLORS.textLight}; margin: 10px 0 0 0;">Lubricantes de Calidad</p>
        </div>

        <div class="content">
          <div class="section">
            <p style="color: ${COLORS.text}; font-size: 16px;">Hola <strong>${cliente.nombre}</strong>,</p>
            <p style="color: ${COLORS.text}; line-height: 1.6;">
              Tu pedido #${pedido.numero_pedido} está listo para ser enviado.
              Por favor, revisa las instrucciones a continuación.
            </p>
          </div>

          <div class="section">
            <div class="section-title">Instrucciones de Envío</div>
            <div class="instructions">
              <div class="instructions-text">${instrucciones}</div>
            </div>
          </div>

          <div class="section">
            <p style="color: ${COLORS.textLight}; font-size: 14px; text-align: center;">
              Por favor, responde a este email o contacta con nosotros para confirmar los detalles del envío.
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">Check-Oil © 2024. Todos los derechos reservados.</p>
          <p style="margin: 5px 0 0 0;">Distribuidora de Lubricantes Automotrices</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export {
  orderConfirmationTemplate,
  paymentConfirmedTemplate,
  statusUpdateTemplate,
  shippingCoordinationTemplate,
};
