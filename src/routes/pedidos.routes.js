const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const pdfController = require('../controllers/pdf.Controller');

// Crear un nuevo pedido
router.post('/realizar', pedidoController.crearPedido);

// Obtener todos los pedidos
router.get('/', pedidoController.obtenerPedidos);

// Obtener pedidos de un cliente específico
router.get('/cliente/:clienteId', pedidoController.obtenerPedidosCliente);

// Obtener un pedido específico por ID
router.get('/:id', pedidoController.obtenerPedidoPorId);

// Actualizar el estado de un pedido
router.put('/:id/estado', pedidoController.actualizarEstadoPedido);

// Marcar un pedido como enviado y guardarlo como venta
router.put('/:id/enviar', pedidoController.enviarPedido);

// Eliminar un pedido
router.delete('/:id', pedidoController.eliminarPedido);

// Generar PDF de un pedido individual

router.post('/:id/generar-pdf', pdfController.generarPdfPedido);
router.post('/generar-informe/general', pdfController.generarInformeGeneral);


module.exports = router;
