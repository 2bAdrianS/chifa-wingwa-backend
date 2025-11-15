// src/models/Solicitud.js
const { DataTypes, Sequelize } = require('sequelize'); // <-- CORREGIDO (Añadido Sequelize)
const sequelize = require('../config/database');

const Solicitud = sequelize.define('Solicitud', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_solicitante: { type: DataTypes.INTEGER, allowNull: false },
    estado: {
        type: DataTypes.ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Despachada'),
        defaultValue: 'Pendiente' // Coincide con tu BD
    },
    comentarios: { type: DataTypes.TEXT },
    // Añadimos las columnas de auditoría que Sequelize espera
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW // <-- Ahora 'Sequelize' está definido
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW // <-- Ahora 'Sequelize' está definido
    }
}, {
    tableName: 'Solicitudes', // Nos aseguramos que coincida con tu tabla SQL
    timestamps: true
});

// ¡NO MÁS RELACIONES AQUÍ! index.js se encarga de ellas

module.exports = Solicitud;