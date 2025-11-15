// src/controllers/historialController.js
const { Movimiento, Insumo, Usuario } = require('../models');

/**
 * @desc    Visualizar historial de movimientos
 * @route   GET /api/historial
 */
exports.getHistorial = async (req, res) => {
    try {
        const movimientos = await Movimiento.findAll({
            order: [['createdAt', 'DESC']], // Mostrar los más recientes primero
            include: [
                {
                    model: Insumo,
                    as: 'insumo', // De tu index.js
                    attributes: ['nombre']
                },
                {
                    model: Usuario,
                    as: 'responsable', // De tu index.js
                    attributes: ['nombre', 'rol']
                }
            ]
        });

        res.json(movimientos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el historial", error: error.message });
    }
};