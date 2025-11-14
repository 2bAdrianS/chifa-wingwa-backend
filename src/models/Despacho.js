// src/models/Despacho.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Solicitud = require('./Solicitud');
const Insumo = require('./Insumo');

const Despacho = sequelize.define('Despacho', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_solicitud: { type: DataTypes.INTEGER, allowNull: false },
    id_encargado_almacen: { type: DataTypes.INTEGER, allowNull: false },
    fecha_despacho: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    comentarios: { type: DataTypes.TEXT }
});

// Relaciones
Despacho.belongsTo(Solicitud, { foreignKey: 'id_solicitud', as: 'solicitud' });
Despacho.belongsTo(Usuario, { foreignKey: 'id_encargado_almacen', as: 'encargado' });
Despacho.belongsToMany(Insumo, { through: 'DespachoInsumo', as: 'insumos' });

module.exports = Despacho;