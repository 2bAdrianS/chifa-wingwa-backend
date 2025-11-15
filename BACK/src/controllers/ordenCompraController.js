// src/controllers/ordenCompraController.js
const sequelize = require('../config/database');
const { OrdenCompra, Orden_Compra_Detalle, Insumo, Movimiento, Usuario } = require('../models');

/**
 * @desc    (NUEVO) Obtener órdenes validadas (listas para recibir)
 * @route   GET /api/ordenes-compra/validadas
 */
exports.getOrdenesValidadas = async (req, res) => {
    try {
        const ordenes = await OrdenCompra.findAll({
            where: { estado: 'Validada' }, // <-- Solo las validadas
            order: [['updatedAt', 'ASC']], // Mostrar más antiguas primero
            include: [
                {
                    model: Usuario,
                    as: 'encargadoCompras', // Quién la validó
                    attributes: ['nombre']
                },
                {
                    model: Insumo,
                    as: 'insumos',
                    attributes: ['nombre', 'unidad_medida'],
                    through: {
                        model: Orden_Compra_Detalle,
                        attributes: ['cantidad_a_comprar']
                    }
                }
            ]
        });
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener órdenes validadas", error: error.message });
    }
};

/**
 * @desc    Obtener órdenes pendientes de validación
 * @route   GET /api/ordenes-compra/pendientes
 */
exports.getOrdenesPendientes = async (req, res) => {
    // ... (Tu código existente de getOrdenesPendientes... no lo borres)
    try {
        const ordenes = await OrdenCompra.findAll({
            where: { estado: 'Pendiente' },
            order: [['createdAt', 'ASC']],
            include: [
                { model: Usuario, as: 'encargadoAlmacen', attributes: ['nombre'] },
                {
                    model: Insumo, as: 'insumos', attributes: ['nombre', 'unidad_medida'],
                    through: { model: Orden_Compra_Detalle, attributes: ['cantidad_a_comprar'] }
                }
            ]
        });
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener órdenes pendientes", error: error.message });
    }
};

/**
 * @desc    Crear una nueva Orden de Compra
 * @route   POST /api/ordenes-compra
 */
exports.crearOrdenCompra = async (req, res) => {
    // ... (Tu código existente de crearOrdenCompra... no lo borres)
    const { comentarios, insumos } = req.body;
    const id_encargado_almacen = req.user.id;
    const t = await sequelize.transaction();
    try {
        const nuevaOrden = await OrdenCompra.create({
            id_encargado_almacen: id_encargado_almacen,
            estado: 'Pendiente',
        }, { transaction: t });
        const detalles = insumos.map(item => ({
            id_orden_compra: nuevaOrden.id,
            id_insumo: item.id_insumo,
            cantidad_a_comprar: item.cantidad
        }));
        await Orden_Compra_Detalle.bulkCreate(detalles, { transaction: t });
        await t.commit();
        res.status(201).json({ message: "Orden de Compra generada exitosamente. Pendiente de validación.", orden: nuevaOrden });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al generar la Orden de Compra", error: error.message });
    }
};

/**
 * @desc    Validar una Orden de Compra
 * @route   PUT /api/ordenes-compra/:id/validar
 */
exports.validarOrdenCompra = async (req, res) => {
    // ... (Tu código existente de validarOrdenCompra... no lo borres)
    const { id } = req.params;
    const id_encargado_compras = req.user.id;
    try {
        const orden = await OrdenCompra.findByPk(id);
        if (!orden) return res.status(404).json({ message: "Orden de Compra no encontrada." });
        if (orden.estado !== 'Pendiente') return res.status(400).json({ message: `No se puede validar una orden que ya está en estado '${orden.estado}'.` });
        
        orden.estado = 'Validada';
        orden.id_encargado_compras = id_encargado_compras;
        await orden.save();
        res.json({ message: "Orden de Compra validada exitosamente.", orden });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al validar la Orden de Compra", error: error.message });
    }
};

/**
 * @desc    Registrar la entrada de insumos de una Orden de Compra
 * @route   POST /api/ordenes-compra/:id/registrar-entrada
 */
exports.registrarEntrada = async (req, res) => {
    // ... (Tu código existente de registrarEntrada... no lo borres)
    const { id } = req.params;
    const id_usuario_registro = req.user.id;
    const t = await sequelize.transaction();
    try {
        const orden = await OrdenCompra.findByPk(id, {
            include: [{
                model: Insumo,
                as: 'insumos',
                through: { model: Orden_Compra_Detalle }
            }],
            transaction: t
        });
        if (!orden) {
            await t.rollback();
            return res.status(404).json({ message: "Orden de Compra no encontrada." });
        }
        if (orden.estado !== 'Validada') {
            await t.rollback();
            return res.status(400).json({ message: `Solo se puede registrar la entrada de una orden en estado 'Validada'. Estado actual: '${orden.estado}'.` });
        }
        for (const insumoPedido of orden.insumos) {
            const cantidadComprada = parseFloat(insumoPedido.Orden_Compra_Detalle.cantidad_a_comprar);
            const insumo = await Insumo.findByPk(insumoPedido.id, { transaction: t, lock: t.LOCK.UPDATE });
            insumo.stock_actual = parseFloat(insumo.stock_actual) + cantidadComprada;
            await insumo.save({ transaction: t });
            await Movimiento.create({
                id_insumo: insumo.id,
                tipo: 'entrada',
                cantidad: cantidadComprada,
                id_usuario_registro: id_usuario_registro,
                motivo: `Entrada por Orden de Compra #${orden.id}`,
                id_referencia: orden.id
            }, { transaction: t });
        }
        orden.estado = 'Completada';
        await orden.save({ transaction: t });
        await t.commit();
        res.json({ message: "Entrada de insumos registrada y stock actualizado. Orden completada.", orden });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al registrar la entrada", error: error.message });
    }
};