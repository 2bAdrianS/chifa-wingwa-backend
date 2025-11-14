// src/routes/solicitud.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Ruta para crear una solicitud
// Se aplica middleware de autenticación y luego se verifica que el rol sea 'chef'
router.post('/',
    authMiddleware,
    roleCheck(['chef']),
    [
        body('insumos').isArray().withMessage('Los insumos deben ser un array.'),
        body('comentarios').optional().isString()
    ],
    solicitudController.createSolicitud
);

// Ruta para aprobar una solicitud
router.put('/:id/aprobar',
    authMiddleware,
    roleCheck(['jefe_almacen']),
    solicitudController.aprobarSolicitud
);

// ... otras rutas para obtener, etc.

module.exports = router;