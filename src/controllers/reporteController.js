// src/controllers/reporteController.js
const Insumo = require('../models/Insumo');
const Movimiento = require('../models/Movimiento');

exports.getStockReport = async (req, res) => {
    // Jefe de Almacén y Dueño pueden ver el informe
    if (!['jefe_almacen', 'dueno'].includes(req.user.rol)) {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    try {
        const insumos = await Insumo.findAll({
            order: [['stock_actual', 'ASC']]
        });
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el informe de stock', error: error.message });
    }
};

exports.getHistorial = async (req, res) => {
    // Dueño y Jefe de Almacén pueden ver el historial
    if (!['jefe_almacen', 'dueno'].includes(req.user.rol)) {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    try {
        const historial = await Movimiento.findAll({
            include: [
                { model: Insumo, as: 'insumo', attributes: ['nombre'] },
                { model: Usuario, as: 'responsable', attributes: ['nombre'] }
            ],
            order: [['fecha_movimiento', 'DESC']]
        });
        res.json(historial);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial', error: error.message });
    }
};   