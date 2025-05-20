document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const sidebar = document.getElementById('sidebar');
  const burgerIcon = document.getElementById('burgerIcon');
  const btnRefrescar = document.getElementById('btnRefrescar');
  const btnsEnviar = document.querySelectorAll('.btn-enviar');
  const btnsDetalles = document.querySelectorAll('.btn-detalles');
  const btnsEliminar = document.querySelectorAll('.btn-eliminar');
  const btnsPdf = document.querySelectorAll('.btn-pdf');
  const btnGenerarInforme = document.getElementById('btnGenerarInforme');
  const btnVerStock = document.getElementById('btnVerStock');
  const modalDetalles = document.getElementById('modalDetalles');
  const modalStock = document.getElementById('modalStock');
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
          enviarPedido(pedidoId);
      });
  });

  // Ver detalles del pedido
  btnsDetalles.forEach(btn => {
      btn.addEventListener('click', function() {
          const pedidoData = JSON.parse(this.getAttribute('data-pedido'));
          mostrarDetallesPedido(pedidoData);
          modalDetalles.style.display = 'block';
      });
  });

  // Eliminar pedido
  btnsEliminar.forEach(btn => {
      btn.addEventListener('click', function() {
          const pedidoId = this.getAttribute('data-id');
          eliminarPedido(pedidoId);
      });
  });

  // Generar PDF individual
  btnsPdf.forEach(btn => {
      btn.addEventListener('click', function() {
          const pedidoData = JSON.parse(this.getAttribute('data-pedido'));
          generarPDFIndividual(pedidoData);
      });
  });

  // Generar informe general
  btnGenerarInforme.addEventListener('click', generarInformeGeneral);

  // Ver stock de productos
  btnVerStock.addEventListener('click', function() {
      cargarStockProductos();
      modalStock.style.display = 'block';
  });

  // Cerrar modales
  closeModal.forEach(btn => {
      btn.addEventListener('click', function() {
          modalDetalles.style.display = 'none';
          modalStock.style.display = 'none';
      });
  });

  // Cerrar al hacer clic fuera del modal
  window.addEventListener('click', function(event) {
      if (event.target === modalDetalles) {
          modalDetalles.style.display = 'none';
      }
      if (event.target === modalStock) {
          modalStock.style.display = 'none';
      }
  });

  // Función para enviar pedido
  function enviarPedido(pedidoId) {
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
      });
  }

  // Función para mostrar detalles del pedido
  function mostrarDetallesPedido(pedido) {
      const detallesHTML = `
          <div class="detalle-pedido">
              <div class="detalle-seccion">
                  <h3>Información del Pedido</h3>
                  <p><strong>ID Pedido:</strong> ${pedido.id}</p>
                  <p><strong>Fecha:</strong> ${new Date(pedido.fechaCreacion).toLocaleString()}</p>
                  <p><strong>Estado:</strong> <span class="estado-badge ${pedido.estado}">${pedido.estado}</span></p>
              </div>

              <div class="detalle-seccion">
                  <h3>Información del Cliente</h3>
                  ${pedido.cliente && pedido.cliente.nombre ? `
                      <p><strong>Nombre:</strong> ${pedido.cliente.nombre}</p>
                      <p><strong>Email:</strong> ${pedido.cliente.email || 'No especificado'}</p>
                      <p><strong>Teléfono:</strong> ${pedido.cliente.telefono || 'No especificado'}</p>
                  ` : `
                      <p><strong>Nombre:</strong> ${pedido.nombre}</p>
                      <p><strong>Email:</strong> ${pedido.email}</p>
                  `}
              </div>

              <div class="detalle-seccion">
                  <h3>Productos</h3>
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
                      <tfoot>
                          <tr>
                              <td colspan="3" class="text-right"><strong>Total:</strong></td>
                              <td class="total-value">$${pedido.total.toLocaleString('es-CO')}</td>
                          </tr>
                      </tfoot>
                  </table>
              </div>
          </div>
      `;

      document.getElementById('detallesPedido').innerHTML = detallesHTML;
  }

  // Función para eliminar pedido
  function eliminarPedido(pedidoId) {
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
                          location.reload();
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
  }

