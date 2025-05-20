// Función principal que encapsula todo el código
(function initVentasPanel() {
    // Elementos del DOM
    const DOM = {
        sidebar: document.getElementById('sidebar'),
        burgerIcon: document.getElementById('burgerIcon'),
        btnRefrescar: document.getElementById('btnRefrescar'),
        btnGenerarInforme: document.getElementById('btnGenerarInforme'),
        btnFiltrar: document.getElementById('btnFiltrar'),
        fechaInicio: document.getElementById('fechaInicio'),
        fechaFin: document.getElementById('fechaFin'),
        modalDetalles: document.getElementById('modalDetalles'),
        btnGenerarPdfIndividual: document.getElementById('btnGenerarPdfIndividual'),
        detallesVenta: document.getElementById('detallesVenta'),
        totalVentas: document.getElementById('totalVentas'),
        totalProductos: document.getElementById('totalProductos'),
        totalClientes: document.getElementById('totalClientes')
    };

    // Obtener ventas desde el servidor (pasadas en el script del EJS)
    const ventas = window.ventasDesdeServidor || [];
    let ventaSeleccionada = null;

    // Inicialización
    function initialize() {
        setupEventListeners();
        setupDates();
        updateSummary(ventas);
        setupDynamicEventListeners();
    }

    // Configurar listeners de eventos
    function setupEventListeners() {
        // Menú hamburguesa
        DOM.burgerIcon?.addEventListener('click', toggleSidebar);
        
        // Botón refrescar
        DOM.btnRefrescar?.addEventListener('click', refreshPage);
        
        // Botón filtrar
        DOM.btnFiltrar?.addEventListener('click', filterByDate);
        
        // Botón generar informe PDF
        DOM.btnGenerarInforme?.addEventListener('click', generatePdfReport);
        
        // Cerrar modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => DOM.modalDetalles.style.display = 'none');
        });
        
        // Cerrar modal haciendo clic fuera
        window.addEventListener('click', (event) => {
            if (event.target === DOM.modalDetalles) {
                DOM.modalDetalles.style.display = 'none';
            }
        });
    }

    // Configurar listeners dinámicos (para elementos que pueden ser añadidos después)
    function setupDynamicEventListeners() {
        // Delegación de eventos para botones de detalles
        document.addEventListener('click', function(e) {
            // Botones de detalles
            if (e.target.closest('.btn-detalles')) {
                const btn = e.target.closest('.btn-detalles');
                const ventaId = btn.getAttribute('data-id');
                loadSaleDetails(ventaId);
                DOM.modalDetalles.style.display = 'block';
            }
            
            // Botones PDF individuales en la tabla
            if (e.target.closest('.btn-pdf-small')) {
                const btn = e.target.closest('.btn-pdf-small');
                const ventaId = btn.getAttribute('data-id');
                e.stopPropagation();
                generateSinglePdf(ventaId);
            }
            
            // Botones eliminar
            if (e.target.closest('.btn-eliminar')) {
                const btn = e.target.closest('.btn-eliminar');
                const ventaId = btn.getAttribute('data-id');
                e.stopPropagation();
                confirmDeleteSale(ventaId);
            }
        });
        
        // Botón PDF en modal
        DOM.btnGenerarPdfIndividual?.addEventListener('click', () => {
            if (ventaSeleccionada) {
                generateSinglePdf(ventaSeleccionada.id || ventaSeleccionada._id);
            }
        });
    }

    // Configurar fechas iniciales
    function setupDates() {
        const hoy = new Date().toISOString().split('T')[0];
        if (DOM.fechaInicio) DOM.fechaInicio.value = hoy;
        if (DOM.fechaFin) DOM.fechaFin.value = hoy;
    }

    // Funciones de interacción
    function toggleSidebar() {
        DOM.sidebar.classList.toggle('active');
    }

    function refreshPage() {
        window.location.reload();
    }

    function filterByDate() {
        if (DOM.fechaInicio.value && DOM.fechaFin.value) {
            window.location.href = `/ventas?inicio=${DOM.fechaInicio.value}&fin=${DOM.fechaFin.value}`;
        } else {
            showError('Debes seleccionar ambas fechas');
        }
    }

    function generatePdfReport() {
        showConfirmation(
            'Generar Informe PDF',
            '¿Deseas generar un informe profesional con todas las ventas?',
            () => {
                const inicio = DOM.fechaInicio.value || '';
                const fin = DOM.fechaFin.value || '';
                window.open(`/ventas/informe/pdf?inicio=${inicio}&fin=${fin}`, '_blank');
            }
        );
    }

    function generateSinglePdf(ventaId) {
        showConfirmation(
            'Generar Factura PDF',
            '¿Deseas generar la factura en formato PDF?',
            () => window.open(`/ventas/pdf/${ventaId}`, '_blank')
        );
    }

    function confirmDeleteSale(ventaId) {
        showConfirmation(
            'Eliminar Venta',
            '¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.',
            () => deleteSale(ventaId)
        );
    }

    function deleteSale(ventaId) {
        fetch(`/ventas/eliminar/${ventaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess('Venta eliminada correctamente');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                throw new Error(data.message || 'Error al eliminar la venta');
            }
        })
        .catch(error => {
            showError(error.message);
        });
    }

    // Funciones de actualización de UI
    function updateSummary(ventas) {
        if (!DOM.totalVentas || !DOM.totalProductos || !DOM.totalClientes) return;
        
        const totalVentas = ventas.reduce((sum, venta) => sum + (parseFloat(venta.total) || 0, 0));
        const totalProductos = ventas.reduce((sum, venta) => {
            return sum + venta.productos.reduce((sumP, p) => sumP + (parseInt(p.cantidad) || 0, 0));
        }, 0);

        const clientesUnicos = new Set();
        ventas.forEach(venta => {
            if (venta.cliente) {
                const clienteId = venta.cliente.id || venta.cliente._id;
                if (clienteId) clientesUnicos.add(clienteId);
            }
        });

        DOM.totalVentas.textContent = `$${totalVentas.toLocaleString('es-CO')}`;
        DOM.totalProductos.textContent = totalProductos.toLocaleString('es-CO');
        DOM.totalClientes.textContent = clientesUnicos.size.toLocaleString('es-CO');
    }

    function loadSaleDetails(ventaId) {
        DOM.detallesVenta.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i> Cargando detalles...
            </div>
        `;

        fetch(`/ventas/detalle/${ventaId}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener los detalles');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    ventaSeleccionada = data.venta;
                    renderSaleDetails(ventaSeleccionada);
                } else {
                    throw new Error(data.message || 'Error en la respuesta');
                }
            })
            .catch(error => {
                DOM.detallesVenta.innerHTML = `
                    <div class="error-detalle">
                        <p><i class="fas fa-exclamation-circle"></i> ${error.message}</p>
                    </div>
                `;
            });
    }

    function renderSaleDetails(venta) {
        const ventaId = venta.id || venta._id;
        const cliente = venta.cliente || {
            nombre: 'Cliente no disponible',
            tipoDocumento: 'N/A',
            numeroDocumento: 'N/A',
            numeroContacto: 'N/A'
        };

        const productosHTML = venta.productos.map(p => `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.cantidad}</td>
                <td>$${(parseFloat(p.precioUnitario) || 0).toLocaleString('es-CO')}</td>
                <td>$${((parseFloat(p.precioUnitario) || 0) * (parseInt(p.cantidad) || 0)).toLocaleString('es-CO')}</td>
            </tr>
        `).join('');

        DOM.detallesVenta.innerHTML = `
            <div class="detalle-venta">
                <div class="encabezado-venta">
                    <div>
                        <h4>Venta #${ventaId}</h4>
                        <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString()}</p>
                    </div>
                    <div>
                        <p><strong>Estado:</strong> <span class="estado-badge completada">Completada</span></p>
                        <p><strong>Método de pago:</strong> ${venta.metodoPago || 'No especificado'}</p>
                    </div>
                </div>

                <div class="info-cliente">
                    <h5>Información del Cliente:</h5>
                    <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                    <p><strong>Documento:</strong> ${cliente.tipoDocumento} ${cliente.numeroDocumento}</p>
                    <p><strong>Contacto:</strong> ${cliente.numeroContacto}</p>
                </div>

                <h5>Productos:</h5>
                <table class="detalle-productos">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosHTML}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-right"><strong>Total:</strong></td>
                            <td><strong>$${(parseFloat(venta.total) || 0).toLocaleString('es-CO')}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    // Funciones de utilidad
    function showError(message) {
        Swal.fire('Error', message, 'error');
    }

    function showSuccess(message) {
        Swal.fire('Éxito', message, 'success');
    }

    function showConfirmation(title, text, callback) {
        Swal.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#7f8c8d',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                callback();
            }
        });
    }

    // Inicializar la aplicación
    document.addEventListener('DOMContentLoaded', initialize);
})();