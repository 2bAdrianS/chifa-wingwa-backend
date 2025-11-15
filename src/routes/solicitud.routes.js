// src/routes/solicitud.routes.js
const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Obtener solicitudes pendientes de aprobación (para Aprobar)
router.get(
    '/pendientes',
    authMiddleware,
    roleCheck(['Jefe de Almacen']),
    solicitudController.getSolicitudesPendientes
);

/**
 * @route   GET /api/solicitudes/aprobadas
 * @desc    (NUEVO) Obtener solicitudes aprobadas listas para ser despachadas
 * @access  Privado (Jefe de Almacen, Encargado de Almacen)
 */
router.get(
    '/aprobadas',
    authMiddleware,
    roleCheck(['Jefe de Almacen', 'Encargado de Almacen']),
    solicitudController.getSolicitudesAprobadas
);

/**
 * @route   POST /api/solicitudes
 * @desc    Crear una nueva solicitud de insumos
 * @access  Privado (Chef de Cocina)
 */
router.post(
    '/',
    authMiddleware,
    roleCheck(['Chef de Cocina']),
    solicitudController.crearSolicitud
);

/**
 * @route   GET /api/solicitudes
 * @desc    Consultar todas las solicitudes
 * @access  Privado (Chef y Almacén)
 */
router.get(
    '/',
    authMiddleware,
    roleCheck(['Chef de Cocina', 'Jefe de Almacen', 'Encargado de Almacen']),
    solicitudController.consultarSolicitudes
);

/**
 * @route   PUT /api/solicitudes/:id/aprobar
 * @desc    Aprobar una solicitud
 * @access  Privado (Jefe de Almacen)
 */
router.put(
    '/:id/aprobar',
    authMiddleware,
    roleCheck(['Jefe de Almacen']),
    solicitudController.aprobarSolicitud
);

module.exports = router;