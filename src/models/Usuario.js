// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    rol: {
        type: DataTypes.ENUM('chef', 'encargado_almacen', 'jefe_almacen', 'encargado_compras', 'dueno'),
        allowNull: false
    }
});

module.exports = Usuario;