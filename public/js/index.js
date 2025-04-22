// Código para el carrito de compras de TruchaShop
document.addEventListener("DOMContentLoaded", function () {
    // Elementos del DOM
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const cartIcon = document.getElementById("cartIcon");
    const cartDropdown = document.getElementById("cartDropdown");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const generatePDFBtn = document.getElementById("generatePDF");

    // Verificar si hay un cliente logueado
    let clienteActual = JSON.parse(localStorage.getItem("clienteActual")) || null;
    
    // Cargar carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Manejar toggle del menú móvil
    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", function () {
            mainNav.classList.toggle("active");
        });
    }

    // Función para actualizar la interfaz del carrito
    function updateCartUI() {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = "";

            if (cart.length === 0) {
                const emptyMessage = document.createElement("li");
                emptyMessage.className = "empty-cart-message";
                emptyMessage.textContent = "Tu carrito está vacío";
                cartItemsContainer.appendChild(emptyMessage);
                checkoutBtn && (checkoutBtn.disabled = true);
                generatePDFBtn && (generatePDFBtn.disabled = true);
            } else {
                let total = 0;
                cart.forEach((item, index) => {
                    const li = document.createElement("li");
                    li.className = "cart-item";

                    const productInfo = document.createElement("div");
                    productInfo.className = "product-info";

                    const productName = document.createElement("span");
                    productName.className = "product-name";
                    productName.textContent = item.name;

                    const productPrice = document.createElement("span");
                    productPrice.className = "product-price";
                    productPrice.textContent = `$${(item.price * item.quantity).toLocaleString()}`;

                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;

                    productInfo.appendChild(productName);
                    productInfo.appendChild(productPrice);

                    const quantityControl = document.createElement("div");
                    quantityControl.className = "quantity-control";

                    const decreaseBtn = document.createElement("button");
                    decreaseBtn.textContent = "-";
                    decreaseBtn.className = "quantity-btn decrease";
                    decreaseBtn.setAttribute("data-index", index);

                    const quantityDisplay = document.createElement("span");
                    quantityDisplay.className = "quantity";
                    quantityDisplay.textContent = item.quantity;

                    const increaseBtn = document.createElement("button");
                    increaseBtn.textContent = "+";
                    increaseBtn.className = "quantity-btn increase";
                    increaseBtn.setAttribute("data-index", index);

                    const removeBtn = document.createElement("button");
                    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    removeBtn.className = "remove-item";
                    removeBtn.setAttribute("data-index", index);

                    quantityControl.appendChild(decreaseBtn);
                    quantityControl.appendChild(quantityDisplay);
                    quantityControl.appendChild(increaseBtn);
                    quantityControl.appendChild(removeBtn);

                    li.appendChild(productInfo);
                    li.appendChild(quantityControl);

                    cartItemsContainer.appendChild(li);
                });

                const totalElement = document.createElement("li");
                totalElement.className = "cart-total";
                totalElement.innerHTML = `<strong>Total:</strong> <span>$${total.toLocaleString()}</span>`;
                cartItemsContainer.appendChild(totalElement);

                checkoutBtn && (checkoutBtn.disabled = false);
                generatePDFBtn && (generatePDFBtn.disabled = false);
            }
        }

        if (cartCount) {
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = itemCount;
            cartCount.style.display = itemCount === 0 ? "none" : "block";
        }

        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Función para añadir productos al carrito
    function addToCart(product) {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        
        // Mostrar animación en contador del carrito
        if (cartCount) {
            cartCount.classList.add('update');
            setTimeout(() => cartCount.classList.remove('update'), 500);
        }
        
        Swal.fire({
            icon: "success",
            title: "Producto agregado",
            text: `${product.name} ha sido añadido al carrito`,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500
        });
    }

    // Funciones para manejar la cantidad
    function increaseQuantity(index) {
        if (index >= 0 && index < cart.length) {
            cart[index].quantity += 1;
            updateCartUI();
        }
    }

    function decreaseQuantity(index) {
        if (index >= 0 && index < cart.length) {
            cart[index].quantity > 1 ? cart[index].quantity-- : removeFromCart(index);
            updateCartUI();
        }
    }

    // Función para eliminar productos del carrito
    function removeFromCart(index) {
        const removedItem = cart[index];
        Swal.fire({
            title: `¿Eliminar ${removedItem.name}?`,
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3498db",
            cancelButtonColor: "#e74c3c",
            confirmButtonText: "Sí, eliminar"
        }).then(result => {
            if (result.isConfirmed) {
                cart.splice(index, 1);
                updateCartUI();
                Swal.fire({
                    icon: "success",
                    title: "Eliminado",
                    text: "El producto ha sido eliminado del carrito",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    }

    // Agregar eventos a los botones "Añadir al carrito"
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            const productCard = this.closest(".product-card");
            const productName = productCard.querySelector("h3").textContent;
            const productPriceText = productCard.querySelector(".product-price").textContent;
            const productPrice = parseFloat(productPriceText.replace(/[^0-9]/g, ''));
            const productImage = productCard.querySelector(".product-image").src;
            const productId = 'product-' + Date.now();
            addToCart({ id: productId, name: productName, price: productPrice, image: productImage });
        });
    });

    // Manejo de eventos en los items del carrito
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", function (e) {
            const index = parseInt(e.target.getAttribute("data-index") || e.target.parentElement.getAttribute("data-index"));
            if (e.target.classList.contains("increase")) increaseQuantity(index);
            else if (e.target.classList.contains("decrease")) decreaseQuantity(index);
            else if (e.target.closest(".remove-item")) removeFromCart(index);
        });
    }

    // Toggle de visibilidad del carrito
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            cartDropdown.classList.toggle("show");
        });

        document.addEventListener("click", function (e) {
            if (!cartDropdown.contains(e.target) && e.target !== cartIcon) {
                cartDropdown.classList.remove("show");
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                cartDropdown.classList.remove("show");
            }
        });
    }

    // Generar PDF con el detalle de compra
    if (generatePDFBtn) {
        generatePDFBtn.addEventListener("click", function () {
            if (cart.length === 0) {
                Swal.fire({ icon: "info", title: "Carrito vacío", text: "No hay productos para generar el PDF" });
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("TruchaShop - Detalle de Compra", 20, 20);
            doc.setFontSize(12);
            doc.text("Fecha: " + new Date().toLocaleDateString(), 20, 30);
            doc.text("Cliente: " + (clienteActual ? clienteActual.nombre : "Usuario de TruchaShop"), 20, 40);

            let startY = 50;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Producto", 20, startY);
            doc.text("Cant.", 120, startY);
            doc.text("Precio", 140, startY);
            doc.text("Total", 170, startY);
            startY += 10;
            doc.setFont("helvetica", "normal");

            let total = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                doc.text(item.name, 20, startY);
                doc.text(item.quantity.toString(), 120, startY);
                doc.text("$" + item.price.toLocaleString(), 140, startY);
                doc.text("$" + itemTotal.toLocaleString(), 170, startY);
                startY += 10;
                if (startY > 270) {
                    doc.addPage();
                    startY = 20;
                }
            });

            startY += 5;
            doc.setDrawColor(0);
            doc.line(120, startY, 190, startY);
            startY += 10;
            doc.setFont("helvetica", "bold");
            doc.text("TOTAL:", 120, startY);
            doc.text("$" + total.toLocaleString(), 170, startY);

            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            startY += 30;
            doc.text("Gracias por comprar en TruchaShop", 20, startY);
            doc.text("Contacto: info@truchashop.com | Tel: +123 456 7890", 20, startY + 10);

            doc.save("TruchaShop-Pedido.pdf");

            Swal.fire({
                icon: "success",
                title: "PDF Generado",
                text: "El detalle de tu compra ha sido descargado correctamente",
                confirmButtonColor: "#2c3e50"
            });
        });
    }
