// src/controllers/reporteController.js
const { Insumo } = require('../models');
const { Op } = require('sequelize'); // Para filtros

/**
 * @desc    Generar un informe de stock
 * @route   GET /api/reportes/stock
 */
exports.generarReporteStock = async (req, res) => {
    try {
        // 1. Obtener todos los insumos
        const insumos = await Insumo.findAll({
            order: [['nombre', 'ASC']]
        });

        // 2. Calcular datos agregados
        const totalInsumos = insumos.length;
        const insumosBajoMinimo = insumos.filter(
            insumo => parseFloat(insumo.stock_actual) < parseFloat(insumo.stock_minimo)
        ).length;

        // 3. Formatear la respuesta
        const reporte = {
            fechaGeneracion: new Date(),
            totalTiposInsumo: totalInsumos,
            insumosBajoStockMinimo: insumosBajoMinimo,
            detalleInsumos: insumos // Lista completa
        };

        res.json(reporte);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al generar el reporte", error: error.message });
    }
};