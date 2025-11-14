// src/controllers/ordenCompraController.js
const { validationResult } = require('express-validator');
const OrdenCompra = require('../models/OrdenCompra');
const Insumo = require('../models/Insumo');

exports.createOrdenCompra = async (req, res) => {
    // Solo el Encargado de Almacén puede generar órdenes
    if (req.user.rol !== 'encargado_almacen') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { insumos, comentarios } = req.body;
        const codigo = `OC-${Date.now()}`;

        const nuevaOrden = await OrdenCompra.create({
            id_encargado_almacen: req.user.id,
            codigo,
            comentarios
        });

        await nuevaOrden.setInsumos(insumos);

        res.status(201).json(nuevaOrden);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la orden de compra', error: error.message });
    }
};

exports.validateOrdenCompra = async (req, res) => {
    // Solo el Encargado de Compras puede validar
    if (req.user.rol !== 'encargado_compras') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const { id } = req.params;
    try {
        const orden = await OrdenCompra.findByPk(id);
        if (!orden || orden.estado !== 'pendiente') {
            return res.status(400).json({ message: 'Orden no encontrada o ya procesada.' });
        }

        await orden.update({ 
            estado: 'validada', 
            id_encargado_compras: req.user.id 
        });

        res.json({ message: 'Orden de compra validada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al validar la orden', error: error.message });
    }
};