const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Middleware para restringir acceso solo a cfreddystiven@gmail.com
function allowOnlyFreddy(req, res, next) {
  if (req.isAuthenticated() && req.user.email === 'cfreddystiven@gmail.com') {
    return next();  // Permitir el acceso si el correo es el permitido
  }
  res.status(403).send('Acceso denegado. No tienes permisos de administrador.');
}

// Proteger todas las rutas del panel de administración
router.use(isAuthenticated);  // Asegúrate de que el usuario esté autenticado
router.use(allowOnlyFreddy);  // Agregar la restricción de acceso por correo

// Aquí sigue el middleware de administrador si es necesario
router.use(isAdmin);

// Ruta principal del panel de administración
router.get('/', authController.dashboard);

// Aquí puedes añadir más rutas para gestionar productos, usuarios, etc.
// router.get('/productos', productoController.listarProductos);
// router.get('/usuarios', usuarioController.listarUsuarios);

module.exports = router;
