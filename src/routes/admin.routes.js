const express = require('express');
const router = express.Router();
const path = require('path');

// Middleware para verificar rol de admin (puedes expandirlo)
const isAdmin = (req, res, next) => {
  if (req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }
  req.flash('error', 'Acceso no autorizado');
  res.redirect('/auth/login');
};

// Panel principal de administración
router.get('/panel', isAdmin, (req, res) => {
  res.render('views/panel', {
    title: 'Panel de Administración',
    user: req.session.usuario
  });
});

// Aquí puedes agregar más rutas de admin:
// router.get('/usuarios', isAdmin, ...);
// router.get('/configuracion', isAdmin, ...);

module.exports = router;