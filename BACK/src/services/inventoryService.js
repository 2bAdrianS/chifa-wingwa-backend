// src/services/inventoryService.js
const Movimiento = require('../models/Movimiento');
const Insumo = require('../models/Insumo');

// Función central para actualizar el stock y registrar en el historial
exports.actualizarStock = async (idInsumo, cantidad, tipoMovimiento, idUsuarioResponsable, observacion = '') => {
    const transaction = await sequelize.transaction();
    try {
        const insumo = await Insumo.findByPk(idInsumo, { transaction });

        if (!insumo) {
            throw new Error('Insumo no encontrado.');
        }

        let nuevoStock;
        if (tipoMovimiento === 'salida' || tipoMovimiento === 'merma') {
            nuevoStock = insumo.stock_actual - cantidad;
        } else if (tipoMovimiento === 'entrada') {
            nuevoStock = insumo.stock_actual + cantidad;
        }

        if (nuevoStock < 0) {
            throw new Error('Stock insuficiente para realizar la operación.');
        }

        // Actualizar stock del insumo
        await insumo.update({ stock_actual: nuevoStock }, { transaction });

        // Registrar en el historial de movimientos
        await Movimiento.create({
            id_insumo: idInsumo,
            cantidad: cantidad,
            tipo_movimiento: tipoMovimiento,
            observacion: observacion,
            id_usuario_responsable: idUsuarioResponsable
        }, { transaction });

        await transaction.commit();

        // Regla de negocio: Verificar si se alcanzó el stock mínimo
        if (nuevoStock <= insumo.stock_minimo) {
            console.log(`ALERTA: El insumo ${insumo.nombre} ha alcanzado su stock mínimo.`);
            // Aquí se podría disparar la lógica para generar una orden de compra
        }

        return insumo;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};