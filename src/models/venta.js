const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  telefono: String,
  direccion: String,
  ciudad: String,
  metodoPago: String,
  productos: Array,
  total: Number,
  estado: String,
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    default: null
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Venta', ventaSchema);
