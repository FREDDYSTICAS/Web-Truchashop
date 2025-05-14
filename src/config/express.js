const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');

module.exports = function(app) {
    // Middleware para logging de solicitudes
    app.use(morgan('dev'));

    // Archivos estáticos
    app.use(express.static(path.join(__dirname, '..','..','public')));

    // Middlewares para parseo de datos
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configuración de sesión
    app.use(session({
        secret: process.env.SESSION_SECRET || 'tusecretosegurodev',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 día
        }
    }));

    // Middleware para mensajes flash (feedback al usuario)
    app.use(flash());

    // Middleware para pasar variables a todas las vistas
    app.use((req, res, next) => {
        // Variables de autenticación
        res.locals.currentUser = req.session.usuario;
        res.locals.isAuthenticated = req.session.isLoggedIn;
        
        // Mensajes flash
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.errors = req.flash('errors');
        
        next();
    });

   // Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

    // Opcional: Configuración adicional de seguridad
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1); // Para cookies seguras detrás de proxy
    }
};