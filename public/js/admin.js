document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const modalAgregar = document.getElementById('modalAgregarProducto');
    const modalEditar = document.getElementById('modalEditarProducto');
    const modalEliminar = document.getElementById('modalConfirmarEliminar');
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');
    const formAgregarProducto = document.getElementById('formAgregarProducto');
    const formEditarProducto = document.getElementById('formEditarProducto');
    const formEliminarProducto = document.getElementById('formEliminarProducto');
    const btnCancelarAgregar = document.getElementById('btnCancelarAgregar');
    const btnCancelarEditar = document.getElementById('btnCancelarEditar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const botonesEditar = document.querySelectorAll('.btn-editar');
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    const cerrarModales = document.querySelectorAll('.close-modal');

    // Abrir modal de agregar producto
    btnAgregarProducto.addEventListener('click', function() {
        modalAgregar.style.display = 'block';
    });

    // Cerrar modales al hacer clic en la X
    cerrarModales.forEach(function(boton) {
        boton.addEventListener('click', function() {
            modalAgregar.style.display = 'none';
            modalEditar.style.display = 'none';
            modalEliminar.style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', function(event) {
        if (event.target === modalAgregar) {
            modalAgregar.style.display = 'none';
        }
        if (event.target === modalEditar) {
            modalEditar.style.display = 'none';
        }
        if (event.target === modalEliminar) {
            modalEliminar.style.display = 'none';
        }
    });

    // Cancelar agregar producto
    btnCancelarAgregar.addEventListener('click', function() {
        modalAgregar.style.display = 'none';
        formAgregarProducto.reset();
    });

    // Cancelar editar producto
    btnCancelarEditar.addEventListener('click', function() {
        modalEditar.style.display = 'none';
    });

    // Cancelar eliminar producto
    btnCancelarEliminar.addEventListener('click', function() {
        modalEliminar.style.display = 'none';
    });

    // Abrir modal de editar producto
    botonesEditar.forEach(function(boton) {
        boton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const nombre = this.getAttribute('data-nombre');
            const precio = this.getAttribute('data-precio');
            const peso = this.getAttribute('data-peso');
            const imagen = this.getAttribute('data-imagen');
            
            document.getElementById('editId').value = id;
            document.getElementById('editNombre').value = nombre;
            document.getElementById('editPrecio').value = precio;
            document.getElementById('editPeso').value = peso;
            document.getElementById('editImagen').value = imagen;
            
            formEditarProducto.action = `/productos/editar/${id}`;
            modalEditar.style.display = 'block';
        });
    });

    // Abrir modal de confirmar eliminación
    botonesEliminar.forEach(function(boton) {
        boton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            document.getElementById('deleteId').value = id;
            formEliminarProducto.action = `/productos/eliminar/${id}`;
            modalEliminar.style.display = 'block';
        });
    });

    // Enviar formulario de agregar producto con SweetAlert
    formAgregarProducto.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        fetch('/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Producto agregado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#3498db'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                throw new Error('Error al agregar el producto');
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#3498db'
            });
        });
    });

    // Enviar formulario de editar producto con SweetAlert
    formEditarProducto.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const id = document.getElementById('editId').value;
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            if (key !== 'id') {
                data[key] = value;
            }
        });
        
        fetch(`/productos/editar/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Producto actualizado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#3498db'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                throw new Error('Error al actualizar el producto');
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#3498db'
            });
        });
    });

    // Enviar formulario de eliminar producto con SweetAlert
    formEliminarProducto.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const id = document.getElementById('deleteId').value;
        
        fetch(`/productos/eliminar/${id}`, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Producto eliminado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#3498db'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                throw new Error('Error al eliminar el producto');
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#3498db'
            });
        });
    });
});
// Añadir este código al final del archivo js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    const btnGenerarPDF = document.getElementById('btnGenerarPDF');

    if (!btnAplicarIVA || !btnGenerarPDF) {
        console.error("❌ No se encontraron los botones en el DOM");
        return;
    }

    btnAplicarIVA.addEventListener('click', function() {
        Swal.fire({
            title: '¿Está seguro?',
            text: "Esto aplicará el IVA (19%) a todos los productos",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aplicar IVA',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/aplicar-iva', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire('¡Éxito!', 'IVA aplicado correctamente', 'success')
                                .then(() => window.location.reload());
                        } else {
                            throw new Error(data.message);
                        }
                    })
                    .catch(error => {
                        Swal.fire('Error', error.message, 'error');
                    });
            }
        });
    });

    btnGenerarPDF.addEventListener('click', function() {
        window.location.href = '/productos/pdf-con-iva';
    });
});
