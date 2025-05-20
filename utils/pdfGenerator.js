/**
 * TruchaShop - PDF Generator Service
 * Servicio mejorado para generación de documentos PDF
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGeneratorService {
  constructor() {
    // Configuración de estilos
    this.styles = {
      colors: {
        primary: '#1e88e5',
        secondary: '#424242',
        accent: '#e74c3c',
        light: '#f5f5f5',
        text: '#333333'
      },
      fonts: {
        title: 'Helvetica-Bold',
        subtitle: 'Helvetica-Bold',
        body: 'Helvetica',
        emphasis: 'Helvetica-Oblique'
      }
    };
    
    // Ruta al logo (asegúrate de que esta ruta sea correcta en tu proyecto)
    this.logoPath = path.join(__dirname, '../public/img/png-trucha arcoiris.png');
  }

  /**
   * Agrega el encabezado estándar a todos los documentos
   * @param {PDFDocument} doc - Documento PDF
   * @param {String} title - Título del documento
   */
  addHeader(doc, title) {
    // Verificar si el logo existe
    let hasLogo = false;
    try {
      hasLogo = fs.existsSync(this.logoPath);
    } catch (err) {
      console.log('Logo no encontrado:', err);
    }
    
    // Agregar logo si existe
    if (hasLogo) {
      doc.image(this.logoPath, 50, 45, { width: 50 })
         .moveDown();
    }

    // Título del documento
    doc.font(this.styles.fonts.title)
       .fontSize(22)
       .fillColor(this.styles.colors.primary)
       .text(title, hasLogo ? 110 : 50, hasLogo ? 50 : 50, { align: 'left' })
       .moveDown(0.5);

    // Fecha de generación
    doc.font(this.styles.fonts.body)
       .fontSize(10)
       .fillColor(this.styles.colors.secondary)
       .text(`Generado el: ${new Date().toLocaleString('es-CO')}`, { align: 'right' })
       .moveDown(1);

    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .strokeColor(this.styles.colors.primary)
       .lineWidth(1)
       .stroke()
       .moveDown(1);
  }

  /**
   * Agrega el pie de página a todas las páginas
   * @param {PDFDocument} doc - Documento PDF
   */
  addFooter(doc) {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      // Posicionar en la parte inferior
      const footerY = doc.page.height - 50;
      
      // Línea separadora
      doc.moveTo(50, footerY)
         .lineTo(doc.page.width - 50, footerY)
         .strokeColor(this.styles.colors.primary)
         .lineWidth(0.5)
         .stroke();
      
      // Texto del pie de página
      doc.font(this.styles.fonts.body)
         .fontSize(8)
         .fillColor(this.styles.colors.secondary)
         .text(
           'TruchaShop - Sistema de Gestión de Ventas',
           50,
           footerY + 10,
           { align: 'left' }
         )
         .text(
           `Página ${i + 1 - range.start} de ${range.count}`,
           50,
           footerY + 10,
           { align: 'right' }
         );
    }
  }

  /**
   * Genera una tabla para mostrar datos
   * @param {PDFDocument} doc - Documento PDF
   * @param {Array} headers - Encabezados de la tabla
   * @param {Array} rows - Filas de datos
   * @param {Object} options - Opciones de configuración
   */
  createTable(doc, headers, rows, options = {}) {
    const defaults = {
      startX: 50,
      startY: doc.y,
      width: doc.page.width - 100,
      rowHeight: 20,
      fontSize: 10,
      headerColor: this.styles.colors.primary,
      rowEvenColor: this.styles.colors.light,
      rowOddColor: '#ffffff'
    };
    
    const settings = { ...defaults, ...options };
    const columnWidth = settings.width / headers.length;
    
    // Dibujar encabezados
    doc.font(this.styles.fonts.subtitle)
       .fontSize(settings.fontSize)
       .fillColor('#ffffff');
    
    headers.forEach((header, i) => {
      const x = settings.startX + (i * columnWidth);
      
      // Fondo del encabezado
      doc.rect(x, settings.startY, columnWidth, settings.rowHeight)
         .fill(settings.headerColor);
      
      // Texto del encabezado
      doc.fillColor('#ffffff')
         .text(
           header,
           x + 5,
           settings.startY + 5,
           { width: columnWidth - 10 }
         );
    });
    
    // Dibujar filas
    let currentY = settings.startY + settings.rowHeight;
    
    rows.forEach((row, rowIndex) => {
      // Verificar si hay espacio suficiente para la fila
      if (currentY + settings.rowHeight > doc.page.height - 70) {
        doc.addPage();
        currentY = 50;
      }
      
      // Color de fondo alternado
      const fillColor = rowIndex % 2 === 0 ? settings.rowEvenColor : settings.rowOddColor;
      
      headers.forEach((_, colIndex) => {
        const x = settings.startX + (colIndex * columnWidth);
        const cellContent = row[colIndex] || '';
        
        // Fondo de la celda
        doc.rect(x, currentY, columnWidth, settings.rowHeight)
           .fillColor(fillColor)
           .fill();
        
        // Texto de la celda
        doc.font(this.styles.fonts.body)
           .fontSize(settings.fontSize)
           .fillColor(this.styles.colors.text)
           .text(
             cellContent,
             x + 5,
             currentY + 5,
             { width: columnWidth - 10 }
           );
      });
      
      currentY += settings.rowHeight;
    });
    
    // Actualizar la posición Y del documento
    doc.y = currentY + 10;
    return doc;
  }

  /**
   * Genera PDF con listado de productos
   * @param {Array} productos - Lista de productos
   * @param {Response} res - Objeto de respuesta HTTP
   */
  generateProductsPDF(productos, res) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Configurar respuesta HTTP
    res.setHeader('Content-disposition', 'attachment; filename="productos-truchashop.pdf"');
    res.setHeader('Content-type', 'application/pdf');
    
    // Preparar documento
    this.addHeader(doc, 'Catálogo de Productos');
    
    // Información adicional
    doc.font(this.styles.fonts.body)
       .fontSize(12)
       .fillColor(this.styles.colors.secondary)
       .text(`Total de productos: ${productos.length}`, { align: 'left' })
       .moveDown(1);
    
    // Crear tabla de productos
    const headers = ['Nombre', 'Categoría', 'Precio', 'Stock', 'Estado'];
    const rows = productos.map(p => [
      p.nombre,
      p.categoria || 'N/A',
      `$${(parseFloat(p.precio) || 0).toLocaleString('es-CO')}`,
      p.stock.toString(),
      p.disponible ? 'Disponible' : 'Agotado'
    ]);
    
    this.createTable(doc, headers, rows);
    
    // Agregar información adicional
    doc.moveDown(2)
       .font(this.styles.fonts.emphasis)
       .fontSize(10)
       .fillColor(this.styles.colors.secondary)
       .text('* Los precios pueden estar sujetos a cambios sin previo aviso.', { align: 'center' });
    
    // Añadir pie de página
    this.addFooter(doc);
    
    // Finalizar y enviar documento
    doc.pipe(res);
    doc.end();
  }

  /**
   * Genera PDF con informe de ventas
   * @param {Array} pedidos - Lista de ventas/pedidos
   * @param {Response} res - Objeto de respuesta HTTP
   * @param {Object} filtros - Filtros aplicados (opcional)
   */
  generateSalesPDF(pedidos, res, filtros = {}) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Configurar respuesta HTTP
    res.setHeader('Content-Disposition', 'attachment; filename="informe-ventas-truchashop.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    
    // Preparar documento
    this.addHeader(doc, 'Informe de Ventas');
    
    // Información del informe
    const totalVentas = pedidos.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
    const totalProductos = pedidos.reduce((sum, p) => {
      return sum + p.productos.reduce((sumP, producto) => sumP + (parseInt(producto.cantidad) || 0), 0);
    }, 0);
    
    // Mostrar filtros si existen
    if (filtros.inicio && filtros.fin) {
      doc.font(this.styles.fonts.subtitle)
         .fontSize(11)
         .fillColor(this.styles.colors.secondary)
         .text(`Período: ${new Date(filtros.inicio).toLocaleDateString('es-CO')} al ${new Date(filtros.fin).toLocaleDateString('es-CO')}`, { align: 'left' });
    }
    
    // Resumen de ventas
    doc.font(this.styles.fonts.subtitle)
       .fontSize(14)
       .fillColor(this.styles.colors.primary)
       .text('Resumen de Ventas', { align: 'left' })
       .moveDown(0.5);
    
    doc.font(this.styles.fonts.body)
       .fontSize(12)
       .fillColor(this.styles.colors.secondary)
       .text(`Total de ventas: ${pedidos.length}`, { align: 'left' })
       .text(`Ingresos totales: $${totalVentas.toLocaleString('es-CO')}`, { align: 'left' })
       .text(`Productos vendidos: ${totalProductos}`, { align: 'left' })
       .moveDown(1);
    
    // Tabla resumen de ventas
    const headers = ['Fecha', 'Cliente', 'Productos', 'Total', 'Método Pago'];
    const rows = pedidos.map(p => [
      new Date(p.fecha).toLocaleDateString('es-CO'),
      p.cliente?.nombre || 'N/A',
      p.productos.length.toString(),
      `$${(parseFloat(p.total) || 0).toLocaleString('es-CO')}`,
      p.metodoPago || 'N/A'
    ]);
    
    this.createTable(doc, headers, rows);
    
    // Detalles de cada venta
    doc.addPage();
    this.addHeader(doc, 'Detalle de Ventas');
    
    pedidos.forEach((pedido, index) => {
      // Verificar si necesitamos una nueva página
      if (doc.y > doc.page.height - 200 && index > 0) {
        doc.addPage();
        doc.y = 50;
      }
      
      const clienteNombre = pedido.cliente?.nombre || 'Cliente no disponible';
      
      // Encabezado de la venta
      doc.font(this.styles.fonts.subtitle)
         .fontSize(14)
         .fillColor(this.styles.colors.primary)
         .text(`Venta #${pedido._id}`, { align: 'left' })
         .moveDown(0.5);
      
      // Información de la venta
      doc.font(this.styles.fonts.body)
         .fontSize(11)
         .fillColor(this.styles.colors.secondary)
         .text(`Fecha: ${new Date(pedido.fecha).toLocaleString('es-CO')}`)
         .text(`Cliente: ${clienteNombre}`)
         .text(`Método de Pago: ${pedido.metodoPago || 'No especificado'}`)
         .moveDown(0.5);
      
      // Productos
      doc.font(this.styles.fonts.subtitle)
         .fontSize(11)
         .fillColor(this.styles.colors.primary)
         .text('Productos:', { underline: true })
         .moveDown(0.2);
      
      // Tabla de productos de la venta
      const prodHeaders = ['Producto', 'Precio Unit.', 'Cantidad', 'Subtotal'];
      const prodRows = pedido.productos.map(p => [
        p.nombre,
        `$${(parseFloat(p.precioUnitario || p.precio) || 0).toLocaleString('es-CO')}`,
        p.cantidad.toString(),
        `$${((parseFloat(p.precioUnitario || p.precio) || 0) * (parseInt(p.cantidad) || 0)).toLocaleString('es-CO')}`
      ]);
      
      // Añadir tabla con un ancho reducido
      this.createTable(doc, prodHeaders, prodRows, {
        width: doc.page.width - 200,
        startX: 70,
        fontSize: 9
      });
      
      // Total
      doc.font(this.styles.fonts.subtitle)
         .fontSize(12)
         .fillColor(this.styles.colors.accent)
         .text(`Total: $${(parseFloat(pedido.total) || 0).toLocaleString('es-CO')}`, { align: 'right' })
         .moveDown(1);
      
      // Separador entre ventas
      if (index < pedidos.length - 1) {
        doc.moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .strokeColor(this.styles.colors.secondary)
           .lineWidth(0.5)
           .dash(5, { space: 5 })
           .stroke()
           .moveDown(1);
        
        // Undash para futuros trazos
        doc.undash();
      }
    });
    
    // Añadir pie de página
    this.addFooter(doc);
    
    // Finalizar y enviar documento
    doc.pipe(res);
    doc.end();
  }

  /**
   * Genera factura PDF para una venta específica
   * @param {Object} pedido - Datos de la venta
   * @param {Response} res - Objeto de respuesta HTTP
   */
  generateSingleSalePDF(pedido, res) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Configurar respuesta HTTP
    res.setHeader('Content-Disposition', `attachment; filename="factura-${pedido._id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Preparar documento
    this.addHeader(doc, 'Factura de Venta');
    
    // Información de la factura
    const clienteNombre = pedido.cliente?.nombre || 'Cliente no disponible';
    const clienteDocumento = pedido.cliente?.numeroDocumento ? 
      `${pedido.cliente?.tipoDocumento || 'Doc.'} ${pedido.cliente?.numeroDocumento}` : 
      'Documento no disponible';
    
    // Información de la empresa (datos ficticios para el ejemplo)
    doc.font(this.styles.fonts.subtitle)
       .fontSize(12)
       .fillColor(this.styles.colors.primary)
       .text('TruchaShop S.A.S')
       .font(this.styles.fonts.body)
       .fontSize(10)
       .fillColor(this.styles.colors.secondary)
       .text('NIT: 900.123.456-7')
       .text('Dirección: Calle Principal #123')
       .text('Teléfono: (601) 123-4567')
       .text('Email: info@truchashop.com')
       .moveDown(1);
    
    // Información de la factura
    doc.font(this.styles.fonts.subtitle)
       .fontSize(14)
       .fillColor(this.styles.colors.primary)
       .text('Factura de Venta', { align: 'center' })
       .moveDown(0.5);
    
    // Recuadro con información de la factura
    const boxY = doc.y;
    doc.rect(50, boxY, doc.page.width - 100, 80)
       .fillColor(this.styles.colors.light)
       .fill();
    
    doc.font(this.styles.fonts.subtitle)
       .fontSize(10)
       .fillColor(this.styles.colors.secondary)
       .text('FACTURA N°:', 60, boxY + 10)
       .text('FECHA:', 60, boxY + 30)
       .text('MÉTODO DE PAGO:', 60, boxY + 50)
       .font(this.styles.fonts.body)
       .text(pedido._id, 150, boxY + 10)
       .text(new Date(pedido.fecha).toLocaleString('es-CO'), 150, boxY + 30)
       .text(pedido.metodoPago || 'No especificado', 150, boxY + 50);
    
    // Información del cliente
    doc.y = boxY + 100;
    doc.font(this.styles.fonts.subtitle)
       .fontSize(12)
       .fillColor(this.styles.colors.primary)
       .text('Cliente')
       .moveDown(0.5)
       .font(this.styles.fonts.body)
       .fontSize(10)
       .fillColor(this.styles.colors.secondary)
       .text(`Nombre: ${clienteNombre}`)
       .text(`Documento: ${clienteDocumento}`)
       .text(`Contacto: ${pedido.cliente?.numeroContacto || 'No disponible'}`)
       .moveDown(1);
    
    // Tabla de productos
    doc.font(this.styles.fonts.subtitle)
       .fontSize(12)
       .fillColor(this.styles.colors.primary)
       .text('Detalle de Productos')
       .moveDown(0.5);
    
    const headers = ['Producto', 'Precio Unitario', 'Cantidad', 'Subtotal'];
    const rows = pedido.productos.map(p => [
      p.nombre,
      `$${(parseFloat(p.precioUnitario || p.precio) || 0).toLocaleString('es-CO')}`,
      p.cantidad.toString(),
      `$${((parseFloat(p.precioUnitario || p.precio) || 0) * (parseInt(p.cantidad) || 0)).toLocaleString('es-CO')}`
    ]);
    
    this.createTable(doc, headers, rows);
    
    // Subtotal, impuestos y total
    const subtotal = pedido.productos.reduce(
      (sum, p) => sum + ((parseFloat(p.precioUnitario || p.precio) || 0) * (parseInt(p.cantidad) || 0)), 
      0
    );
    const impuestos = subtotal * 0.19; // Ejemplo: IVA 19%
    const total = parseFloat(pedido.total) || subtotal + impuestos;
    
    // Recuadro para totales
    doc.y += 20;
    const totalesY = doc.y;
    const totalesWidth = 200;
    const totalesX = doc.page.width - 50 - totalesWidth;
    
    doc.font(this.styles.fonts.subtitle)
       .fontSize(10)
       .fillColor(this.styles.colors.secondary)
       .text('Subtotal:', totalesX, totalesY)
       .text('IVA (19%):', totalesX, totalesY + 20)
       .text('TOTAL:', totalesX, totalesY + 40)
       .font(this.styles.fonts.body)
       .fillColor(this.styles.colors.text)
       .text(`$${subtotal.toLocaleString('es-CO')}`, totalesX + 100, totalesY, { align: 'right' })
       .text(`$${impuestos.toLocaleString('es-CO')}`, totalesX + 100, totalesY + 20, { align: 'right' })
       .font(this.styles.fonts.subtitle)
       .fillColor(this.styles.colors.accent)
       .text(`$${total.toLocaleString('es-CO')}`, totalesX + 100, totalesY + 40, { align: 'right' });
    
    // Términos y condiciones
    doc.y += 80;
    doc.font(this.styles.fonts.subtitle)
       .fontSize(10)
       .fillColor(this.styles.colors.primary)
       .text('Términos y Condiciones:')
       .moveDown(0.5)
       .font(this.styles.fonts.body)
       .fontSize(8)
       .fillColor(this.styles.colors.secondary)
       .text('1. Esta factura constituye título valor según la legislación colombiana.')
       .text('2. No se aceptan devoluciones después de 30 días de la compra.')
       .text('3. Garantía válida presentando esta factura.')
       .moveDown(1);
    
    // Firmas
    doc.y += 20;
    const firmaY = doc.y;
    
    doc.font(this.styles.fonts.body)
       .fontSize(10)
       .fillColor(this.styles.colors.secondary);
    
    // Línea para firma del vendedor
    doc.moveTo(100, firmaY + 20)
       .lineTo(250, firmaY + 20)
       .stroke();
    
    doc.text('Firma Autorizada', 100, firmaY + 25, { width: 150, align: 'center' });
    
    // Línea para firma del cliente
    doc.moveTo(350, firmaY + 20)
       .lineTo(500, firmaY + 20)
       .stroke();
    
    doc.text('Firma Cliente', 350, firmaY + 25, { width: 150, align: 'center' });
    
    // Añadir pie de página
    this.addFooter(doc);
    
    // Finalizar y enviar documento
    doc.pipe(res);
    doc.end();
  }
}

// Exportar funciones para mantener compatibilidad con el código existente
const pdfService = new PDFGeneratorService();

exports.generateProductsPDF = (productos, res) => {
  pdfService.generateProductsPDF(productos, res);
};

exports.generateSalesPDF = (pedidos, res, filtros) => {
  pdfService.generateSalesPDF(pedidos, res, filtros);
};

exports.generateSingleSalePDF = (pedido, res) => {
  pdfService.generateSingleSalePDF(pedido, res);
};

// También exportamos el servicio completo para usarlo directamente
exports.pdfService = pdfService;