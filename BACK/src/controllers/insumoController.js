// src/controllers/insumoController.js
const { Insumo, Movimiento } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// GET /api/insumos
exports.getAllInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.findAll({
             order: [['nombre', 'ASC']]
        });
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los insumos', error: error.message });
    }
};

// GET /api/insumos/stock-bajo
exports.getInsumosBajoStock = async (req, res) => {
    try {
        const insumosBajos = await Insumo.findAll({
            where: {
                stock_actual: {
                    [Op.lte]: sequelize.col('stock_minimo')
                }
            },
            order: [['nombre', 'ASC']]
        });
        res.json(insumosBajos);
    } catch (error) {
        console.error('Error al obtener insumos bajos de stock:', error);
        res.status(500).json({ message: 'Error al obtener insumos bajos de stock', error: error.message });
    }
};

// POST /api/insumos
exports.crearInsumo = async (req, res) => {
    if (!['Jefe de Almacen', 'Encargado de Almacen'].includes(req.user.rol)) {
        return res.status(403).json({ message: 'Acceso denegado. No tiene permisos para crear insumos.' });
    }
    const { nombre, descripcion, stock_actual, stock_minimo, unidad_medida, categoria } = req.body;
    
    // Validación simple
    if (!nombre || !stock_actual || !stock_minimo || !unidad_medida || !categoria) {
         return res.status(400).json({ message: 'Todos los campos (nombre, stock_actual, stock_minimo, unidad_medida, categoria) son obligatorios.' });
    }

    try {
        const nuevoInsumo = await Insumo.create({
            nombre,
            descripcion,
            stock_actual: parseFloat(stock_actual),
            stock_minimo: parseFloat(stock_minimo),
            unidad_medida,
            categoria
        });
        res.status(201).json(nuevoInsumo);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Error al crear el insumo', error: 'El nombre del insumo ya existe.' });
        }
        res.status(500).json({ message: 'Error al crear el insumo', error: error.message });
    }
};

// PUT /api/insumos/:id/stock
exports.updateStock = async (req, res) => {
    // ... (Tu código existente de updateStock... no lo borres)
    if (!['Encargado de Almacen', 'Jefe de Almacen'].includes(req.user.rol)) {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }
    const { id } = req.params;
    const { nueva_cantidad, motivo } = req.body;
    const id_usuario_registro = req.user.id;
    if (nueva_cantidad === undefined || isNaN(parseFloat(nueva_cantidad)) || nueva_cantidad < 0) {
        return res.status(400).json({ message: 'La nueva_cantidad debe ser un número válido mayor o igual a 0.' });
    }
    const t = await sequelize.transaction(); 
    try {
        const insumo = await Insumo.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!insumo) {
            await t.rollback();
            return res.status(404).json({ message: 'Insumo no encontrado.' });
        }
        const stockOriginal = parseFloat(insumo.stock_actual);
        const nuevaCantidadNum = parseFloat(nueva_cantidad);
        const diferencia = nuevaCantidadNum - stockOriginal;
        const tipoMovimiento = diferencia > 0 ? 'entrada' : (diferencia < 0 ? 'merma' : null);
        if (tipoMovimiento) {
            insumo.stock_actual = nuevaCantidadNum;
            await insumo.save({ transaction: t });
            await Movimiento.create({
                id_insumo: id,
                tipo: tipoMovimiento,
                cantidad: Math.abs(diferencia),
                id_usuario_registro: id_usuario_registro,
                motivo: motivo || 'Ajuste manual de stock'
            }, { transaction: t });
        }
        await t.commit(); 
        res.json(insumo); 
    } catch (error) {
        await t.rollback();
        console.error(error); 
        res.status(500).json({ message: 'Error al procesar la actualización de stock', error: error.message });
    }
};

// POST /api/insumos/:id/merma
exports.registrarMerma = async (req, res) => {
    // ... (Tu código existente de registrarMerma... no lo borres)
    const { id } = req.params;
    const { cantidad, motivo } = req.body;
    const id_usuario_registro = req.user.id;
    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ message: "La cantidad de la merma debe ser mayor a 0." });
    }
    if (!motivo) {
        return res.status(400).json({ message: "El motivo de la merma es obligatorio." });
    }
    const t = await sequelize.transaction();
    try {
        const insumo = await Insumo.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!insumo) {
            await t.rollback();
            return res.status(404).json({ message: "Insumo no encontrado." });
        }
        const stockActual = parseFloat(insumo.stock_actual);
        const cantidadMerma = parseFloat(cantidad);
        if (stockActual < cantidadMerma) {
            await t.rollback();
            return res.status(400).json({ message: `No se puede registrar merma. Stock actual (${stockActual}) es menor que la merma (${cantidadMerma}).` });
        }
        insumo.stock_actual = stockActual - cantidadMerma;
        await insumo.save({ transaction: t });
        await Movimiento.create({
            id_insumo: id,
            tipo: 'merma',
            cantidad: cantidadMerma,
            id_usuario_registro: id_usuario_registro,
            motivo: motivo,
            id_referencia: null
        }, { transaction: t });
        await t.commit();
        res.json({ message: "Merma registrada y stock actualizado.", insumo });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al registrar la merma", error: error.message });
    }
};

/**
 * @desc    (NUEVO) Eliminar un insumo del catálogo
 * @route   DELETE /api/insumos/:id
 */
exports.deleteInsumo = async (req, res) => {
    const { id } = req.params;

    // Solo el Jefe de Almacén puede eliminar
    if (req.user.rol !== 'Jefe de Almacen') {
         return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }

    try {
        const insumo = await Insumo.findByPk(id);
        if (!insumo) {
            return res.status(404).json({ message: "Insumo no encontrado." });
        }

        // Regla de negocio: No se puede borrar un insumo si tiene stock
        if (parseFloat(insumo.stock_actual) > 0) {
            return res.status(400).json({ message: "Error: No se puede eliminar un insumo que aún tiene stock.", stock: insumo.stock_actual });
        }

        // Regla de negocio: No se puede borrar un insumo si está en movimientos (esto protege la trazabilidad)
        const movimientos = await Movimiento.count({ where: { id_insumo: id } });
        if (movimientos > 0) {
            return res.status(400).json({ message: "Error: No se puede eliminar un insumo con historial de movimientos. Considere desactivarlo." });
        }
        
        await insumo.destroy();
        res.json({ message: "Insumo eliminado exitosamente." });

    } catch (error) {
        // Capturar error si está siendo usado en Solicitudes, etc.
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: "Error: Este insumo está siendo usado en solicitudes u órdenes y no puede ser eliminado." });
        }
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el insumo", error: error.message });
    }
};