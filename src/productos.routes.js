const express = require("express");
const router = express.Router();
const { pool } = require("./db");
const PDFDocument = require("pdfkit");

// 🔹 Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// 🔹 Agregar un nuevo producto
router.post("/", async (req, res) => {
  const { nombre, precio } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING id",
      [nombre, precio]
    );

    const productoId = result.rows[0].id;
    await pool.query(
      "INSERT INTO logs_productos (producto_id, accion, fecha) VALUES ($1, $2, NOW())",
      [productoId, "Creación"]
    );

    res.json({ mensaje: "✅ Producto agregado con éxito", id: productoId });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// 🔹 Actualizar producto
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;

  try {
    await pool.query("UPDATE productos SET precio = $1 WHERE id = $2", [
      precio,
      id,
    ]);

    await pool.query(
      "INSERT INTO logs_productos (producto_id, accion, fecha) VALUES ($1, $2, NOW())",
      [id, "Actualización"]
    );

    res.json({ mensaje: "✅ Producto actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// 🔹 Eliminar producto
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM productos WHERE id = $1", [id]);

    await pool.query(
      "INSERT INTO logs_productos (producto_id, accion, fecha) VALUES ($1, $2, NOW())",
      [id, "Eliminación"]
    );

    res.json({ mensaje: "✅ Producto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// 🔹 Obtener productos con IVA incluido
router.get("/productos-con-iva", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, precio, (precio * 1.19) AS precio_con_iva FROM productos"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos con IVA:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// 🔹 Generar PDF con productos e IVA
router.get("/productos/pdf", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, precio, (precio * 1.19) AS precio_con_iva FROM productos"
    );
    const productos = result.rows;

    // Crear el PDF
    const doc = new PDFDocument();

    // Configurar la respuesta HTTP para la descarga del PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=productos.pdf");

    doc.pipe(res);

    // Encabezado
    doc.fontSize(18).text("Lista de Productos", { align: "center" });
    doc.moveDown();

    // Cabecera de la tabla
    doc.fontSize(12).text("ID", 50, 100);
    doc.text("Nombre", 100, 100);
    doc.text("Precio", 250, 100);
    doc.text("Precio + IVA", 400, 100);
    doc.moveTo(50, 120).lineTo(550, 120).stroke();

    let y = 140; // Posición inicial en la página

    // Recorrer los productos y agregarlos al PDF
    productos.forEach(producto => {
      doc.text(producto.id.toString(), 50, y);
      doc.text(producto.nombre, 100, y);
      doc.text(`$${producto.precio.toFixed(2)}`, 250, y);
      doc.text(`$${producto.precio_con_iva.toFixed(2)}`, 400, y);

      y += 30; // Espaciado entre filas

      // Si la página se llena, crear una nueva página
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
