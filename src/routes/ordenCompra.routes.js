// src/routes/ordenCompra.routes.js
const express = require('express');
const router = express.Router();
const ordenCompraController = require('../controllers/ordenCompraController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// (NUEVA) Obtener órdenes validadas (listas para recibir)
router.get(
    '/validadas',
    authMiddleware,
    roleCheck(['Encargado de Almacen', 'Jefe de Almacen']),
    ordenCompraController.getOrdenesValidadas
);

// Obtener órdenes pendientes (para Compras)
router.get(
    '/pendientes',
    authMiddleware,
    roleCheck(['Encargado de Compras', 'Jefe de Almacen']),
    ordenCompraController.getOrdenesPendientes
);

// Generar una nueva Orden de Compra (Almacén)
router.post(
    '/',
    authMiddleware,
    roleCheck(['Encargado de Almacen', 'Jefe de Almacen']),
    ordenCompraController.crearOrdenCompra
);

// Validar una Orden de Compra (Compras)
router.put(
    '/:id/validar',
    authMiddleware,
    roleCheck(['Encargado de Compras']),
    ordenCompraController.validarOrdenCompra
);

// Registrar la entrada de una orden (Almacén)
router.post(
    '/:id/registrar-entrada',
    authMiddleware,
    roleCheck(['Encargado de Almacen', 'Jefe de Almacen']),
    ordenCompraController.registrarEntrada
);

module.exports = router;