const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  tipoDocumento: {
    type: String,
    required: true,
    enum: ['CC', 'CE', 'TI', 'PP', 'NIT']
  },
  numeroDocumento: {
    type: String,
    required: true,
    unique: true
  },
  nombreCompleto: {
    type: String,
    required: true
  },
  numeroContacto: {
    type: String,
    required: true
  },
  correoElectronico: {
    type: String,
    required: true,
    unique: true
  },
  newsletter: {
    type: Boolean,
    default: false
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Previene OverwriteModelError si ya existe
module.exports = mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);
