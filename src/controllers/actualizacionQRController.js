// Asegúrate de que este archivo se guarde en:
// /src/controllers/actualizacionQRController.js

const Producto = require('../models/Producto');

// Controlador para mostrar la página de escaneo QR
exports.mostrarPaginaQR = (req, res) => {
    // Esta ruta debe coincidir con la estructura de carpetas que especificaste
    // Como tu carpeta views está un nivel arriba de src, usamos el path configurado en app.js
    res.render('actualizacionQR');
};

// Controlador para procesar la actualización del stock mediante QR
exports.actualizarStockPorQR = async (req, res) => {
    const { productoId } = req.body;
    
    if (!productoId) {
        return res.status(400).json({
            success: false,
            message: 'No se proporcionó el ID del producto'
        });
    }
    
    try {
        // Buscamos el producto por su ID
        const producto = await Producto.findById(productoId);
        
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Incrementamos el stock en 1
        producto.stock += 1;
        producto.fechaActualizacion = Date.now();
        
        // Guardamos los cambios
        await producto.save();
        
        return res.status(200).json({
            success: true,
            message: 'Stock actualizado correctamente',
            producto: {
                id: producto._id,
                nombre: producto.nombre,
                stockActual: producto.stock
            }
        });
        
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el stock del producto',
            error: error.message
        });
    }
};