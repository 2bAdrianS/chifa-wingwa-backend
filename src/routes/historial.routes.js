const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * @route   GET /api/historial
 * @desc    Visualizar el historial de todos los movimientos
 * @access  Privado (Jefe de Almacen, Dueño)
 */
router.get(
    '/',
    authMiddleware,
    roleCheck(['Jefe de Almacen', 'Dueño']), // Roles de tu documento
    historialController.getHistorial
);

module.exports = router;