// src/routes/despacho.routes.js
const express = require('express');
const router = express.Router();
const despachoController = require('../controllers/despachoController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * @route   GET /api/despachos/pendientes-verificacion
 * @desc    (NUEVO) Obtener despachos pendientes de verificación del Chef
 * @access  Privado (Chef de Cocina)
 */
router.get(
    '/pendientes-verificacion',
    authMiddleware,
    roleCheck(['Chef de Cocina']),
    despachoController.getDespachosPendientes
);

/**
 * @route   POST /api/despachos
 * @desc    Crear un nuevo despacho
 * @access  Privado (Encargado/Jefe de Almacen)
 */
router.post(
    '/',
    authMiddleware,
    roleCheck(['Encargado de Almacen', 'Jefe de Almacen']),
    despachoController.crearDespacho
);

/**
 * @route   PUT /api/despachos/:id/verificar
 * @desc    Chef verifica el despacho recibido
 * @access  Privado (Chef de Cocina)
 */
router.put(
    '/:id/verificar',
    authMiddleware,
    roleCheck(['Chef de Cocina']),
    despachoController.verificarDespacho
);

module.exports = router;