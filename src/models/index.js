// src/models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Importar modelos
const Usuario = require('./Usuario');
const Insumo = require('./Insumo');
const Solicitud = require('./Solicitud');
const Despacho = require('./Despacho');
const OrdenCompra = require('./OrdenCompra');
const Movimiento = require('./Movimiento');

// Definir asociaciones (relaciones)
// Un usuario puede ser solicitante en muchas solicitudes
Usuario.hasMany(Solicitud, { foreignKey: 'id_solicitante', as: 'solicitudesRealizadas' });
Solicitud.belongsTo(Usuario, { foreignKey: 'id_solicitante', as: 'solicitante' });

// Un usuario puede ser encargado de muchos despachos
Usuario.hasMany(Despacho, { foreignKey: 'id_encargado_almacen', as: 'despachosRealizados' });
Despacho.belongsTo(Usuario, { foreignKey: 'id_encargado_almacen', as: 'encargado' });

// Un usuario puede ser responsable de muchos movimientos
Usuario.hasMany(Movimiento, { foreignKey: 'id_usuario_responsable', as: 'movimientos' });
Movimiento.belongsTo(Usuario, { foreignKey: 'id_usuario_responsable', as: 'responsable' });

// Relaciones muchos a muchos
Solicitud.belongsToMany(Insumo, { through: 'SolicitudInsumo', as: 'insumos' });
Insumo.belongsToMany(Solicitud, { through: 'SolicitudInsumo', as: 'solicitudes' });

Despacho.belongsToMany(Insumo, { through: 'DespachoInsumo', as: 'insumos' });
Insumo.belongsToMany(Despacho, { through: 'DespachoInsumo', as: 'despachos' });

OrdenCompra.belongsToMany(Insumo, { through: 'OrdenCompraInsumo', as: 'insumos' });
Insumo.belongsToMany(OrdenCompra, { through: 'OrdenCompraInsumo', as: 'ordenesDeCompra' });

// Un movimiento pertenece a un insumo
Insumo.hasMany(Movimiento, { foreignKey: 'id_insumo', as: 'movimientos' });
Movimiento.belongsTo(Insumo, { foreignKey: 'id_insumo', as: 'insumo' });


// Sincronizar modelos con la base de datos
const db = {
    sequelize,
    Sequelize,
    Usuario,
    Insumo,
    Solicitud,
    Despacho,
    OrdenCompra,
    Movimiento
};

module.exports = db;