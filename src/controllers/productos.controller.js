const Producto = require("../models/Producto");
const PDFDocument = require("pdfkit");

// Listar productos
exports.listarProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.render("index", { productos });
  } catch (error) {
    res.status(500).send("Error al obtener productos");
  }
};

// Agregar nuevo producto (POST /productos/agregar)
exports.agregarProducto = async (req, res) => {
  try {
    const { nombre, precio, peso, imagen, stock } = req.body;
    await Producto.create({
      nombre,
      precio: parseFloat(precio),
      peso: parseFloat(peso),
      imagen,
      stock: parseInt(stock),
      precioConIVA: false
    });
    res.status(200).json({ mensaje: "Producto agregado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar producto", error: error.message });
  }
};

// Actualizar producto (POST /productos/editar/:id)
exports.actualizarProducto = async (req, res) => {
  try {
    const { nombre, precio, peso, imagen, stock } = req.body;
    await Producto.findByIdAndUpdate(req.params.id, {
      nombre,
      precio: parseFloat(precio),
      peso: parseFloat(peso),
      imagen,
      stock: parseInt(stock)
    });
    res.status(200).json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar producto", error: error.message });
  }
};

// Eliminar producto (POST /productos/eliminar/:id)
exports.eliminarProducto = async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto", error: error.message });
  }
};

// Aplicar IVA a todos los productos (POST /api/aplicar-iva)
exports.aplicarIVA = async (req, res) => {
  try {
    const productos = await Producto.find();
    for (let producto of productos) {
      if (!producto.precioConIVA) {
        producto.precio = parseFloat((producto.precio * 1.19).toFixed(2));
        producto.precioConIVA = true;
        await producto.save();
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Generar PDF con precios con IVA (GET /productos/pdf-con-iva)
// Generar PDF con precios con IVA (GET /productos/pdf-con-iva)
exports.generarPDFConIVA = async (req, res) => {
  try {
    const productos = await Producto.find();
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4'
    });

    // Configurar respuesta HTTP
    res.setHeader("Content-Disposition", "attachment; filename=productos-con-iva.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Añadir título y cabecera
    doc.font('Helvetica-Bold')
       .fontSize(22)
       .fillColor('#0066cc')
       .text("LISTADO DE PRODUCTOS CON IVA", { align: "center" });
    
    doc.moveDown(2);
    
    // Añadir fecha del informe
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Fecha del informe: ${new Date().toLocaleDateString()}`, { align: "right" });
    
    doc.moveDown(2);

    // Crear tabla de cabecera
    const tableTop = 150;
    const colWidths = {
      nombre: 200,
      precio: 100,
      precioConIVA: 100,
      peso: 70,
      stock: 70
    };

    // Dibujar cabecera de la tabla
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#333333');
    
    let yPos = tableTop;
    
    // Dibujar fondo de cabecera
    doc.rect(50, yPos - 5, 540, 25)
       .fillAndStroke('#e6e6e6', '#cccccc');

    // Textos de cabecera
    doc.fillColor('#333333')
       .text("Producto", 55, yPos)
       .text("Precio", 55 + colWidths.nombre, yPos)
       .text("Precio + IVA", 55 + colWidths.nombre + colWidths.precio, yPos)
       .text("Peso (kg)", 55 + colWidths.nombre + colWidths.precio + colWidths.precioConIVA, yPos)
       .text("Stock", 55 + colWidths.nombre + colWidths.precio + colWidths.precioConIVA + colWidths.peso, yPos);

    yPos += 30;

    // Añadir contenido de la tabla
    let colorAlternado = false;
    const IVA = 0.21; // 21% de IVA, ajustar según corresponda

    for (const p of productos) {
      // Comprobar si necesitamos una nueva página
      if (yPos > 700) {
        doc.addPage();
        yPos = 70;
      }

      // Alternar colores de fondo para las filas
      if (colorAlternado) {
        doc.rect(50, yPos - 5, 540, 22)
           .fillAndStroke('#f9f9f9', '#f9f9f9');
      }
      colorAlternado = !colorAlternado;

      // Calcular precio con IVA
      const precioConIVA = p.precio * (1 + IVA);

      // Añadir datos de producto
      doc.font('Helvetica')
         .fontSize(11)
         .fillColor('#333333')
         .text(p.nombre, 55, yPos, { width: colWidths.nombre - 10 })
         .text(`$${p.precio.toFixed(2)}`, 55 + colWidths.nombre, yPos)
         .text(`$${precioConIVA.toFixed(2)}`, 55 + colWidths.nombre + colWidths.precio, yPos)
         .text(`${p.peso}`, 55 + colWidths.nombre + colWidths.precio + colWidths.precioConIVA, yPos);

      // Colorear el stock según su nivel
      if (p.stock <= 5) {
        doc.fillColor('#cc0000'); // Rojo si es bajo
      } else if (p.stock <= 20) {
        doc.fillColor('#ff9900'); // Naranja si es medio
      } else {
        doc.fillColor('#009900'); // Verde si es alto
      }
      
      doc.text(`${p.stock}`, 55 + colWidths.nombre + colWidths.precio + colWidths.precioConIVA + colWidths.peso, yPos);
      doc.fillColor('#333333');
      
      yPos += 25;
    }

    // Añadir línea separadora y nota al pie
    doc.moveTo(50, yPos)
       .lineTo(590, yPos)
       .stroke();
    
    doc.moveDown();
    doc.fontSize(9)
       .fillColor('#666666')
       .text('Nota: Los precios incluyen un IVA del 19%', { align: 'center' });

    // Añadir número de página
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .fillColor('#999999')
         .text(
           `Página ${i + 1} de ${totalPages}`,
           50,
           doc.page.height - 50,
           { align: 'center', width: doc.page.width - 100 }
         );
    }

    // Añadir pie de página con información de la empresa
    doc.fontSize(8)
       .fillColor('#666666')
       .text(
         'Catálogo generado automáticamente. Para más información contacte con nosotros.',
         50,
         doc.page.height - 30,
         { align: 'center', width: doc.page.width - 100 }
       );

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send("Error al generar el PDF");
  }
};
// En productosController.js
exports.agregarUnidades = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }
    
    producto.stock += parseInt(cantidad);
    await producto.save();
    
    res.status(200).json({ mensaje: `Se agregaron ${cantidad} unidades al stock` });
  } catch (error) {
    res.status(500).json({ 
      mensaje: "Error al actualizar unidades",
      error: error.message 
    });
  }
};