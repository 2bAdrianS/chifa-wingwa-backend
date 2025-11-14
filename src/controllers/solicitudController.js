// src/controllers/solicitudController.js
const { validationResult } = require('express-validator');
const Solicitud = require('../models/Solicitud');
const Insumo = require('../models/Insumo');
const { registrarMovimiento } = require('../services/inventoryService');

// ... otras funciones

exports.createSolicitud = async (req, res) => {
    // Regla de negocio: Solo el Chef puede generar solicitudes
    if (req.user.rol !== 'chef') {
        return res.status(403).json({ message: 'Solo el Chef de cocina puede generar solicitudes.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { insumos, comentarios } = req.body;
        const nuevaSolicitud = await Solicitud.create({
            id_solicitante: req.user.id,
            comentarios
        });

        // Asociar insumos a la solicitud
        await nuevaSolicitud.setInsumos(insumos);

        // Registrar movimiento para trazabilidad
        await registrarMovimiento('Solicitud', `Solicitud ${nuevaSolicitud.id} creada`, req.user.id);

        res.status(201).json(nuevaSolicitud);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la solicitud', error: error.message });
    }
};

exports.aprobarSolicitud = async (req, res) => {
    // Regla de negocio: Solo el Jefe de Almacén puede aprobar
    if (req.user.rol !== 'jefe_almacen') {
        return res.status(403).json({ message: 'Solo el Jefe de Almacén puede aprobar solicitudes.' });
    }
    // ... lógica para cambiar estado a 'aprobada'
};