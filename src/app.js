require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const morgan = require('morgan');
const requireAuth = require('../public/js/auth'); // ✅ Ruta corregida

// Configuración inicial
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middlewares básicos
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configuración avanzada de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_super_secreto_seguro_' + Math.random().toString(36).substring(2),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  },
  store: process.env.NODE_ENV === 'production' ? new (require('connect-mongo')).default(session)({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 día
  }) : null
}));

// Flash messages para feedback al usuario
app.use(flash());

// Middleware para variables globales
app.use((req, res, next) => {
  res.locals.currentUser = req.session.usuario;
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.errors = req.flash('errors');
  res.locals.env = process.env.NODE_ENV;
  next();
});

// Conexión a la base de datos
require('./config/database');

// Rutas principales
app.use('/', require('./routes/index.routes'));
app.use('/clientes', require('./routes/clientes.routes'));
app.use('/productos', require('./routes/productos.routes'));
app.use('/pedidos', require('./routes/pedidos.routes'));
app.use('/ventas', require('./routes/ventas.routes'));
app.use('/auth', require('./routes/auth.routes'));

// Rutas protegidas
app.use('/admin', requireAuth, require('./routes/admin.routes'));

// Ruta específica para el dashboard
app.get('/panel', requireAuth, (req, res) => {
  console.log('Entrando al panel...');
  res.render('panel', { usuario: req.session.usuario });
});

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).send('404 - Página no encontrada');
});

// Error 500 - Error interno del servidor
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(err.status || 500).send(`Error ${err.status || 500}: ${err.message || 'Error inesperado'}`);
});

// Inicio del servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log(`➡️ Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Cierre elegante
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('🛑 Servidor cerrado');
    mongoose.connection.close(false, () => {
      console.log('⏏️ Conexión a MongoDB cerrada');
      process.exit(0);
    });
  });
});
