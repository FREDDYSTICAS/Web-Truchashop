// routes/ventas.js
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');

// Ruta principal para mostrar la vista
router.get('/', ventasController.obtenerVentas);

// Ruta para obtener detalles de una venta por ID
router.get('/detalle/:id', ventasController.obtenerVentaPorId);

// Ruta para generar el PDF de una venta individual
router.get('/pdf/:id', ventasController.generarPdfVenta);

// Ruta para generar el informe general o por fechas
router.get('/informe/pdf', ventasController.generarInformeVentas);

module.exports = router;