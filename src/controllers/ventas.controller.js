const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');
const { generateSalesPDF, generateSingleSalePDF } = require('../../utils/pdfGenerator');

// Mostrar todas las ventas en la vista
const obtenerVentas = async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('cliente').lean();
    const ventas = pedidos.map(pedido => ({
      id: pedido._id,
      fecha: pedido.fecha,
      cliente: pedido.cliente,
      productos: pedido.productos,
      total: pedido.total,
      metodoPago: pedido.metodoPago
    }));

    res.render('ventas', { ventas });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).send('Error al obtener ventas');
  }
};

// Obtener una venta específica (para el modal)
const obtenerVentaPorId = async (req, res) => {
  try {
    const id = req.params.id;
    const pedido = await Pedido.findById(id).populate('cliente');
    if (!pedido) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener venta por ID:', error);
    res.status(500).json({ mensaje: 'Error al obtener venta' });
  }
};

// PDF individual de una venta
const generarPdfVenta = async (req, res) => {
  try {
    const id = req.params.id;
    const pedido = await Pedido.findById(id).populate('cliente');
    if (!pedido) return res.status(404).send('Venta no encontrada');

    await generateSingleSalePDF(pedido, res);
  } catch (error) {
    console.error('Error al generar PDF de la venta:', error);
    res.status(500).send('Error al generar PDF');
  }
};

// PDF del informe general de ventas (filtro o todo)
const generarInformeVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let filtro = {};

    if (fechaInicio && fechaFin) {
      filtro.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin + 'T23:59:59')
      };
    }

    const pedidos = await Pedido.find(filtro).populate('cliente');
    await generateSalesPDF(pedidos, res);
  } catch (error) {
    console.error('Error al generar informe de ventas:', error);
    res.status(500).send('Error al generar informe');
  }
};

module.exports = {
  obtenerVentas,
  obtenerVentaPorId,
  generarPdfVenta,
  generarInformeVentas
};