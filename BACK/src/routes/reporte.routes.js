// src/routes/reporte.routes.js
const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * @route   GET /api/reportes/stock
 * @desc    Generar un informe de stock
 * @access  Privado (Jefe de Almacen, Encargado de Almacen, Dueño)
 */
router.get(
    '/stock',
    authMiddleware,
    roleCheck(['Jefe de Almacen', 'Encargado de Almacen', 'Dueño']), // Roles
    reporteController.generarReporteStock
);

module.exports = router;