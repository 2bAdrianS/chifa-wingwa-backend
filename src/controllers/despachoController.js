// src/controllers/despachoController.js
const { validationResult } = require('express-validator');
const Despacho = require('../models/Despacho');
const Solicitud = require('../models/Solicitud');
const { actualizarStock } = require('../services/inventoryService');

exports.createDespacho = async (req, res) => {
    // Solo el Encargado de Almacén puede despachar
    if (req.user.rol !== 'encargado_almacen') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id_solicitud, insumos, comentarios } = req.body;

        // Verificar que la solicitud esté aprobada
        const solicitud = await Solicitud.findByPk(id_solicitud);
        if (!solicitud || solicitud.estado !== 'aprobada') {
            return res.status(400).json({ message: 'La solicitud no existe o no está aprobada.' });
        }

        const nuevoDespacho = await Despacho.create({
            id_solicitud,
            id_encargado_almacen: req.user.id,
            comentarios
        });

        // Asociar insumos y actualizar stock
        await nuevoDespacho.setInsumos(insumos);

        for (const item of insumos) {
            await actualizarStock(item.id, item.cantidad, 'salida', req.user.id, `Despacho de solicitud ${id_solicitud}`);
        }

        // Cambiar estado de la solicitud a 'despachada'
        await solicitud.update({ estado: 'despachada' });

        res.status(201).json(nuevoDespacho);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el despacho', error: error.message });
    }
};