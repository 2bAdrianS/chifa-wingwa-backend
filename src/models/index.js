// src/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Importar modelos (limpios)
const Usuario = require('./Usuario');
const Insumo = require('./Insumo');
const Solicitud = require('./Solicitud');
const Despacho = require('./Despacho');
const OrdenCompra = require('./OrdenCompra');
const Movimiento = require('./Movimiento');

// Definir tablas intermedias (Nombres EXACTOS de tu SQL)
const Solicitud_Detalle = sequelize.define('Solicitud_Detalle', {
    cantidad_solicitada: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, { tableName: 'Solicitud_Detalle', timestamps: true });

const Despacho_Detalle = sequelize.define('Despacho_Detalle', {
    cantidad_despachada: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, { tableName: 'Despacho_Detalle', timestamps: false });

const Orden_Compra_Detalle = sequelize.define('Orden_Compra_Detalle', {
    cantidad_a_comprar: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, { tableName: 'Orden_Compra_Detalle', timestamps: false });


// --- 1. ASOCIACIONES DE USUARIO ---

Usuario.hasMany(Solicitud, { foreignKey: 'id_solicitante', as: 'solicitudesRealizadas' });
Solicitud.belongsTo(Usuario, { foreignKey: 'id_solicitante', as: 'solicitante' });

Usuario.hasMany(Despacho, { foreignKey: 'id_encargado_almacen', as: 'despachosRealizados' });
Despacho.belongsTo(Usuario, { foreignKey: 'id_encargado_almacen', as: 'encargado' });

Usuario.hasMany(OrdenCompra, { foreignKey: 'id_encargado_almacen', as: 'ordenesGeneradas' });
OrdenCompra.belongsTo(Usuario, { foreignKey: 'id_encargado_almacen', as: 'encargadoAlmacen' });

Usuario.hasMany(OrdenCompra, { foreignKey: 'id_encargado_compras', as: 'ordenesValidadas' });
OrdenCompra.belongsTo(Usuario, { foreignKey: 'id_encargado_compras', as: 'encargadoCompras' });

Usuario.hasMany(Movimiento, { foreignKey: 'id_usuario_registro', as: 'movimientos' });
Movimiento.belongsTo(Usuario, { foreignKey: 'id_usuario_registro', as: 'responsable' });


// --- 2. ASOCIACIONES MUCHOS-A-MUCHOS (Insumos) ---
// --- AQUI ESTÁN LAS CORRECCIONES ---

// Solicitud <-> Insumo
Solicitud.belongsToMany(Insumo, {
    through: Solicitud_Detalle,
    as: 'insumos',
    foreignKey: 'id_solicitud' // <-- El nombre en tu BD
});
Insumo.belongsToMany(Solicitud, {
    through: Solicitud_Detalle,
    as: 'solicitudes',
    foreignKey: 'id_insumo' // <-- El nombre en tu BD
});

// Despacho <-> Insumo
Despacho.belongsToMany(Insumo, {
    through: Despacho_Detalle,
    as: 'insumos',
    foreignKey: 'id_despacho' // <-- El nombre en tu BD
});
Insumo.belongsToMany(Despacho, {
    through: Despacho_Detalle,
    as: 'despachos',
    foreignKey: 'id_insumo' // <-- El nombre en tu BD
});

// OrdenCompra <-> Insumo
OrdenCompra.belongsToMany(Insumo, {
    through: Orden_Compra_Detalle,
    as: 'insumos',
    foreignKey: 'id_orden_compra' // <-- El nombre en tu BD
});
Insumo.belongsToMany(OrdenCompra, {
    through: Orden_Compra_Detalle,
    as: 'ordenesDeCompra',
    foreignKey: 'id_insumo' // <-- El nombre en tu BD
});


// --- 3. OTRAS ASOCIACIONES ---

Insumo.hasMany(Movimiento, { foreignKey: 'id_insumo', as: 'movimientos' });
Movimiento.belongsTo(Insumo, { foreignKey: 'id_insumo', as: 'insumo' });

Solicitud.hasOne(Despacho, { foreignKey: 'id_solicitud', as: 'despacho' });
Despacho.belongsTo(Solicitud, { foreignKey: 'id_solicitud', as: 'solicitud' });


// Exportar todo
const db = {
    sequelize,
    Sequelize,
    Usuario,
    Insumo,
    Solicitud,
    Despacho,
    OrdenCompra,
    Movimiento,
    Solicitud_Detalle,
    Despacho_Detalle,
    Orden_Compra_Detalle
};

module.exports = db;