// Función para generar PDF individual - VERSIÓN MEJORADA
  function generarPDFIndividual(pedido) {
      Swal.fire({
          title: 'Generando PDF',
          html: 'Por favor espere mientras se genera el documento...',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });

      // Preparamos los datos estructurados para el backend
      const datosPedido = {
          id: pedido.id || pedido._id,
          cliente: pedido.cliente || {
              nombre: pedido.nombre,
              email: pedido.email,
              telefono: pedido.telefono || 'No especificado'
          },
          productos: pedido.productos.map(p => ({
              nombre: p.nombre,
              cantidad: p.cantidad,
              precio: p.precio,
              subtotal: p.precio * p.cantidad
          })),
          total: pedido.total,
          fecha: pedido.fechaCreacion || pedido.createdAt || new Date().toISOString(),
          estado: pedido.estado,
          direccion: pedido.direccion || 'No especificada'
      };

      fetch(`/pedidos/${datosPedido.id}/generar-pdf`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosPedido)
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
      })
      .then(blob => {
          Swal.close();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pedido_${datosPedido.id}_${new Date(datosPedido.fecha).toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      })
      .catch(error => {
          Swal.fire({
              icon: 'error',
              title: 'Error al generar PDF',
              text: 'No se pudo generar el documento del pedido',
              footer: error.message
          });
          console.error('Error al generar PDF:', error);
      });
  }
 // Función para generar informe general - VERSIÓN MEJORADA
  function generarInformeGeneral() {
      Swal.fire({
          title: 'Generando Informe',
          html: 'Por favor espere mientras se genera el informe general...',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });

      // Formateamos la fecha más legible
      const ahora = new Date();
      const opcionesFecha = { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
      };
      const fechaLegible = ahora.toLocaleDateString('es-ES', opcionesFecha).replace(',', '');
      const fechaArchivo = ahora.toISOString().split('.')[0].replace(/[:T-]/g, '');

      fetch('/pedidos/generar-informe/general', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              fechaGeneracion: ahora.toISOString(),
              formatoFecha: 'DD/MM/YYYY HH:mm',
              titulo: `Informe de Pedidos - ${fechaLegible}`
          })
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Error en la generación del informe');
          }
          return response.blob();
      })
      .then(blob => {
          Swal.close();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `informe_pedidos_${fechaArchivo}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      })
      .catch(error => {
          Swal.fire({
              icon: 'error',
              title: 'Error al generar informe',
              text: 'No se pudo generar el informe general',
              footer: error.message
          });
          console.error('Error al generar informe:', error);
      });
  }

  // Función para cargar stock de productos
  function cargarStockProductos() {
      fetch('/productos/stock')
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  mostrarStockProductos(data.productos);
              } else {
                  throw new Error(data.message || 'Error al cargar el stock');
              }
          })
          .catch(error => {
              document.getElementById('stockContent').innerHTML = `
                  <div class="error-stock">
                      <p>Error al cargar el stock: ${error.message}</p>
                  </div>
              `;
          });
  }

  // Función para mostrar stock de productos
  function mostrarStockProductos(productos) {
      const stockHTML = `
          <div class="stock-container">
              <div class="stock-actions">
                  <button class="btn-refresh" id="btnRefrescarStock">
                      <i class="fas fa-sync-alt"></i> Actualizar
                  </button>
              </div>
              
              <table class="stock-table">
                  <thead>
                      <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Stock Actual</th>
                          <th>Stock Mínimo</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${productos.map(producto => {
                          let estadoClase = '';
                          let estadoTexto = 'Disponible';
                          
                          if (producto.stock <= 0) {
                              estadoClase = 'stock-critico';
                              estadoTexto = 'Agotado';
                          } else if (producto.stock <= producto.stockMinimo) {
                              estadoClase = 'stock-bajo';
                              estadoTexto = 'Bajo Stock';
                          }
                          
                          return `
                              <tr>
                                  <td>${producto.nombre}</td>
                                  <td>${producto.categoria || 'Sin categoría'}</td>
                                  <td>${producto.stock}</td>
                                  <td>${producto.stockMinimo}</td>
                                  <td class="${estadoClase}">${estadoTexto}</td>
                                  <td>
                                      <button class="btn-editar-stock" data-id="${producto._id}">
                                          <i class="fas fa-edit"></i> Editar
                                      </button>
                                  </td>
                              </tr>
                          `;
                      }).join('')}
                  </tbody>
              </table>
          </div>
      `;

      document.getElementById('stockContent').innerHTML = stockHTML;

      // Event listener para el botón de actualizar stock
      document.getElementById('btnRefrescarStock')?.addEventListener('click', cargarStockProductos);

      // Event listeners para los botones de editar stock
      document.querySelectorAll('.btn-editar-stock').forEach(btn => {
          btn.addEventListener('click', function() {
              const productoId = this.getAttribute('data-id');
              const producto = productos.find(p => p._id === productoId);
              editarStockProducto(producto);
          });
      });
  }

  // Función para editar stock de producto
  function editarStockProducto(producto) {
      Swal.fire({
          title: `Editar Stock: ${producto.nombre}`,
          html: `
              <div class="editar-stock-form">
                  <p><strong>Stock Actual:</strong> ${producto.stock}</p>
                  <p><strong>Stock Mínimo:</strong> ${producto.stockMinimo}</p>
                  <input type="number" id="nuevoStock" class="swal2-input" placeholder="Nuevo stock" value="${producto.stock}" min="0">
              </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Actualizar',
          cancelButtonText: 'Cancelar',
          preConfirm: () => {
              const nuevoStock = parseInt(document.getElementById('nuevoStock').value);
              if (isNaN(nuevoStock)) {
                  Swal.showValidationMessage('Por favor ingrese un número válido');
                  return false;
              }
              return { stock: nuevoStock };
          }
      }).then((result) => {
          if (result.isConfirmed) {
              actualizarStockProducto(producto._id, result.value.stock);
          }
      });
  }

  // Función para actualizar stock de producto
  function actualizarStockProducto(productoId, nuevoStock) {
      fetch(`/productos/${productoId}/stock`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stock: nuevoStock })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              Swal.fire('Actualizado', 'El stock ha sido actualizado correctamente', 'success').then(() => {
                  cargarStockProductos();
              });
          } else {
              throw new Error(data.message || 'Error al actualizar el stock');
          }
      })
      .catch(error => {
          Swal.fire('Error', error.message, 'error');
      });
  }
});

/////////////////////////////////////////////////////////////7777
