// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que el usuario exista
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Validar la contraseña
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar el token
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// NOTA: El registro de usuarios debería ser una función administrativa,
// no abierta al público. Por simplicidad, se incluye aquí.
exports.register = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password: hashedPassword,
            rol
        });

        res.status(201).json({ message: 'Usuario creado exitosamente', usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, rol: nuevoUsuario.rol } });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

