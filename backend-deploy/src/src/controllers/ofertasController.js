import { Op } from 'sequelize';
import { Offer } from '../models/index.js';

/**
 * Get currently active offers
 * GET /api/ofertas
 */
export const getOfertasActivas = async (req, res, next) => {
  try {
    const ahora = new Date();

    // Get all active offers within date range
    const ofertas = await Offer.findAll({
      where: {
        activa: true,
        fecha_inicio: { [Op.lte]: ahora },
        fecha_fin: { [Op.gte]: ahora },
      },
      attributes: [
        'id',
        'nombre',
        'descripcion',
        'banner_imagen',
        'condiciones',
        'aplicable_a',
        'fecha_fin',
      ],
      order: [['fecha_fin', 'ASC']], // Soonest to expire first
    });

    // Format response
    const ofertasFormato = ofertas.map((oferta) => ({
      id: oferta.id,
      nombre: oferta.nombre,
      descripcion: oferta.descripcion,
      banner_imagen: oferta.banner_imagen,
      condiciones: oferta.condiciones,
      aplicable_a: oferta.aplicable_a,
      fecha_fin: oferta.fecha_fin,
    }));

    res.status(200).json({
      data: {
        ofertas: ofertasFormato,
        total: ofertasFormato.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
