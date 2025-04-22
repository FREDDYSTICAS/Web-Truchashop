const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const PDFDocument = require('pdfkit');
const Pedido = require('../models/Pedido'); // Asegúrate de importar tu modelo Pedido

// Ruta para crear un nuevo pedido
router.post('/realizar', pedidoController.crearPedido);

// Ruta para obtener todos los pedidos
router.get('/', pedidoController.obtenerPedidos);

// Ruta para obtener pedidos de un cliente específico
router.get('/cliente/:clienteId', pedidoController.obtenerPedidosCliente);

// Ruta para obtener un pedido específico por ID
router.get('/:id', pedidoController.obtenerPedidoPorId);

// Ruta para actualizar el estado de un pedido
router.put('/:id/estado', pedidoController.actualizarEstadoPedido);

// Ruta para marcar un pedido como enviado
router.put('/:id/enviar', pedidoController.enviarPedido);

// Ruta para eliminar un pedido
router.delete('/:id', pedidoController.eliminarPedido);

// Ruta para generar PDF de un pedido individual
router.get('/:id/pdf', async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const pedido = await Pedido.findById(pedidoId)
            .populate('cliente')
            .populate('productos.producto');

        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        const doc = new PDFDocument();
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pedido_${pedidoId}.pdf`);
        
        // Generar contenido del PDF
        generarPDFIndividual(doc, pedido);
        
        // Pipe el PDF a la respuesta
        doc.pipe(res);
        doc.end();
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ success: false, message: 'Error al generar PDF' });
    }
});

// Ruta para generar informe general de pedidos
router.get('/informe/general', async (req, res) => {
    try {
        const doc = new PDFDocument();
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        const fecha = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Disposition', `attachment; filename=informe_pedidos_${fecha}.pdf`);
        
        // Generar contenido del PDF
        await generarPDFGeneral(doc);
        
        // Pipe el PDF a la respuesta
        doc.pipe(res);
        doc.end();
        
    } catch (error) {
        console.error('Error al generar informe general:', error);
        res.status(500).json({ success: false, message: 'Error al generar informe' });
    }
});

// Función para generar PDF individual
function generarPDFIndividual(doc, pedido) {
    // Configuración del documento
    doc.font('Helvetica-Bold').fontSize(20).text('TruchaShop - Detalle de Pedido', { align: 'center' });
    doc.moveDown();
    
    // Información del pedido
    doc.font('Helvetica').fontSize(12);
    doc.text(`Número de Pedido: ${pedido._id}`);
    doc.text(`Fecha: ${new Date(pedido.fechaCreacion).toLocaleString('es-CO')}`);
    doc.text(`Cliente: ${pedido.cliente?.nombre || pedido.nombre || 'No especificado'}`);
    if (pedido.email) doc.text(`Email: ${pedido.email}`);
    doc.text(`Estado: ${pedido.estado}`);
    doc.moveDown();
    
    // Tabla de productos
    doc.font('Helvetica-Bold');
    doc.text('Productos', { underline: true });
    doc.moveDown(0.5);
    
    // Encabezados de tabla
    doc.font('Helvetica-Bold');
    doc.text('Producto', 50, doc.y);
    doc.text('Cantidad', 250, doc.y);
    doc.text('P. Unitario', 350, doc.y);
    doc.text('Subtotal', 450, doc.y);
    doc.moveDown();
    
    // Productos
    doc.font('Helvetica');
    let y = doc.y;
    pedido.productos.forEach(producto => {
        const precioUnitario = producto.producto?.precio || producto.precio || 0;
        const subtotal = precioUnitario * producto.cantidad;
        
        doc.text(producto.producto?.nombre || producto.nombre, 50, y);
        doc.text(producto.cantidad.toString(), 250, y);
        doc.text(`$${precioUnitario.toLocaleString('es-CO')}`, 350, y);
        doc.text(`$${subtotal.toLocaleString('es-CO')}`, 450, y);
        y += 20;
    });
    
    doc.moveDown(2);
    
    // Totales
    const subtotal = pedido.total || pedido.productos.reduce((sum, p) => sum + (p.producto?.precio || p.precio || 0) * p.cantidad, 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    doc.font('Helvetica-Bold');
    doc.text(`Subtotal: $${subtotal.toLocaleString('es-CO')}`, { align: 'right' });
    doc.text(`IVA (19%): $${iva.toLocaleString('es-CO')}`, { align: 'right' });
    doc.text(`Total: $${total.toLocaleString('es-CO')}`, { align: 'right' });
}

// Función para generar informe general
async function generarPDFGeneral(doc) {
    // Obtener todos los pedidos de la base de datos
    const pedidos = await Pedido.find()
        .populate('cliente')
        .populate('productos.producto')
        .sort({ fechaCreacion: -1 });
    
    // Configuración del documento
    doc.font('Helvetica-Bold').fontSize(20).text('TruchaShop - Informe General de Pedidos', { align: 'center' });
    doc.moveDown();
    
    doc.font('Helvetica').fontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-CO')}`);
    doc.text(`Total de pedidos: ${pedidos.length}`);
    doc.moveDown();
    
    // Tabla resumen
    doc.font('Helvetica-Bold');
    doc.text('Resumen de Pedidos', { underline: true });
    doc.moveDown(0.5);
    
    // Encabezados de tabla
    const headers = ['ID', 'Fecha', 'Cliente', 'Productos', 'Total', 'Total + IVA'];
    let x = 50;
    headers.forEach(header => {
        doc.text(header, x, doc.y);
        x += (header === 'Productos' || header === 'Cliente') ? 120 : 80;
    });
    doc.moveDown();
    
    // Datos de los pedidos
    doc.font('Helvetica');
    pedidos.forEach(pedido => {
        const y = doc.y;
        doc.text(pedido._id.toString().substring(0, 8), 50, y);
        doc.text(new Date(pedido.fechaCreacion).toLocaleDateString('es-CO'), 130, y);
        doc.text(pedido.cliente?.nombre || 'No registrado', 210, y, { width: 120, ellipsis: true });
        doc.text(pedido.productos.length.toString(), 330, y);
        
        const subtotal = pedido.total || pedido.productos.reduce((sum, p) => sum + (p.producto?.precio || p.precio || 0) * p.cantidad, 0);
        const totalConIva = subtotal * 1.19;
        
        doc.text(`$${subtotal.toLocaleString('es-CO')}`, 410, y);
        doc.text(`$${totalConIva.toLocaleString('es-CO')}`, 490, y);
        
        doc.moveDown();
    });
    
    // Totales generales
    doc.moveDown(2);
    const totalGeneral = pedidos.reduce((sum, p) => sum + (p.total || p.productos.reduce((sumP, prod) => sumP + (prod.producto?.precio || prod.precio || 0) * prod.cantidad, 0)), 0);
    const ivaGeneral = totalGeneral * 0.19;
    
    doc.font('Helvetica-Bold');
    doc.text(`Subtotal General: $${totalGeneral.toLocaleString('es-CO')}`, { align: 'right' });
    doc.text(`IVA General (19%): $${ivaGeneral.toLocaleString('es-CO')}`, { align: 'right' });
    doc.text(`Total General: $${(totalGeneral + ivaGeneral).toLocaleString('es-CO')}`, { align: 'right' });
}

module.exports = router;