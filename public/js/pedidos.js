document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const sidebar = document.getElementById('sidebar');
  const burgerIcon = document.getElementById('burgerIcon');
  const btnRefrescar = document.getElementById('btnRefrescar');
  const btnsEnviar = document.querySelectorAll('.btn-enviar');
  const btnsDetalles = document.querySelectorAll('.btn-detalles');
  const modalDetalles = document.getElementById('modalDetalles');
  const closeModal = document.querySelectorAll('.close-modal');

  // Toggle sidebar en móvil
  burgerIcon.addEventListener('click', function() {
      sidebar.classList.toggle('active');
  });

  // Refrescar la página
  btnRefrescar.addEventListener('click', function() {
      window.location.reload();
  });

  // Enviar pedido a ventas
  btnsEnviar.forEach(btn => {
      btn.addEventListener('click', function() {
          const pedidoId = this.getAttribute('data-id');

          Swal.fire({
              title: '¿Enviar este pedido?',
              text: "El pedido será marcado como enviado y movido a ventas",
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#3498db',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, enviar',
              cancelButtonText: 'Cancelar'
          }).then((result) => {
              if (result.isConfirmed) {
                  enviarPedido(pedidoId);
              }
          });
      });
  });

  // Ver detalles del pedido
  btnsDetalles.forEach(btn => {
      btn.addEventListener('click', function() {
          const pedidoId = this.getAttribute('data-id');
          cargarDetallesPedido(pedidoId);
          modalDetalles.style.display = 'block';
      });
  });

  // Cerrar modales
  closeModal.forEach(btn => {
      btn.addEventListener('click', function() {
          modalDetalles.style.display = 'none';
      });
  });

  // Cerrar al hacer clic fuera del modal
  window.addEventListener('click', function(event) {
      if (event.target === modalDetalles) {
          modalDetalles.style.display = 'none';
      }
  });

  // Función para enviar pedido
  function enviarPedido(pedidoId) {
      fetch(`/pedidos/${pedidoId}/enviar`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          }
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              Swal.fire(
                  '¡Enviado!',
                  'El pedido ha sido enviado a ventas correctamente.',
                  'success'
              ).then(() => {
                  window.location.reload();
              });
          } else {
              throw new Error(data.message || 'Error al enviar el pedido');
          }
      })
      .catch(error => {
          Swal.fire(
              'Error',
              error.message,
              'error'
          );
      });
  }

  // Función para cargar detalles del pedido
  function cargarDetallesPedido(pedidoId) {
      fetch(`/pedidos/${pedidoId}`)
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              const pedido = data.pedido; // <- Aquí usamos el nombre correcto
              const detallesHTML = `
                  <div class="detalle-pedido">
                      <h4>Pedido #${pedido._id}</h4>
                      <p><strong>Cliente:</strong> ${pedido.cliente?.nombre || 'Sin registrar'}</p>
                      <p><strong>Fecha:</strong> ${new Date(pedido.createdAt).toLocaleString()}</p>
                      <p><strong>Estado:</strong> <span class="estado-badge ${pedido.estado}">${pedido.estado}</span></p>
                      <p><strong>Total:</strong> $${pedido.total.toLocaleString('es-CO')}</p>

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
                              ${pedido.productos.map(producto => `
                                  <tr>
                                      <td>${producto.nombre}</td>
                                      <td>${producto.cantidad}</td>
                                      <td>$${producto.precio.toLocaleString('es-CO')}</td>
                                      <td>$${(producto.precio * producto.cantidad).toLocaleString('es-CO')}</td>
                                  </tr>
                              `).join('')}
                          </tbody>
                      </table>
                  </div>
              `;

              document.getElementById('detallesPedido').innerHTML = detallesHTML;
          } else {
              throw new Error(data.message || 'Error al cargar detalles');
          }
      })
      .catch(error => {
          document.getElementById('detallesPedido').innerHTML = `
              <div class="error-detalle">
                  <p>Error al cargar los detalles del pedido: ${error.message}</p>
              </div>
          `;
      });
  }
});

// aca agrego la funcion de eliminar pedidos

$(document).on('click', '.btn-eliminar', function () {
  const pedidoId = $(this).data('id');

  Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el pedido permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
  }).then((result) => {
      if (result.isConfirmed) {
          fetch(`/pedidos/${pedidoId}`, {
              method: 'DELETE'
          })
          .then(res => res.json())
          .then(data => {
              if (data.success) {
                  Swal.fire('Eliminado', 'El pedido ha sido eliminado', 'success').then(() => {
                      location.reload(); // refrescar la tabla
                  });
              } else {
                  Swal.fire('Error', data.message, 'error');
              }
          })
          .catch(err => {
              Swal.fire('Error', 'No se pudo eliminar el pedido', 'error');
              console.error(err);
          });
      }
  });
});

// Agrega estos selectores al inicio con los demás
const btnsPdf = document.querySelectorAll('.btn-pdf');
const btnGenerarInforme = document.getElementById('btnGenerarInforme');

// Agrega estos event listeners con los demás
btnsPdf.forEach(btn => {
    btn.addEventListener('click', function() {
        const pedidoData = this.getAttribute('data-pedido');
        generarPDFIndividual(JSON.parse(pedidoData));
    });
});

btnGenerarInforme.addEventListener('click', generarInformeGeneral);
// Función para generar PDF individual
function generarPDFIndividual(pedido) {
    fetch(`/pedidos/${pedido.id}/generar-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedido_${pedido.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo generar el PDF', 'error');
    });
}

// Función para generar informe general
function generarInformeGeneral() {
    fetch('/pedidos/generar-informe/general', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `informe_pedidos_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo generar el informe', 'error');
    });
}