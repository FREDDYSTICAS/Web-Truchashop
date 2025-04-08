const express = require("express");
const path = require("path");
const PDFDocument = require("pdfkit");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conexión exitosa a MongoDB Atlasv"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Motor de plantillas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 🔹 Panel de administración
app.get("/panel", async (req, res) => {
  res.render("panel");
  res.json({ codigo: 200, mensaje: "Vista del panel de administración" });
});

// 🔹 Página principal - Listar productos
app.get("/", async (req, res) => {
  res.render("index");
  res.json({ codigo: 200, mensaje: "Página principal con productos" });
});

// 🔹 Agregar producto
app.post("/productos", async (req, res) => {
  // TODO: Guardar producto en MongoDB
  res.json({ codigo: 201, mensaje: "Producto agregado", data: req.body });
});

// 🔹 Actualizar producto
app.post("/productos/editar/:id", async (req, res) => {
  // TODO: Actualizar producto en MongoDB
  res.json({ codigo: 200, mensaje: "Producto actualizado", id: req.params.id });
});

// 🔹 Eliminar producto
app.post("/productos/eliminar/:id", async (req, res) => {
  // TODO: Eliminar producto de MongoDB
  res.json({ codigo: 200, mensaje: "Producto eliminado", id: req.params.id });
});

// 🔹 Aplicar IVA (esto puede ser reemplazado por lógica JS en Mongo)
app.post("/api/aplicar-iva", async (req, res) => {
  // TODO: Aplicar IVA a los productos (si se quiere calcular en backend)
  res.json({ codigo: 200, mensaje: "IVA aplicado (ficticio)" });
});

// 🔹 Generar PDF con precios + IVA (usa Mongo en el futuro)
app.get("/productos/pdf-con-iva", async (req, res) => {
  // TODO: Traer productos de MongoDB e imprimir PDF
  res.json({ codigo: 200, mensaje: "Generación de PDF aquí" });
});

// 🟢 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en ejecución en el puerto ${PORT}`);
});
