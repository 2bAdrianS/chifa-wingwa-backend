// src/models/Movimiento.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Insumo = require('./Insumo');

const Movimiento = sequelize.define('Movimiento', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_insumo: { type: DataTypes.INTEGER, allowNull: false },
    id_usuario_responsable: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.FLOAT, allowNull: false },
    tipo_movimiento: {
        type: DataTypes.ENUM('entrada', 'salida', 'merma'),
        allowNull: false
    },
    fecha_movimiento: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    observacion: { type: DataTypes.STRING }
});

// Relaciones
Movimiento.belongsTo(Insumo, { foreignKey: 'id_insumo', as: 'insumo' });
Movimiento.belongsTo(Usuario, { foreignKey: 'id_usuario_responsable', as: 'responsable' });

module.exports = Movimiento;