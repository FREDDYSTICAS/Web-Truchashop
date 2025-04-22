const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');

router.get('/', productosController.listarProductos);
router.post('/agregar', productosController.agregarProducto);
router.post('/editar/:id', productosController.actualizarProducto);
router.post('/eliminar/:id', productosController.eliminarProducto);

router.post('/aplicar-iva', productosController.aplicarIVA);
router.get('/pdf-con-iva', productosController.generarPDFConIVA);
router.post('/agregar-unidades/:id', productosController.agregarUnidades);
module.exports = router;
