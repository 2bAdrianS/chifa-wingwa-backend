// src/models/OrdenCompra.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const OrdenCompra = sequelize.define('OrdenCompra', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }, // De tu script SQL
    id_encargado_almacen: { type: DataTypes.INTEGER, allowNull: false },
    id_encargado_compras: { type: DataTypes.INTEGER },
    estado: {
        type: DataTypes.ENUM('Pendiente', 'Validada', 'Rechazada', 'Completada'),
        defaultValue: 'Pendiente'
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
    tableName: 'Ordenes_Compra',
    timestamps: true
});

// NO MÁS RELACIONES AQUÍ

module.exports = OrdenCompra;


