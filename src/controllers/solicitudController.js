// src/controllers/solicitudController.js
const sequelize = require('../config/database');
const { Solicitud, Solicitud_Detalle, Insumo, Usuario } = require('../models');

/**
 * @desc    Obtener solicitudes pendientes (para Aprobar)
 * @route   GET /api/solicitudes/pendientes
 */
exports.getSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            where: { estado: 'Pendiente' },
            order: [['createdAt', 'ASC']],
            include: [
                { model: Usuario, as: 'solicitante', attributes: ['nombre'] },
                { model: Insumo, as: 'insumos', attributes: ['nombre', 'unidad_medida'], through: { model: Solicitud_Detalle, attributes: ['cantidad_solicitada'] } }
            ]
        });
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al consultar solicitudes pendientes", error: error.message });
    }
};

/**
 * @desc    (NUEVO) Obtener solicitudes aprobadas (para Despachar)
 * @route   GET /api/solicitudes/aprobadas
 */
exports.getSolicitudesAprobadas = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            where: { estado: 'Aprobada' }, // <-- Filtramos por Aprobadas
            order: [['updatedAt', 'ASC']],
            include: [
                { model: Usuario, as: 'solicitante', attributes: ['nombre'] },
                { model: Insumo, as: 'insumos', attributes: ['nombre', 'unidad_medida'], through: { model: Solicitud_Detalle, attributes: ['cantidad_solicitada'] } }
            ]
        });
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al consultar solicitudes aprobadas", error: error.message });
    }
};


/**
 * @desc    Crear una nueva solicitud
 * @route   POST /api/solicitudes
 */
exports.crearSolicitud = async (req, res) => {
    const { comentarios, insumos } = req.body;
    const id_solicitante = req.user.id;
    if (!insumos || insumos.length === 0) {
        return res.status(400).json({ message: "La solicitud debe tener al menos un insumo." });
    }
    const t = await sequelize.transaction();
    try {
        const nuevaSolicitud = await Solicitud.create({
            id_solicitante: id_solicitante,
            estado: 'Pendiente',
            comentarios: comentarios
        }, { transaction: t });
        const detalles = insumos.map(item => {
            return {
                id_solicitud: nuevaSolicitud.id,
                id_insumo: item.id_insumo,
                cantidad_solicitada: item.cantidad
            };
        });
        await Solicitud_Detalle.bulkCreate(detalles, { transaction: t });
        await t.commit();
        res.status(201).json({ message: "Solicitud creada exitosamente", solicitud: nuevaSolicitud });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al crear la solicitud", error: error.message });
    }
};

/**
 * @desc    Consultar todas las solicitudes
 * @route   GET /api/solicitudes
 */
exports.consultarSolicitudes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            include: [
                { model: Usuario, as: 'solicitante', attributes: ['nombre', 'rol'] },
                { model: Insumo, as: 'insumos', attributes: ['nombre', 'unidad_medida'], through: { model: Solicitud_Detalle, attributes: ['cantidad_solicitada'] } }
            ]
        });
        res.json(solicitudes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al consultar solicitudes", error: error.message });
    }
};

/**
 * @desc    Aprobar una solicitud
 * @route   PUT /api/solicitudes/:id/aprobar
 */
exports.aprobarSolicitud = async (req, res) => {
    const { id } = req.params;
    try {
        const solicitud = await Solicitud.findByPk(id);
        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada." });
        }
        if (solicitud.estado !== 'Pendiente') {
            return res.status(400).json({ message: `No se puede aprobar una solicitud que ya está en estado '${solicitud.estado}'.` });
        }
        solicitud.estado = 'Aprobada';
        await solicitud.save();
        res.json({ message: "Solicitud aprobada exitosamente", solicitud });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al aprobar la solicitud", error: error.message });
    }
};