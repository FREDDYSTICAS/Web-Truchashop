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
  // TODO: Reemplazar esto con modelo Mongo
  res.send("Vista del panel de administración");
});

// 🔹 Página principal - Listar productos
app.get("/", async (req, res) => {
  // TODO: Reemplazar esto con modelo Mongo
  res.send("Página principal con productos");
});

// 🔹 Agregar producto
app.post("/productos", async (req, res) => {
  // TODO: Guardar producto en MongoDB
  res.send("Producto agregado");
});

// 🔹 Actualizar producto
app.post("/productos/editar/:id", async (req, res) => {
  // TODO: Actualizar producto en MongoDB
  res.send("Producto actualizado");
});

// 🔹 Eliminar producto
app.post("/productos/eliminar/:id", async (req, res) => {
  // TODO: Eliminar producto de MongoDB
  res.send("Producto eliminado");
});

// 🔹 Aplicar IVA (esto puede ser reemplazado por lógica JS en Mongo)
app.post("/api/aplicar-iva", async (req, res) => {
  // TODO: Aplicar IVA a los productos (si se quiere calcular en backend)
  res.send("IVA aplicado (ficticio)");
});

// 🔹 Generar PDF con precios + IVA (usa Mongo en el futuro)
app.get("/productos/pdf-con-iva", async (req, res) => {
  // TODO: Traer productos de MongoDB e imprimir PDF
  res.send("Generación de PDF aquí");
});

// 🟢 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}`);
});
