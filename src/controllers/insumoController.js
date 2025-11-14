// src/controllers/insumoController.js
const { validationResult } = require('express-validator');
const Insumo = require('../models/Insumo');
const { actualizarStock } = require('../services/inventoryService');

exports.getAllInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.findAll();
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los insumos', error: error.message });
    }
};

exports.updateStock = async (req, res) => {
    // Solo Encargado o Jefe de Almacén pueden actualizar stock
    if (!['encargado_almacen', 'jefe_almacen'].includes(req.user.rol)) {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const { id } = req.params;
    const { nueva_cantidad, motivo } = req.body;

    try {
        const insumo = await Insumo.findByPk(id);
        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado.' });
        }

        const diferencia = nueva_cantidad - insumo.stock_actual;
        const tipoMovimiento = diferencia > 0 ? 'entrada' : (diferencia < 0 ? 'merma' : null);

        if (tipoMovimiento) {
            await actualizarStock(id, Math.abs(diferencia), tipoMovimiento, req.user.id, motivo || 'Ajuste manual de stock');
        }
        
        const insumoActualizado = await Insumo.findByPk(id);
        res.json(insumoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el stock', error: error.message });
    }
};