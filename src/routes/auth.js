const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Ruta para página de login
router.get('/login', redirectIfAuthenticated, (req, res) => {
  console.log('🟡 GET /auth/login - Página de login solicitada');
  authController.loginPage(req, res);
});

// Iniciar autenticación con Google
router.get('/google', (req, res, next) => {
  console.log('🟢 GET /auth/google - Iniciando autenticación con Google...');
  // Guardar la URL de retorno si viene de alguna página
  if (req.session.returnTo) {
    console.log('📌 returnTo URL guardada:', req.session.returnTo);
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback después de autenticación con Google
router.get('/google/callback',
  (req, res, next) => {
    console.log('🟢 GET /auth/google/callback - Callback recibido. Procesando autenticación...');
    next();
  },
  passport.authenticate('google', {
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  (req, res) => {
    console.log('✅ Autenticación exitosa con Google');
    // Mostrar el usuario que se autenticó
    if (req.user) {
      console.log('👤 Usuario autenticado:', {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        role: req.user.role
      });
    } else {
      console.log('⚠️ No se encontró req.user después de autenticación');
    }

    // Verificación de acceso según el rol (esto es lo que buscas)
    if (req.user) {
      // Solo redirige si el usuario tiene el rol adecuado (o es un usuario autorizado)
      if (req.user.role === 'admin' || req.user.email === 'cfreddystiven@gmail.com') {
        console.log('👤 Usuario autorizado.');
        req.session.isLoggedIn = true;
        const redirectUrl = req.session.returnTo || '/panel';  // Cambiar esta URL de redirección si es necesario
        console.log('🔁 Redireccionando a:', redirectUrl);
        delete req.session.returnTo;
        return res.redirect(redirectUrl);
      } else {
        console.log('❌ Usuario no autorizado.');
        return res.status(403).send(`
  <script>
    alert("Acceso denegado. No tienes permisos para entrar.");
    window.location.href = "/auth/login";
  </script>
`);

      }
    }
  }
);

// Cerrar sesión
router.get('/logout', (req, res) => {
  console.log('🚪 GET /auth/logout - Cerrando sesión...');
  authController.logout(req, res);
});

module.exports = router;
