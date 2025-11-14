// src/models/Solicitud.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Insumo = require('./Insumo');

const Solicitud = sequelize.define('Solicitud', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_solicitante: { type: DataTypes.INTEGER, allowNull: false },
    estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'despachada', 'rechazada'),
        defaultValue: 'pendiente'
    },
    comentarios: { type: DataTypes.TEXT }
});

// Relaciones
Solicitud.belongsTo(Usuario, { foreignKey: 'id_solicitante', as: 'solicitante' });
Solicitud.belongsToMany(Insumo, { through: 'SolicitudInsumo', as: 'insumos' });

module.exports = Solicitud;