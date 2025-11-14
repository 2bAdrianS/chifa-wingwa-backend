// src/models/Insumo.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Insumo = sequelize.define('Insumo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
    categoria: { type: DataTypes.STRING, allowNull: false },
    stock_actual: { type: DataTypes.FLOAT, defaultValue: 0, allowNull: false },
    stock_minimo: { type: DataTypes.FLOAT, defaultValue: 5, allowNull: false } // Regla de negocio: stock mínimo
});

module.exports = Insumo;