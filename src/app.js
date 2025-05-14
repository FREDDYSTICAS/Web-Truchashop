require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const morgan = require('morgan');
const passport = require('passport');

// Importar las rutas de actualización por QR
const actualizacionQRRoutes = require('./routes/actualizacionQRRoutes');

// Configuración inicial
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middlewares básicos
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configuración de sesión ANTES de passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_super_secreto_seguro_' + Math.random().toString(36).substring(2),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Solo true en producción con HTTPS
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

// Configuración de Passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Flash messages para feedback al usuario
app.use(flash());

// Middleware para variables globales
app.use((req, res, next) => {
  // Usar SOLO req.user para consistencia, no mezclar con req.session.usuario
  res.locals.currentUser = req.user;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.errors = req.flash('errors');
  res.locals.env = process.env.NODE_ENV;
  next();
});

// Definir rutas públicas que no requieren autenticación
const publicPaths = [
  '/',
  '/auth/login', 
  '/auth/register', 
  '/auth/logout', 
  '/auth/google',
  '/auth/google/callback',
  '/qr', 
  '/api/escanear'
];

// Importar middleware de autenticación
const { isAuthenticated } = require('./middleware/auth');

// Middleware para verificar autenticación global (evitamos aplicarlo en rutas públicas)
app.use((req, res, next) => {
  // Verificar si la ruta es pública
  const isPublicPath = publicPaths.some(path => req.path === path || req.path.startsWith(path));
  
  if (!isPublicPath && !req.isAuthenticated()) {
    // Guardar la URL a la que intentaba acceder
    console.log(`🔒 Acceso denegado a ${req.path} - Usuario no autenticado`);
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Debe iniciar sesión para acceder a esta página');
    return res.redirect('/auth/login');
  }
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
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));

// Ruta específica para el panel - IMPORTANTE: Aplicamos explícitamente el middleware de autenticación
app.get('/panel', isAuthenticated, (req, res) => {
  console.log('Entrando al panel...');
  console.log('Usuario autenticado:', req.user ? req.user.email : 'No autenticado');
  res.render('panel', { usuario: req.user });
});

// Rutas para la actualización de stock por QR
app.use('/api', actualizacionQRRoutes); 

// Para servir la página principal de escaneo (sin autenticación por conveniencia)
app.get('/qr', (req, res) => {
  res.redirect('/api/escanear');
});

app.get('/unauthorized-test', (req, res) => {
  res.render('unauthorized');
});


// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render('error', { 
    message: 'Página no encontrada',
    error: { status: 404 }
  });
});

// Error 500 - Error interno del servidor
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Error inesperado',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
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