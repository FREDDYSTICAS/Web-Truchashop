document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const clientesTableBody = document.getElementById('clientesTableBody');
    const btnAgregarCliente = document.getElementById('btnAgregarCliente');
    const modalCliente = document.getElementById('modalCliente');
    const modalClienteTitle = document.getElementById('modalClienteTitle');
    const formCliente = document.getElementById('formCliente');
    const modalConfirmarEliminar = document.getElementById('modalConfirmarEliminarCliente');
    let clienteAEliminar = null;
    
    // Cargar clientes al iniciar
    cargarClientes();
    
    // Evento para abrir modal de agregar cliente
    btnAgregarCliente.addEventListener('click', function() {
        formCliente.reset();
        document.getElementById('clienteId').value = '';
        modalClienteTitle.textContent = 'Agregar Nuevo Cliente';
        abrirModal(modalCliente);
    });
    
    // Evento para enviar formulario de cliente - ACTUALIZADO
    formCliente.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const clienteData = {
            tipoDocumento: document.getElementById('modalTipoDocumento').value,
            numeroDocumento: document.getElementById('modalNumeroDocumento').value,
            nombreCompleto: document.getElementById('modalNombreCompleto').value,
            numeroContacto: document.getElementById('modalNumeroContacto').value,
            correoElectronico: document.getElementById('modalCorreoElectronico').value,
            newsletter: document.getElementById('modalNewsletter').checked
        };

        const clienteId = document.getElementById('clienteId').value;
        const isUpdate = clienteId !== '';
        const url = isUpdate ? `/api/clientes/${clienteId}` : '/api/clientes';
        const method = isUpdate ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData)
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: isUpdate ? 'Cliente actualizado' : 'Cliente creado',
                text: `El cliente ha sido ${isUpdate ? 'actualizado' : 'registrado'} correctamente`
            });
            cerrarModal(modalCliente);
            cargarClientes();
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al procesar la solicitud'
            });
        });
    });
    
    // Función para cargar clientes desde la API - ACTUALIZADA
    function cargarClientes() {
        fetch('/api/clientes')
            .then(response => response.json())
            .then(clientes => {
                if (clientes.length === 0) {
                    clientesTableBody.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center">No hay clientes registrados</td>
                        </tr>
                    `;
                    return;
                }
                
                let html = '';
                clientes.forEach(cliente => {
                    html += `
                        <tr>
                            <td>${cliente._id}</td>
                            <td>${cliente.tipoDocumento || '-'}</td>
                            <td>${cliente.numeroDocumento || '-'}</td>
                            <td>${cliente.nombreCompleto || '-'}</td>
                            <td>${cliente.numeroContacto || '-'}</td>
                            <td>${cliente.correoElectronico || '-'}</td>
                            <td>${cliente.newsletter ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}</td>
                            <td class="acciones">
                                <button class="btn-editar" data-id="${cliente._id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-eliminar" data-id="${cliente._id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                clientesTableBody.innerHTML = html;
                
                // Agregar eventos a los botones de editar
                document.querySelectorAll('.btn-editar').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const clienteId = this.getAttribute('data-id');
                        editarCliente(clienteId);
                    });
                });
                
                // Agregar eventos a los botones de eliminar
                document.querySelectorAll('.btn-eliminar').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const clienteId = this.getAttribute('data-id');
                        confirmarEliminarCliente(clienteId);
                    });
                });
            })
            .catch(error => {
                console.error('Error:', error);
                clientesTableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">Error al cargar los clientes</td>
                    </tr>
                `;
            });
    }
    
    // Función para editar un cliente - ACTUALIZADA
    function editarCliente(clienteId) {
        fetch(`/api/clientes/${clienteId}`)
            .then(response => response.json())
            .then(cliente => {
                document.getElementById('clienteId').value = cliente._id;
                document.getElementById('modalTipoDocumento').value = cliente.tipoDocumento || '';
                document.getElementById('modalNumeroDocumento').value = cliente.numeroDocumento || '';
                document.getElementById('modalNombreCompleto').value = cliente.nombreCompleto || '';
                document.getElementById('modalNumeroContacto').value = cliente.numeroContacto || '';
                document.getElementById('modalCorreoElectronico').value = cliente.correoElectronico || '';
                document.getElementById('modalNewsletter').checked = cliente.newsletter || false;
                
                modalClienteTitle.textContent = 'Editar Cliente';
                abrirModal(modalCliente);
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar la información del cliente'
                });
            });
    }
    
    // Función para confirmar eliminación
    function confirmarEliminarCliente(clienteId) {
        clienteAEliminar = clienteId;
        abrirModal(modalConfirmarEliminar);
    }
    
    // Evento para confirmar eliminación
    document.getElementById('btnConfirmarEliminarCliente').addEventListener('click', function() {
        if (!clienteAEliminar) return;
        
        fetch(`/api/clientes/${clienteAEliminar}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Cliente eliminado',
                text: 'El cliente ha sido eliminado correctamente'
            });
            cerrarModal(modalConfirmarEliminar);
            cargarClientes();
            clienteAEliminar = null;
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al eliminar el cliente'
            });
        });
    });
    
    // Evento para cancelar eliminación
    document.getElementById('btnCancelarEliminarCliente').addEventListener('click', function() {
        clienteAEliminar = null;
        cerrarModal(modalConfirmarEliminar);
    });
    
    // Evento para cancelar formulario de cliente
    document.getElementById('btnCancelarCliente').addEventListener('click', function() {
        cerrarModal(modalCliente);
    });
    
    // Funciones auxiliares para manejar modales
    function abrirModal(modal) {
        modal.style.display = 'block';
    }
    
    function cerrarModal(modal) {
        modal.style.display = 'none';
    }
    
    // Cerrar modales al hacer clic en la X
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            cerrarModal(modal);
        });
    });
    
    // Cerrar modales al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            cerrarModal(event.target);
        }
    });
});
