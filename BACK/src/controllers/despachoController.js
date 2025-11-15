// src/controllers/despachoController.js
const sequelize = require('../config/database');
const { Despacho, Solicitud, Insumo, Movimiento, Solicitud_Detalle, Despacho_Detalle, Usuario } = require('../models');

/**
 * @desc    Crear un nuevo despacho
 * @route   POST /api/despachos
 */
exports.crearDespacho = async (req, res) => {
    // ... (Tu código existente de crearDespacho... no lo borres)
    const { id_solicitud, comentarios } = req.body;
    const id_encargado_almacen = req.user.id;
    const t = await sequelize.transaction();
    try {
        const solicitud = await Solicitud.findByPk(id_solicitud, {
            include: [{ model: Insumo, as: 'insumos', through: { model: Solicitud_Detalle } }],
            transaction: t
        });
        if (!solicitud) {
            await t.rollback();
            return res.status(404).json({ message: "Solicitud no encontrada." });
        }
        if (solicitud.estado !== 'Aprobada') {
            await t.rollback();
            return res.status(400).json({ message: `No se puede despachar una solicitud en estado '${solicitud.estado}'.` });
        }
        for (const insumoPedido of solicitud.insumos) {
            const insumoEnStock = await Insumo.findByPk(insumoPedido.id, { transaction: t });
            const cantidadPedida = parseFloat(insumoPedido.Solicitud_Detalle.cantidad_solicitada);
            const stockActual = parseFloat(insumoEnStock.stock_actual);
            if (stockActual < cantidadPedida) {
                await t.rollback();
                return res.status(400).json({
                    message: "Error de stock",
                    error: `No hay stock suficiente para '${insumoEnStock.nombre}'. Stock actual: ${stockActual}, Solicitado: ${cantidadPedida}`
                });
            }
        }
        const nuevoDespacho = await Despacho.create({
            id_solicitud: id_solicitud,
            id_encargado_almacen: id_encargado_almacen,
            estado: 'Realizado',
        }, { transaction: t });
        for (const insumoPedido of solicitud.insumos) {
            const cantidadPedida = parseFloat(insumoPedido.Solicitud_Detalle.cantidad_solicitada);
            await Despacho_Detalle.create({
                id_despacho: nuevoDespacho.id,
                id_insumo: insumoPedido.id,
                cantidad_despachada: cantidadPedida
            }, { transaction: t });
            const insumo = await Insumo.findByPk(insumoPedido.id, { transaction: t });
            insumo.stock_actual = parseFloat(insumo.stock_actual) - cantidadPedida;
            await insumo.save({ transaction: t });
            await Movimiento.create({
                id_insumo: insumo.id,
                tipo: 'salida',
                cantidad: cantidadPedida,
                id_usuario_registro: id_encargado_almacen,
                motivo: `Despacho para solicitud #${id_solicitud}`,
                id_referencia: nuevoDespacho.id
            }, { transaction: t });
        }
        solicitud.estado = 'Despachada';
        await solicitud.save({ transaction: t });
        await t.commit();
        res.status(201).json({ message: "Despacho registrado y stock actualizado exitosamente", despacho: nuevoDespacho });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al crear el despacho", error: error.message });
    }
};

/**
 * @desc    Chef verifica el despacho recibido
 * @route   PUT /api/despachos/:id/verificar
 */
exports.verificarDespacho = async (req, res) => {
    // ... (Tu código existente de verificarDespacho... no lo borres)
    const { id } = req.params;
    const id_chef = req.user.id;
    try {
        const despacho = await Despacho.findByPk(id, {
            include: { model: Solicitud, as: 'solicitud' }
        });
        if (!despacho) {
            return res.status(404).json({ message: "Despacho no encontrado." });
        }
        if (despacho.solicitud.id_solicitante !== id_chef) {
            return res.status(403).json({ message: "Acceso denegado. No puede verificar un despacho que no solicitó." });
        }
        if (despacho.estado !== 'Realizado') {
            return res.status(400).json({ message: `No se puede verificar un despacho en estado '${despacho.estado}'.` });
        }
        despacho.estado = 'Verificado';
        await despacho.save();
        res.json({ message: "Despacho verificado exitosamente por el Chef.", despacho });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al verificar el despacho", error: error.message });
    }
};

/**
 * @desc    (NUEVO) Obtener despachos pendientes de verificación
 * @route   GET /api/despachos/pendientes-verificacion
 */
exports.getDespachosPendientes = async (req, res) => {
    const id_chef = req.user.id; // Del token

    try {
        const despachos = await Despacho.findAll({
            where: { estado: 'Realizado' }, // Solo los que almacén ya envió
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Solicitud,
                    as: 'solicitud',
                    where: { id_solicitante: id_chef }, // ¡Solo los que este Chef pidió!
                    attributes: ['comentarios']
                },
                {
                    model: Usuario,
                    as: 'encargado', // Quién lo despachó
                    attributes: ['nombre']
                },
                {
                    model: Insumo,
                    as: 'insumos', // Qué insumos vienen
                    attributes: ['nombre'],
                    through: {
                        model: Despacho_Detalle,
                        attributes: ['cantidad_despachada']
                    }
                }
            ]
        });
        res.json(despachos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener despachos pendientes", error: error.message });
    }
};