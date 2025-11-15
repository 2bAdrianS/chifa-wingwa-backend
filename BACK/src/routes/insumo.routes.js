// src/routes/insumo.routes.js
const express = require('express');
const router = express.Router();
const insumoController = require('../controllers/insumoController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// --- (NUEVA) RUTA PARA GESTIÓN ---

// (NUEVA) Eliminar un insumo del catálogo
router.delete(
    '/:id',
    authMiddleware,
    roleCheck(['Jefe de Almacen']), // Solo el Jefe puede borrar
    insumoController.deleteInsumo
);

// --- RUTAS QUE YA TENÍAS ---

// Obtener insumos con stock bajo
router.get(
    '/stock-bajo',
    authMiddleware,
    roleCheck(['Jefe de Almacen', 'Encargado de Almacen']),
    insumoController.getInsumosBajoStock
);

// Obtener todos los insumos
router.get(
    '/', 
    authMiddleware, 
    insumoController.getAllInsumos
);

// Crear un nuevo insumo
router.post(
    '/', 
    authMiddleware, 
    roleCheck(['Jefe de Almacen', 'Encargado de Almacen']),
    insumoController.crearInsumo
);

// Actualizar stock (ajuste manual)
router.put(
    '/:id/stock',
    authMiddleware,
    roleCheck(['Encargado de Almacen', 'Jefe de Almacen']),
    insumoController.updateStock
);

// Registrar merma
router.post(
    '/:id/merma',
    authMiddleware,
    roleCheck(['Encargado de Almacen', 'Jefe de Almacen']),
    insumoController.registrarMerma
);

module.exports = router;