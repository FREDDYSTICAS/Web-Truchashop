// Suponiendo que estás usando Express y PDFKit para generar PDFs
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
const Pedido = require('../models/Pedido'); // Ajusta la ruta según tu estructura

// Ruta para generar PDF de un pedido individual
exports.generarPdfPedido = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        
        // Verificar si el ID es válido
        if (!mongoose.Types.ObjectId.isValid(pedidoId)) {
            return res.status(400).json({ success: false, message: 'ID de pedido inválido' });
        }

        // Buscar el pedido en la base de datos
        const pedido = await Pedido.findById(pedidoId)
            .populate('cliente', 'nombre email telefono direccion')
            .exec();

        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Configurar la respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pedido_${pedidoId}.pdf`);
        
        // Pipe el PDF a la respuesta HTTP
        doc.pipe(res);
        
        // Agregar contenido al PDF
        generarContenidoPDF(doc, pedido);
        
        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ success: false, message: 'Error al generar el PDF' });
    }
};

// Ruta para generar informe general de pedidos
exports.generarInformeGeneral = async (req, res) => {
    try {
        // Obtener todos los pedidos de la base de datos
        const pedidos = await Pedido.find()
            .populate('cliente', 'nombre email telefono direccion')
            .sort({ fechaCreacion: -1 })
            .exec();

        // Crear un nuevo documento PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Configurar la respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=informe_pedidos_${new Date().toISOString().split('T')[0]}.pdf`);
        
        // Pipe el PDF a la respuesta HTTP
        doc.pipe(res);
        
        // Agregar encabezado al informe
        doc.fontSize(20).text('INFORME GENERAL DE PEDIDOS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Información resumida
        doc.fontSize(14).text('Resumen de Pedidos', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total de pedidos: ${pedidos.length}`);
        
        // Calcular el total de ventas
        const totalVentas = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
        doc.text(`Total en ventas: $${totalVentas.toLocaleString('es-CO')}`);
        
        // Calcular el total con IVA
        const totalConIVA = totalVentas * 1.19;
        doc.text(`Total en ventas (con IVA 19%): $${totalConIVA.toLocaleString('es-CO')}`);
        doc.moveDown(2);

        // Listar cada pedido
        doc.fontSize(14).text('Listado de Pedidos', { underline: true });
        doc.moveDown();

        // Agregar cada pedido al informe
        for (const pedido of pedidos) {
            doc.fontSize(12).text(`Pedido #${pedido._id}`, { underline: true });
            doc.fontSize(10).text(`Cliente: ${pedido.cliente ? pedido.cliente.nombre : pedido.nombre || 'Sin registrar'}`);
            doc.text(`Fecha: ${new Date(pedido.fechaCreacion).toLocaleString()}`);
            doc.text(`Estado: ${pedido.estado}`);
            doc.text(`Total: $${pedido.total.toLocaleString('es-CO')}`);
            doc.text(`Total con IVA (19%): $${(pedido.total * 1.19).toLocaleString('es-CO')}`);
            
            doc.moveDown();
            
            // Si hay muchos pedidos, considerar agregar saltos de página
            if (doc.y > 700) {
                doc.addPage();
            }
        }
        
        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar informe general:', error);
        res.status(500).json({ success: false, message: 'Error al generar el informe general' });
    }
};

