const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: false // Permite pedidos sin cliente registrado
  },
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    required: true
  },
  ciudad: {
    type: String,
    required: true
  },
  metodoPago: {
    type: String,
    enum: ['transferencia', 'efectivo'],
    required: true
  },
  productos: [{
    id: String,
    nombre: String,
    precio: Number,
    cantidad: Number
  }],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// Método para calcular el total con IVA
PedidoSchema.methods.getTotalConIVA = function() {
  return this.total * 1.19; // IVA del 19%
};

module.exports = mongoose.model('Pedido', PedidoSchema);