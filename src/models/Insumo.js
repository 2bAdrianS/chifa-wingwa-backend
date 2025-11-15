// src/models/Insumo.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Insumo = sequelize.define('Insumo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    descripcion: { type: DataTypes.TEXT }, // De tu script SQL
    stock_actual: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    stock_minimo: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 5.00 },
    unidad_medida: { type: DataTypes.STRING(20), allowNull: false }, // De tu script SQL
    categoria: { type: DataTypes.STRING(100) }, // De tu comando ALTER
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
    tableName: 'Insumos',
    timestamps: true
});

// NO MÁS RELACIONES AQUÍ

module.exports = Insumo;