// Función auxiliar para generar el contenido del PDF para un pedido individual
function generarContenidoPDF(doc, pedido) {
    // Encabezado
    doc.fontSize(20).text('FACTURA DE PEDIDO', { align: 'center' });
    doc.moveDown();
    
    // Logo (opcional)
    // doc.image('ruta/al/logo.png', 50, 45, { width: 50 });
    
    // Información de la empresa
    doc.fontSize(10).text('TruchaShop', { align: 'right' });
    doc.text('NIT: 900.123.456-7', { align: 'right' });
    doc.text('Dirección: Calle Principal #123', { align: 'right' });
    doc.text('Tel: (601) 123-4567', { align: 'right' });
    doc.moveDown(2);
    
    // Información del pedido
    doc.fontSize(12).text(`Pedido #: ${pedido._id}`);
    doc.text(`Fecha: ${new Date(pedido.fechaCreacion).toLocaleDateString()}`);
    doc.text(`Hora: ${new Date(pedido.fechaCreacion).toLocaleTimeString()}`);
    doc.moveDown();
    
    // Información del cliente
    doc.fontSize(12).text('Información del Cliente', { underline: true });
    if (pedido.cliente) {
        doc.text(`Nombre: ${pedido.cliente.nombre}`);
        doc.text(`Email: ${pedido.cliente.email}`);
        if (pedido.cliente.telefono) doc.text(`Teléfono: ${pedido.cliente.telefono}`);
        if (pedido.cliente.direccion) doc.text(`Dirección: ${pedido.cliente.direccion}`);
    } else {
        doc.text(`Nombre: ${pedido.nombre || 'Sin registrar'}`);
        doc.text(`Email: ${pedido.email || 'Sin registrar'}`);
    }
    doc.moveDown(2);
    
    // Tabla de productos
    doc.fontSize(12).text('Detalle de Productos', { underline: true });
    doc.moveDown();
    
    // Encabezados de la tabla
    const tableTop = doc.y;
    const tableHeaders = ['Cantidad', 'Producto', 'Precio Unitario', 'Subtotal'];
    const columnWidths = [70, 200, 120, 100]; // Ajusta según necesidades
    
    // Dibujar encabezado de la tabla
    doc.fontSize(10);
    let xPosition = 50;
    
    tableHeaders.forEach((header, i) => {
        doc.text(header, xPosition, tableTop, { width: columnWidths[i], align: 'left' });
        xPosition += columnWidths[i];
    });
    
    doc.moveTo(50, tableTop - 5)
       .lineTo(550, tableTop - 5)
       .stroke();
       
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();
    
    // Filas de productos
    let rowTop = tableTop + 20;
    
    // Asegurarnos de que hay productos
    const productos = pedido.productos || [];
    
    productos.forEach(producto => {
        // Si no hay suficiente espacio en la página, crear una nueva
        if (rowTop > 700) {
            doc.addPage();
            rowTop = 50;
            
            // Repetir encabezados en la nueva página
            xPosition = 50;
            tableHeaders.forEach((header, i) => {
                doc.text(header, xPosition, rowTop, { width: columnWidths[i], align: 'left' });
                xPosition += columnWidths[i];
            });
            
            doc.moveTo(50, rowTop - 5)
               .lineTo(550, rowTop - 5)
               .stroke();
               
            doc.moveTo(50, rowTop + 15)
               .lineTo(550, rowTop + 15)
               .stroke();
               
            rowTop += 20;
        }
        
        // Dibujar fila de producto
        xPosition = 50;
        
        // Cantidad
        doc.text(producto.cantidad.toString(), xPosition, rowTop);
        xPosition += columnWidths[0];
        
        // Nombre del producto
        doc.text(producto.nombre, xPosition, rowTop);
        xPosition += columnWidths[1];
        
        // Precio unitario
        doc.text(`$${producto.precio.toLocaleString('es-CO')}`, xPosition, rowTop);
        xPosition += columnWidths[2];
        
        // Subtotal
        const subtotal = producto.precio * producto.cantidad;
        doc.text(`$${subtotal.toLocaleString('es-CO')}`, xPosition, rowTop);
        
        // Preparar para la siguiente fila
        rowTop += 20;
    });
    
    // Línea final de la tabla
    doc.moveTo(50, rowTop - 5)
       .lineTo(550, rowTop - 5)
       .stroke();
    
    // Totales
    rowTop += 10;
    doc.fontSize(10);
    
    // Subtotal
    doc.text('Subtotal:', 400, rowTop);
    doc.text(`$${pedido.total.toLocaleString('es-CO')}`, 500, rowTop);
    rowTop += 15;
    
    // IVA
    const iva = pedido.total * 0.19;
    doc.text('IVA (19%):', 400, rowTop);
    doc.text(`$${iva.toLocaleString('es-CO')}`, 500, rowTop);
    rowTop += 15;
    
    // Total con IVA
    const totalConIva = pedido.total * 1.19;
    doc.fontSize(12).text('TOTAL:', 400, rowTop, { bold: true });
    doc.text(`$${totalConIva.toLocaleString('es-CO')}`, 500, rowTop, { bold: true });
    
    // Notas finales
    doc.moveDown(4);
    doc.fontSize(10).text('Gracias por su compra', { align: 'center' });
    doc.text('Este documento sirve como comprobante de pago', { align: 'center' });
}