const express = require('express');
const router = express.Router();
const actualizacionQRController = require('../controllers/actualizacionQRController');

// Ruta para mostrar la página de escaneo QR
router.get('/escanear', actualizacionQRController.mostrarPaginaQR);

// Ruta para procesar la actualización del stock mediante QR
router.post('/actualizacionQR', actualizacionQRController.actualizarStockPorQR);

module.exports = router;