// Modificación para la función de checkout en carrito.js
// Esta parte reemplazaría la sección correspondiente en tu código actual

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) {
            Swal.fire({ icon: "info", title: "Carrito vacío", text: "Agrega productos al carrito antes de finalizar la compra" });
            return;
        }

        // Crear formulario con campos de envío
        Swal.fire({
            title: "Información de envío",
            html: `
                <form id="checkoutForm" class="checkout-form">
                    <div class="form-group">
                        <label for="nombre">Nombre completo</label>
                        <input type="text" id="nombre" class="swal2-input" placeholder="Nombre completo" 
                            value="${clienteActual ? clienteActual.nombre : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Correo electrónico</label>
                        <input type="email" id="email" class="swal2-input" placeholder="Correo electrónico" 
                            value="${clienteActual ? clienteActual.email : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="telefono">Teléfono</label>
                        <input type="tel" id="telefono" class="swal2-input" placeholder="Teléfono" required>
                    </div>
                    <div class="form-group">
                        <label for="direccion">Dirección</label>
                        <input type="text" id="direccion" class="swal2-input" placeholder="Dirección de entrega" required>
                    </div>
                    <div class="form-group">
                        <label for="ciudad">Ciudad</label>
                        <input type="text" id="ciudad" class="swal2-input" placeholder="Ciudad" required>
                    </div>
                    <div class="form-group">
                        <label>Método de pago</label>
                        <div class="payment-options">
                            <label><input type="radio" name="metodoPago" value="transferencia" checked> Transferencia</label>
                            <label><input type="radio" name="metodoPago" value="efectivo"> Efectivo</label>
                        </div>
                    </div>
                    ${!clienteActual ? `
                    <div class="form-group registro-option">
                        <label>
                            <input type="checkbox" id="quieroRegistrarme"> Quiero crear una cuenta para seguimiento de pedidos
                        </label>
                    </div>` : ''}
                </form>`,
            preConfirm: () => {
                const nombre = document.getElementById("nombre").value;
                const email = document.getElementById("email").value;
                const telefono = document.getElementById("telefono").value;
                const direccion = document.getElementById("direccion").value;
                const ciudad = document.getElementById("ciudad").value;
                const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
                const quieroRegistrarme = document.getElementById("quieroRegistrarme") ? 
                                         document.getElementById("quieroRegistrarme").checked : false;
                
                if (!nombre || !email || !telefono || !direccion || !ciudad) {
                    Swal.showValidationMessage("Por favor completa todos los campos");
                    return false;
                }
                
                // Validar formato de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    Swal.showValidationMessage("El formato del correo electrónico es inválido");
                    return false;
                }
                
                return { 
                    nombre, 
                    email, 
                    telefono, 
                    direccion, 
                    ciudad, 
                    metodoPago,
                    clienteId: clienteActual ? clienteActual._id : null,
                    quieroRegistrarme
                };
            },
            showCancelButton: true,
            confirmButtonText: "Confirmar pedido",
            cancelButtonText: "Cancelar"
        }).then(result => {
            if (result.isConfirmed) {
                const datosEnvio = result.value;
                
                // Preparar productos para enviar al backend
                const productosFormateados = cart.map(item => ({
                    id: item.id,
                    nombre: item.name,
                    precio: item.price,
                    cantidad: item.quantity
                }));
                
                // Crear objeto de pedido
                const pedido = {
                    ...datosEnvio,
                    productos: productosFormateados
                };
                
                // Mostrar spinner durante la solicitud
                Swal.fire({
                    title: 'Procesando pedido',
                    html: 'Por favor espere...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Enviar pedido al backend
                fetch("/api/pedidos/realizar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pedido)
                })
                .then(res => {
                    if (!res.ok) throw new Error("Error en la solicitud");
                    return res.json();
                })
                .then(data => {
                    if (data.success) {
                        if (!clienteActual && datosEnvio.quieroRegistrarme) {
                            // Si no está registrado pero quiere registrarse
                            Swal.fire({
                                icon: "success",
                                title: "¡Pedido confirmado!",
                                text: "Para completar el registro, necesitamos algunos datos adicionales",
                                confirmButtonText: "Crear cuenta",
                                allowOutsideClick: false
                            }).then(() => {
                                // Vaciar carrito
                                cart = [];
                                updateCartUI();
                                
                                // Guardar email y nombre en localStorage para autocompletar el registro
                                localStorage.setItem("emailPendiente", datosEnvio.email);
                                localStorage.setItem("nombrePendiente", datosEnvio.nombre);
                                
                                // Redirigir a la página de registro
                                window.location.href = "/#registro"; // No necesitas poner .ejs

                            });

                        } else {
                            // Si ya está registrado o no quiere registrarse
                            Swal.fire({
                                icon: "success",
                                title: "¡Pedido confirmado!",
                                text: "Gracias por tu compra. Pronto nos pondremos en contacto contigo.",
                                footer: !clienteActual ? '<small>Te recomendamos registrarte en el futuro para hacer seguimiento de tus pedidos</small>' : ''
                            });
                            
                            // Vaciar carrito
                            cart = [];
                            updateCartUI();

                            // Guardar información del pedido en localStorage para referencia
                            const pedidoInfo = {
                                id: data.data._id,
                                fecha: new Date().toISOString(),
                                total: pedido.productos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                                email: datosEnvio.email
                            };
                            
                            // Guardar historial de pedidos para usuarios no registrados
                            if (!clienteActual) {
                                let pedidosAnonimos = JSON.parse(localStorage.getItem("pedidosAnonimos")) || [];
                                pedidosAnonimos.push(pedidoInfo);
                                localStorage.setItem("pedidosAnonimos", JSON.stringify(pedidosAnonimos));
                            }
                        }
                    } else {
                        throw new Error(data.message || "Error al procesar el pedido");
                    }
                })
                .catch(err => {
                    console.error("Error al enviar pedido:", err);
                    Swal.fire({
                        icon: "error",
                        title: "Error al enviar el pedido",
                        text: "Ocurrió un problema al registrar tu pedido. Intenta nuevamente."
                    });
                });
            }
        });
    });
}

    // Inicializar la interfaz del carrito al cargar la página
    updateCartUI();
});

