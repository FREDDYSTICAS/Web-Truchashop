const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Verificar conexión a la base de datos
pool.query("SELECT NOW()")
  .then((res) => console.log("✅ Conexión exitosa a PostgreSQL:", res.rows[0]))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Motor de plantillas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 🔹 Panel de administración
app.get("/panel", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM public.productos");
    res.render("panel", { productos: rows });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al cargar productos");
  }
});

// 🔹 Página principal - Listar productos
app.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM public.productos");
    res.render("index", { productos: rows });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al cargar productos");
  }
});

// 🔹 Agregar producto
app.post("/productos", async (req, res) => {
  const { nombre, precio, peso, imagen } = req.body;
  try {
    await pool.query(
      "INSERT INTO public.productos (nombre, precio, peso, imagen) VALUES ($1, $2, $3, $4)",
      [nombre, precio, peso, imagen]
    );
    res.redirect("/panel");
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).send("Error al agregar producto");
  }
});

// 🔹 Actualizar producto
app.post("/productos/editar/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, peso, imagen } = req.body;
  try {
    await pool.query(
      "UPDATE public.productos SET nombre = $1, precio = $2, peso = $3, imagen = $4 WHERE id = $5",
      [nombre, precio, peso, imagen, id]
    );
    res.redirect("/panel");
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).send("Error al actualizar producto");
  }
});

// 🔹 Eliminar producto
app.post("/productos/eliminar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM public.productos WHERE id = $1", [id]);
    res.redirect("/panel");
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).send("Error al eliminar producto");
  }
});

// 🔹 Aplicar IVA a los productos (llama al procedimiento almacenado)
app.post("/api/aplicar-iva", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("CALL actualizar_precios_con_iva()");
    client.release();
    res.status(200).json({ success: true, message: "IVA aplicado correctamente" });
  } catch (error) {
    console.error("Error al aplicar IVA:", error);
    res.status(500).json({ success: false, message: "Error al aplicar IVA" });
  }
});

// 🔹 Generar PDF con precios + IVA
app.get("/productos/pdf-con-iva", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, nombre, precio, precio_con_iva FROM productos ORDER BY id"
    );
    const productos = result.rows;
    client.release();

    // 📄 Crear el PDF
    const doc = new PDFDocument({ margin: 30 });

    // Configurar la respuesta HTTP
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=productos-con-iva.pdf");

    // Pipe al response
    doc.pipe(res);

    // 🎨 Estilo del PDF
    doc.fontSize(18).text("Lista de Productos con IVA (19%)", { align: "center" });
    doc.moveDown();

    // 📌 Encabezados de la tabla
    doc.fontSize(12).text("ID", 50, 120);
    doc.text("Nombre", 120, 120);
    doc.text("Precio", 300, 120);
    doc.text("Precio + IVA", 420, 120);
    doc.moveTo(50, 140).lineTo(550, 140).stroke();

    let y = 160;

    // 📌 Llenado de la tabla
    productos.forEach((producto) => {
      // Mostrar solo los últimos 6 caracteres del ID
      const idRecortado = producto.id.toString().slice(0,8);

      // Texto en la tabla
      doc.fontSize(10).text(idRecortado, 50, y);
      doc.text(producto.nombre, 120, y, { width: 160 }); // Limitar el ancho del nombre
      doc.text(`$${Number(producto.precio).toLocaleString("es-CO")}`, 300, y);
      doc.text(`$${Number(producto.precio_con_iva).toLocaleString("es-CO")}`, 420, y);

      y += 25;

      // 📄 Nueva página si es necesario
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // 🚀 Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).send("Error al generar PDF");
  }
});


// 🟢 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}`);
});
