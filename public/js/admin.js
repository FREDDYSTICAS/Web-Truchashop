document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const elements = {
        modals: {
            agregar: document.getElementById('modalAgregarProducto'),
            editar: document.getElementById('modalEditarProducto'),
            eliminar: document.getElementById('modalConfirmarEliminar')
        },
        forms: {
            agregar: document.getElementById('formAgregarProducto'),
            editar: document.getElementById('formEditarProducto'),
            eliminar: document.getElementById('formEliminarProducto')
        },
        buttons: {
            agregar: document.getElementById('btnAgregarProducto'),
            cancelar: {
                agregar: document.getElementById('btnCancelarAgregar'),
                editar: document.getElementById('btnCancelarEditar'),
                eliminar: document.getElementById('btnCancelarEliminar')
            },
            acciones: {
                editar: document.querySelectorAll('.btn-editar'),
                eliminar: document.querySelectorAll('.btn-eliminar'),
                aplicarIVA: document.getElementById('btnAplicarIVA'),
                generarPDF: document.getElementById('btnGenerarPDF')
            }
        },
        cerrarModales: document.querySelectorAll('.close-modal')
    };

    // Validación de elementos críticos
    if (!validateElements(elements)) {
        console.error("❌ Elementos críticos no encontrados en el DOM");
        return;
    }

    // Manejadores de eventos
    setupEventListeners(elements);

    // Funciones auxiliares
    function validateElements(elements) {
        return elements.modals.agregar && elements.modals.editar && elements.modals.eliminar &&
               elements.forms.agregar && elements.forms.editar && elements.forms.eliminar &&
               elements.buttons.agregar;
    }

    function setupEventListeners(elements) {
        // Abrir modales
        elements.buttons.agregar.addEventListener('click', () => showModal(elements.modals.agregar));
        
        // Cerrar modales
        elements.cerrarModales.forEach(btn => {
            btn.addEventListener('click', () => closeAllModals(elements.modals));
        });
        
        // Cerrar al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (event.target === elements.modals.agregar) elements.modals.agregar.style.display = 'none';
            if (event.target === elements.modals.editar) elements.modals.editar.style.display = 'none';
            if (event.target === elements.modals.eliminar) elements.modals.eliminar.style.display = 'none';
        });
        
        // Botones cancelar
        elements.buttons.cancelar.agregar.addEventListener('click', () => {
            closeModal(elements.modals.agregar);
            elements.forms.agregar.reset();
        });
        
        elements.buttons.cancelar.editar.addEventListener('click', () => closeModal(elements.modals.editar));
        elements.buttons.cancelar.eliminar.addEventListener('click', () => closeModal(elements.modals.eliminar));
        
        // Botones editar
        elements.buttons.acciones.editar.forEach(btn => {
            btn.addEventListener('click', () => {
                const productoData = getProductData(btn);
                fillEditForm(elements.forms.editar, productoData);
                elements.forms.editar.action = `/productos/editar/${productoData.id}`;
                showModal(elements.modals.editar);
            });
        });
        
        // Botones eliminar
        elements.buttons.acciones.eliminar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                document.getElementById('deleteId').value = id;
                elements.forms.eliminar.action = `/productos/eliminar/${id}`;
                showModal(elements.modals.eliminar);
            });
        });
        
        // Formularios
        elements.forms.agregar.addEventListener('submit', (e) => handleFormSubmit(e, elements.forms.agregar, 'agregado'));
        elements.forms.editar.addEventListener('submit', (e) => handleFormSubmit(e, elements.forms.editar, 'actualizado'));
        elements.forms.eliminar.addEventListener('submit', (e) => handleFormSubmit(e, elements.forms.eliminar, 'eliminado'));
        
        // Botones adicionales
        if (elements.buttons.acciones.aplicarIVA) {
            elements.buttons.acciones.aplicarIVA.addEventListener('click', handleAplicarIVA);
        }
        
        if (elements.buttons.acciones.generarPDF) {
            elements.buttons.acciones.generarPDF.addEventListener('click', () => {
                window.location.href = '/productos/pdf-con-iva';
            });
        }
    }

    function getProductData(button) {
        return {
            id: button.getAttribute('data-id'),
            nombre: button.getAttribute('data-nombre'),
            precio: button.getAttribute('data-precio'),
            peso: button.getAttribute('data-peso'),
            imagen: button.getAttribute('data-imagen'),
            stock: button.getAttribute('data-stock')
        };
    }

    function fillEditForm(form, data) {
        document.getElementById('editId').value = data.id;
        document.getElementById('editNombre').value = data.nombre;
        document.getElementById('editPrecio').value = data.precio;
        document.getElementById('editPeso').value = data.peso;
        document.getElementById('editImagen').value = data.imagen;
        document.getElementById('editstock').value = data.stock;
    }

    async function handleFormSubmit(event, form, action) {
        event.preventDefault();
        
        try {
            const url = form.action;
            const method = 'POST';
            let body;
            
            if (action === 'eliminado') {
                body = new URLSearchParams(new FormData(form));
            } else {
                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => {
                    if (key !== 'id') data[key] = value;
                });
                body = JSON.stringify(data);
            }
            
            const response = await fetch(url, {
                method,
                headers: action === 'eliminado' ? {} : { 'Content-Type': 'application/json' },
                body
            });
            
            if (!response.ok) {
                throw new Error(`Error al ${action} el producto`);
            }
            
            await showSuccessAlert(action);
            window.location.reload();
        } catch (error) {
            showErrorAlert(error.message);
        }
    }

    function showSuccessAlert(action) {
        return Swal.fire({
            title: '¡Éxito!',
            text: `Producto ${action} correctamente`,
            icon: 'success',
            confirmButtonColor: '#3498db'
        });
    }

    function showErrorAlert(message) {
        return Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#3498db'
        });
    }

    function handleAplicarIVA() {
        Swal.fire({
            title: '¿Está seguro?',
            text: "Esto aplicará el IVA (19%) a todos los productos",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aplicar IVA',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('/api/aplicar-iva', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Error al aplicar IVA');
                    }
                    
                    await Swal.fire('¡Éxito!', 'IVA aplicado correctamente', 'success');
                    window.location.reload();
                } catch (error) {
                    Swal.fire('Error', error.message, 'error');
                }
            }
        });
    }

    function showModal(modal) {
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    function closeAllModals(modals) {
        for (const key in modals) {
            if (modals[key]) {
                modals[key].style.display = 'none';
            }
        }
    }
});