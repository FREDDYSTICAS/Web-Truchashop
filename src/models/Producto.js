const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del producto es obligatorio"],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, "El precio es obligatorio"],
    min: [0, "El precio no puede ser negativo"]
  },
  peso: {
    type: Number,
    required: [true, "El peso es obligatorio"],
    min: [0, "El peso no puede ser negativo"]
  },
  imagen: {
    type: String,
    default: "" // Puedes reemplazar con una URL genérica si deseas
  },
  stock: {
    type: Number,
    required: [true, "El stock es obligatorio"],
    min: [0, "El stock no puede ser negativo"]
  },
  precioConIVA: {
    type: Boolean,
    default: false // Indica si ya se aplicó el IVA
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model("Producto", productoSchema);
