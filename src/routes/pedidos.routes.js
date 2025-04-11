const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

// Ruta para crear un nuevo pedido
router.post('/realizar', pedidoController.crearPedido);

// Ruta para obtener todos los pedidos
router.get('/', pedidoController.obtenerPedidos);

// Ruta para obtener pedidos de un cliente específico (esta va antes que /:id para evitar conflictos)
router.get('/cliente/:clienteId', pedidoController.obtenerPedidosCliente);

// Ruta para obtener un pedido específico por ID
router.get('/:id', pedidoController.obtenerPedidoPorId);

// Ruta para actualizar el estado de un pedido
router.put('/:id/estado', pedidoController.actualizarEstadoPedido);

// Ruta para marcar un pedido como enviado
router.put('/:id/enviar', pedidoController.enviarPedido);

// Ruta para eliminar un pedido
router.delete('/:id', pedidoController.eliminarPedido);

module.exports = router;
