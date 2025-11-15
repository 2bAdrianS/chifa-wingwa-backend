// src/models/Movimiento.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Movimiento = sequelize.define('Movimiento', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_insumo: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { // De tu script SQL
        type: DataTypes.ENUM('entrada', 'salida', 'merma'),
        allowNull: false
    },
    cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    id_usuario_registro: { type: DataTypes.INTEGER, allowNull: false }, // De tu script SQL
    motivo: { type: DataTypes.STRING(255) }, // De tu script SQL
    id_referencia: { type: DataTypes.INTEGER }, // De tu script SQL
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'Movimientos',
    timestamps: true
});

// NO MÁS RELACIONES AQUÍ

module.exports = Movimiento;
