const express = require('express');
const router = express.Router();

// Importar sub-rutas
const clientesRoutes = require('./clientes.routes');
const productosRoutes = require('./productos.routes');
const pedidosRoutes = require('./pedidos.routes');
const ventasRoutes = require('./ventas.routes');

// Importar modelos y controladores
const actualizacionQRController = require('../controllers/actualizacionQRController');

// Rutas principales
router.get('/', async (req, res) => {
  const Producto = require('../models/Producto');
  const productos = await Producto.find();
  res.render('index', { productos });
});

// Paneles de administración
router.get('/panel', (req, res) => res.redirect('/panel/productos'));

router.get('/panel/productos', async (req, res) => {
  const Producto = require('../models/Producto');
  const productos = await Producto.find();
  res.render('panel', { productos }); // Vista: views/panel.ejs
});

router.get('/panel-clientes', (req, res) => res.render('panel-clientes'));
router.get('/panel-pedidos', (req, res) => res.render('panel-pedidos'));
router.get('/panel-ventas', (req, res) => res.render('panel-ventas'));

// ✅ RUTA VISUAL PARA PEDIDOS
router.get('/pedidos', async (req, res) => {
  const Pedido = require('../models/Pedido');
  const pedidos = await Pedido.find().populate('cliente').populate('productos');
  res.render('pedidos', { pedidos }); // Vista: views/pedidos.ejs
});

// ✅ RUTA VISUAL PARA VENTAS
router.get('/ventas', async (req, res) => {
  const Venta = require('../models/venta');
  const ventas = await Venta.find().populate('cliente').populate('productos');
  res.render('ventas', { ventas }); // Vista: views/ventas.ejs
});

// ✅ RUTA VISUAL PARA ESCANEO QR (actualizacionQR)
router.get('/actualizacionQR', actualizacionQRController.mostrarPaginaQR);
// o si no usas el controlador:
// router.get('/actualizacionQR', (req, res) => res.render('actualizacionQR'));

// Ruta para manejar actualización del stock vía POST (si deseas hacer pruebas sin fetch)
router.post('/actualizacionQR', actualizacionQRController.actualizarStockPorQR);

// Ruta principal
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'TruchaShop | Inicio',
    user: req.user
  });
});

// Ruta para acceso al panel (redirige a /panel)
router.get('/admin', (req, res) => {
  console.log('⚠️ Acceso a /admin, redirigiendo a /panel');
  res.redirect('/panel');
});


// Montar sub-rutas API
router.use('/api/clientes', clientesRoutes);
router.use('/api/productos', productosRoutes);
router.use('/api/pedidos', pedidosRoutes);
router.use('/api/ventas', ventasRoutes);

// Registro de cliente desde formulario web
router.post('/registro-cliente', async (req, res) => {
  try {
    const Cliente = require('../models/Cliente');

    const nuevoCliente = new Cliente({
      tipoDocumento: req.body.tipoDocumento,
      numeroDocumento: req.body.numeroDocumento,
      nombreCompleto: req.body.nombreCompleto,
      numeroContacto: req.body.numeroContacto,
      correoElectronico: req.body.correoElectronico,
      newsletter: req.body.newsletter === 'on',
    });

    await nuevoCliente.save();
    res.status(201).json({ success: true, message: "Cliente registrado exitosamente" });

  } catch (error) {
    console.error('Error al registrar cliente:', error.message);
    res.status(500).json({ success: false, message: "Error al registrar cliente", error: error.message });
  }
});

module.exports = router;