// aca agrego una funcion para el manejode datosdel carrito con el form
document.addEventListener("DOMContentLoaded", function() {
    // Verificar si hay datos pendientes de registro (redireccionado desde el carrito)
    const emailPendiente = localStorage.getItem("emailPendiente");
    const nombrePendiente = localStorage.getItem("nombrePendiente");
    
    // Seleccionar los campos del formulario
    const emailInput = document.querySelector('input[name="email"]') || document.getElementById('email');
    const nombreInput = document.querySelector('input[name="nombre"]') || document.getElementById('nombre');
    
    // Autocompletar email si existe
    if (emailPendiente && emailInput) {
        emailInput.value = emailPendiente;
        localStorage.removeItem("emailPendiente");
    }
    
    // Autocompletar nombre si existe
    if (nombrePendiente && nombreInput) {
        nombreInput.value = nombrePendiente;
        localStorage.removeItem("nombrePendiente");
    }
    
    // También podemos mostrar un mensaje al usuario
    if (emailPendiente) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'alert alert-info';
        mensajeDiv.innerHTML = '¡Gracias por tu compra! Completa tu registro para hacer seguimiento de tu pedido.';
        
        // Insertar antes del formulario
        const formulario = document.querySelector('form');
        if (formulario && formulario.parentNode) {
            formulario.parentNode.insertBefore(mensajeDiv, formulario);
        }
    }
});

// aca agrego el manejo del formulario clientes 
// Reemplaza el código actual del formulario con este:
// Manejo del formulario de registro de clientes
document.getElementById('clientRegistrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
      const clienteData = {
        tipoDocumento: document.getElementById('tipoDocumento').value,
        numeroDocumento: document.getElementById('numeroDocumento').value.trim(),
        nombreCompleto: document.getElementById('nombreCompleto').value.trim(),
        numeroContacto: document.getElementById('numeroContacto').value.trim(),
        correoElectronico: document.getElementById('correoElectronico').value.trim(),
        newsletter: document.getElementById('newsletter').checked,
        fechaRegistro: new Date()
      };

      const response = await fetch('/clientes', { // 👈 CAMBIADO de '/registro-cliente' a '/clientes'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData)
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: result.message || '¡Gracias por registrarte en TruchaShop!'
        });
        this.reset();
      } else {
        throw new Error(result.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: error.message || 'Ocurrió un error al procesar tu registro. Por favor intenta nuevamente.'
      });
    }
});
