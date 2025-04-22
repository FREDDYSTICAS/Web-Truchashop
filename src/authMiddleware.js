// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const Usuario = require('../src/models/Usuario');

class AuthMiddleware {
    // Verificar si el usuario está autenticado
    async verificarAutenticacion(req, res, next) {
        try {
            // Verificar si existe la cookie de sesión
            const token = req.cookies.jwt;
            
            if (!token) {
                return res.redirect('/login?redirect=' + req.originalUrl);
            }
            
            // Verificar y decodificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verificar si el usuario existe
            const usuario = await Usuario.findById(decoded.id).select('-password');
            
            if (!usuario) {
                return res.redirect('/login?redirect=' + req.originalUrl);
            }
            
            // Si todo está bien, guardar el usuario en la solicitud y continuar
            req.usuario = usuario;
            res.locals.usuario = usuario;
            next();
        } catch (error) {
            console.error('Error de autenticación:', error);
            res.redirect('/login?redirect=' + req.originalUrl);
        }
    }
    
    // Verificar si el usuario es administrador
    verificarAdministrador(req, res, next) {
        if (req.usuario && req.usuario.rol === 'admin') {
            next();
        } else {
            res.status(403).render('error', {
                mensaje: 'Acceso denegado. No tienes permisos de administrador.',
                error: {}
            });
        }
    }
}

module.exports = new AuthMiddleware();