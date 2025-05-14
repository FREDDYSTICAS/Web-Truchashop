const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');
const Venta = require('../models/venta');

// Crear un nuevo pedido
exports.crearPedido = async (req, res) => {
  try {
    const { 
      nombre, 
      email, 
      telefono, 
      direccion, 
      ciudad, 
      metodoPago, 
      productos,
      clienteId,
      quieroRegistrarme
    } = req.body;
    
    const total = productos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const pedidoData = {
      nombre,
      email,
      telefono,
      direccion,
      ciudad,
      metodoPago,
      productos,
      total,
      estado: 'pendiente'
    };
    
    if (clienteId) {
      const clienteExistente = await Cliente.findById(clienteId);
      if (clienteExistente) {
        pedidoData.cliente = clienteId;
      }
    } else {
      const clienteExistente = await Cliente.findOne({ email });
      if (clienteExistente) {
        pedidoData.cliente = clienteExistente._id;
      }
    }
    
    const nuevoPedido = new Pedido(pedidoData);
    await nuevoPedido.save();
    
    const debeRegistrarse = quieroRegistrarme && !pedidoData.cliente;
    
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: nuevoPedido,
      debeRegistrarse: debeRegistrarse
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pedido',
      error: error.message
    });
  }
};

// Obtener todos los pedidos
exports.obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('cliente', 'nombre email');
    res.status(200).json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

// Obtener un pedido específico
exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate('cliente', 'nombre email');
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      pedido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pedido',
      error: error.message
    });
  }
};

// Actualizar el estado de un pedido
exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado } = req.body;
    
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    );
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: pedido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del pedido',
      error: error.message
    });
  }
};

// Obtener pedidos de un cliente específico
exports.obtenerPedidosCliente = async (req, res) => {
  try {
    const clienteId = req.params.clienteId;
    const pedidos = await Pedido.find({ cliente: clienteId });
    
    res.status(200).json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pedidos del cliente',
      error: error.message
    });
  }
};

// Enviar pedido (marcar como enviado y copiar a ventas sin eliminar)
exports.enviarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Copiar a la colección ventas
    const venta = new Venta({
      nombre: pedido.nombre,
      email: pedido.email,
      telefono: pedido.telefono,
      direccion: pedido.direccion,
      ciudad: pedido.ciudad,
      metodoPago: pedido.metodoPago,
      productos: pedido.productos,
      total: pedido.total,
      estado: 'enviado',
      cliente: pedido.cliente
    });

    await venta.save();

    // Actualizar estado del pedido
    pedido.estado = 'enviado';
    await pedido.save();

    res.status(200).json({
      success: true,
      message: 'Pedido marcado como enviado y guardado en ventas',
      data: venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar el pedido',
      error: error.message
    });
  }
};

// Eliminar un pedido por ID
exports.eliminarPedido = async (req, res) => {
  try {
    // Verificar si el ID llega correctamente desde la ruta
    console.log('ID recibido para eliminar:', req.params.id);

    const pedido = await Pedido.findByIdAndDelete(req.params.id);

    if (!pedido) {
      console.warn('Pedido no encontrado en la base de datos con ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    console.log('Pedido eliminado correctamente:', pedido._id);

    res.status(200).json({
      success: true,
      message: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarPedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el pedido',
      error: error.message
    });
  }
};

// Agrega esta función al final de tu controlador
exports.obtenerPedidoParaPDF = async (pedidoId) => {
  try {
      const pedido = await Pedido.findById(pedidoId)
          .populate('cliente')
          .populate('productos.producto');
      
      if (!pedido) {
          throw new Error('Pedido no encontrado');
      }
      
      return pedido;
  } catch (error) {
      console.error('Error al obtener pedido para PDF:', error);
      throw error;
  }
};

