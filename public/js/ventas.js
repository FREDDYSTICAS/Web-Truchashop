document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const sidebar = document.getElementById('sidebar');
    const burgerIcon = document.getElementById('burgerIcon');
    const btnRefrescar = document.getElementById('btnRefrescar');
    const btnGenerarInforme = document.getElementById('btnGenerarInforme');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');
    const btnsDetalles = document.querySelectorAll('.btn-detalles');
    const btnsPdfIndividual = document.querySelectorAll('.btn-pdf-small');
    const btnGenerarPdfIndividual = document.getElementById('btnGenerarPdfIndividual');
    const modalDetalles = document.getElementById('modalDetalles');
    const closeModal = document.querySelectorAll('.close-modal');

    // Obtener ventas desde el servidor (pasadas en el script del EJS)
    const ventas = window.ventasDesdeServidor || [];
    let ventaSeleccionada = null;

    // Inicializar fechas con la fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    fechaInicio.value = hoy;
    fechaFin.value = hoy;

    // Inicializar resumen de ventas
    actualizarResumen(ventas);

    // Toggle sidebar en móvil
    burgerIcon.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Refrescar la página
    btnRefrescar.addEventListener('click', () => {
        window.location.reload();
    });

    // Filtrar ventas por fecha
    btnFiltrar.addEventListener('click', () => {
        if (fechaInicio.value && fechaFin.value) {
            window.location.href = `/ventas?inicio=${fechaInicio.value}&fin=${fechaFin.value}`;
        } else {
            Swal.fire('Error', 'Debes seleccionar ambas fechas', 'error');
        }
    });

    // Generar informe PDF general
    btnGenerarInforme.addEventListener('click', () => {
        const inicio = fechaInicio.value || '';
        const fin = fechaFin.value || '';
        Swal.fire({
            title: 'Generar Informe PDF',
            text: '¿Deseas generar un informe profesional con todas las ventas?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#7f8c8d',
            confirmButtonText: 'Generar PDF',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                window.open(`/ventas/informe/pdf?inicio=${inicio}&fin=${fin}`, '_blank');
            }
        });
    });

    // Ver detalles de venta
    btnsDetalles.forEach(btn => {
        btn.addEventListener('click', function () {
            const ventaId = this.getAttribute('data-id');
            cargarDetallesVenta(ventaId);
            modalDetalles.style.display = 'block';
        });
    });

    // Generar PDF individual desde tabla
    btnsPdfIndividual.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const ventaId = this.getAttribute('data-id');
            generarPdfIndividual(ventaId);
        });
    });

    // Generar PDF desde modal
    btnGenerarPdfIndividual?.addEventListener('click', () => {
        if (ventaSeleccionada) {
            generarPdfIndividual(ventaSeleccionada.id || ventaSeleccionada._id);
        }
    });

    // Cerrar modal
    closeModal.forEach(btn => {
        btn.addEventListener('click', () => {
            modalDetalles.style.display = 'none';
        });
    });

    // Cerrar modal haciendo clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modalDetalles) {
            modalDetalles.style.display = 'none';
        }
    });

    // ---------------- Funciones ----------------

    function actualizarResumen(ventas) {
        const totalVentas = ventas.reduce((sum, venta) => sum + (parseFloat(venta.total) || 0), 0);
        const totalProductos = ventas.reduce((sum, venta) => {
            return sum + venta.productos.reduce((sumP, p) => sumP + (parseInt(p.cantidad) || 0), 0);
        }, 0);

        const clientesUnicos = new Set();
        ventas.forEach(venta => {
            if (venta.cliente) {
                const clienteId = venta.cliente.id || venta.cliente._id;
                if (clienteId) clientesUnicos.add(clienteId);
            }
        });

        document.getElementById('totalVentas').textContent = `$${totalVentas.toLocaleString('es-CO')}`;
        document.getElementById('totalProductos').textContent = totalProductos.toLocaleString('es-CO');
        document.getElementById('totalClientes').textContent = clientesUnicos.size.toLocaleString('es-CO');
    }

    function cargarDetallesVenta(ventaId) {
        document.getElementById('detallesVenta').innerHTML = `
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
                    renderizarDetallesVenta(ventaSeleccionada);
                } else {
                    throw new Error(data.message || 'Error en la respuesta');
                }
            })
            .catch(error => {
                document.getElementById('detallesVenta').innerHTML = `
                    <div class="error-detalle">
                        <p><i class="fas fa-exclamation-circle"></i> ${error.message}</p>
                    </div>
                `;
            });
    }

    function renderizarDetallesVenta(venta) {
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

        const detallesHTML = `
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

        document.getElementById('detallesVenta').innerHTML = detallesHTML;
    }

    function generarPdfIndividual(ventaId) {
        Swal.fire({
            title: 'Generar Factura PDF',
            text: '¿Deseas generar la factura en formato PDF?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#7f8c8d',
            confirmButtonText: 'Generar PDF',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.open(`/ventas/pdf/${ventaId}`, '_blank');
            }
        });
    }
});
