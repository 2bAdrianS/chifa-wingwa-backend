// src/models/OrdenCompra.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Insumo = require('./Insumo');

const OrdenCompra = sequelize.define('OrdenCompra', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_encargado_almacen: { type: DataTypes.INTEGER, allowNull: false },
    id_encargado_compras: { type: DataTypes.INTEGER, allowNull: true }, // Se asigna al validar
    codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
    fecha_orden: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    estado: {
        type: DataTypes.ENUM('pendiente', 'validada', 'completada'),
        defaultValue: 'pendiente'
    },
    comentarios: { type: DataTypes.TEXT }
});

// Relaciones
OrdenCompra.belongsTo(Usuario, { as: 'encargadoAlmacen', foreignKey: 'id_encargado_almacen' });
OrdenCompra.belongsTo(Usuario, { as: 'encargadoCompras', foreignKey: 'id_encargado_compras' });
OrdenCompra.belongsToMany(Insumo, { through: 'OrdenCompraInsumo', as: 'insumos' });

module.exports = OrdenCompra;