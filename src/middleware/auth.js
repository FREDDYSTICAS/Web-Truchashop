// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  // Verifica si el usuario está autenticado mediante passport
  if (req.isAuthenticated()) {
    console.log('✅ Usuario autenticado:', req.user.email);
    return next();
  }
  
  console.log('❌ Usuario no autenticado. Redirigiendo a login...');
  
  // Guarda la URL original a la que el usuario intentaba acceder
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'Debe iniciar sesión para acceder a esta página');
  res.redirect('/auth/login');
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    console.log('👑 Usuario admin verificado:', req.user.email);
    return next();
  }
  
  console.log('🚫 Acceso denegado a ruta de admin para:', req.user ? req.user.email : 'usuario no autenticado');
  
  res.status(403).render('error', {
    message: 'Acceso denegado. No tienes permisos de administrador.',
    error: { status: 403 }
  });
};

// Middleware para redirigir si ya está autenticado
const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('👤 Usuario ya autenticado. Redirigiendo a panel:', req.user.email);
    return res.redirect('/panel');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  redirectIfAuthenticated
};