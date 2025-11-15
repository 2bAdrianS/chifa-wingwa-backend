// src/models/Despacho.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Despacho = sequelize.define('Despacho', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_solicitud: { type: DataTypes.INTEGER, allowNull: false },
    id_encargado_almacen: { type: DataTypes.INTEGER, allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }, // De tu script SQL
    estado: {
        type: DataTypes.ENUM('Realizado', 'Verificado'),
        defaultValue: 'Realizado'
    },
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
    tableName: 'Despachos',
    timestamps: true
});

// NO MÁS RELACIONES AQUÍ

module.exports = Despacho;