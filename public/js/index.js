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
    
    // Inicialización del carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Toggle del menú móvil
    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", function () {
            mainNav.classList.toggle("active");
        });
    }
    
    // Actualiza la interfaz del carrito
    function updateCartUI() {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = "";
            
            if (cart.length === 0) {
                const emptyMessage = document.createElement("li");
                emptyMessage.className = "empty-cart-message";
                emptyMessage.textContent = "Tu carrito está vacío";
                cartItemsContainer.appendChild(emptyMessage);
                
                if (checkoutBtn) checkoutBtn.disabled = true;
                if (generatePDFBtn) generatePDFBtn.disabled = true;
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
                
                // Agregar total al carrito
                const totalElement = document.createElement("li");
                totalElement.className = "cart-total";
                totalElement.innerHTML = `<strong>Total:</strong> <span>$${total.toLocaleString()}</span>`;
                cartItemsContainer.appendChild(totalElement);
                
                if (checkoutBtn) checkoutBtn.disabled = false;
                if (generatePDFBtn) generatePDFBtn.disabled = false;
            }
        }
        
        // Actualizar contador del carrito
        if (cartCount) {
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = itemCount;
            
            // Opcional: ocultar el contador si está vacío
            if (itemCount === 0) {
                cartCount.style.display = "none";
            } else {
                cartCount.style.display = "block";
            }
        }
        
        // Guardar en localStorage
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    
    // Añadir producto al carrito
    function addToCart(product) {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        updateCartUI();
        
        // Notificación con SweetAlert2
        Swal.fire({
            icon: "success",
            title: "Producto agregado",
            text: `${product.name} ha sido añadido al carrito`,
            showConfirmButton: false,
            timer: 1500,
            position: 'top-end',
            toast: true
        });
    }
    
    // Incrementar cantidad de un producto
    function increaseQuantity(index) {
        if (index >= 0 && index < cart.length) {
            cart[index].quantity += 1;
            updateCartUI();
        }
    }
    
    // Decrementar cantidad de un producto
    function decreaseQuantity(index) {
        if (index >= 0 && index < cart.length) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                removeFromCart(index);
            }
            updateCartUI();
        }
    }
    
    // Eliminar producto del carrito
    function removeFromCart(index) {
        if (index >= 0 && index < cart.length) {
            const removedItem = cart[index];
            
            Swal.fire({
                title: '¿Eliminar producto?',
                text: `¿Estás seguro de eliminar ${removedItem.name} del carrito?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3498db',
                cancelButtonColor: '#e74c3c',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    cart.splice(index, 1);
                    updateCartUI();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El producto ha sido eliminado del carrito',
                        showConfirmButton: false,
                        timer: 1500,
                        position: 'top-end',
                        toast: true
                    });
                }
            });
        }
    }
    
    // Vaciar todo el carrito
    function clearCart() {
        Swal.fire({
            title: '¿Vaciar carrito?',
            text: '¿Estás seguro de eliminar todos los productos del carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#e74c3c',
            confirmButtonText: 'Sí, vaciar carrito',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                cart = [];
                updateCartUI();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Carrito vacío',
                    text: 'Se han eliminado todos los productos',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    }
    
    // Event listeners para los botones "Añadir al carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            // Obtener información del producto desde el DOM
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPriceText = productCard.querySelector('.product-price').textContent;
            const productPrice = parseFloat(productPriceText.replace(/[^0-9]/g, ''));
            const productImage = productCard.querySelector('.product-image').src;
            const productId = 'product-' + Date.now(); // Crear un ID único si no tienes IDs de productos
            
            // Añadir al carrito
            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            });
        });
    });
    
    // Event delegation para controles del carrito
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(e) {
            // Botón incrementar cantidad
            if (e.target.classList.contains('increase')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                increaseQuantity(index);
            }
            
            // Botón decrementar cantidad
            if (e.target.classList.contains('decrease')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                decreaseQuantity(index);
            }
            
            // Botón eliminar producto
            if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
                const index = parseInt(
                    e.target.getAttribute('data-index') || 
                    e.target.parentElement.getAttribute('data-index')
                );
                removeFromCart(index);
            }
        });
    }
    
    // Mostrar/ocultar el carrito al hacer clic en el ícono
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            cartDropdown.classList.toggle('show');
        });
        
        // Cerrar al hacer clic fuera del carrito
        document.addEventListener('click', function(e) {
            if (!cartDropdown.contains(e.target) && e.target !== cartIcon) {
                cartDropdown.classList.remove('show');
            }
        });
        
        // Cerrar con la tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                cartDropdown.classList.remove('show');
            }
        });
    }
    
    // Generar PDF del carrito
    if (generatePDFBtn) {
        generatePDFBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Carrito vacío',
                    text: 'No hay productos para generar el PDF'
                });
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título y encabezado
            doc.setFontSize(18);
            doc.text('TruchaShop - Detalle de Compra', 20, 20);
            
            doc.setFontSize(12);
            doc.text('Fecha: ' + new Date().toLocaleDateString(), 20, 30);
            
            // Datos del cliente (esto podría venir de un formulario)
            doc.text('Cliente: Usuario de TruchaShop', 20, 40);
            
            // Tabla de productos
            let startY = 50;
            doc.setFontSize(11);
            
            // Encabezados de la tabla
            doc.setFont('helvetica', 'bold');
            doc.text('Producto', 20, startY);
            doc.text('Cant.', 120, startY);
            doc.text('Precio', 140, startY);
            doc.text('Total', 170, startY);
            
            startY += 10;
            doc.setFont('helvetica', 'normal');
            
            let total = 0;
            
            // Lista de productos
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                doc.text(item.name, 20, startY);
                doc.text(item.quantity.toString(), 120, startY);
                doc.text('$' + item.price.toLocaleString(), 140, startY);
                doc.text('$' + itemTotal.toLocaleString(), 170, startY);
                
                startY += 10;
                
                // Nueva página si es necesario
                if (startY > 270) {
                    doc.addPage();
                    startY = 20;
                }
            });
            
            // Línea divisoria
            startY += 5;
            doc.setDrawColor(0);
            doc.line(120, startY, 190, startY);
            startY += 10;
            
            // Total
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL:', 120, startY);
            doc.text('$' + total.toLocaleString(), 170, startY);
            
            // Pie de página
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            startY += 30;
            doc.text('Gracias por comprar en TruchaShop', 20, startY);
            doc.text('Contacto: info@truchashop.com | Tel: +123 456 7890', 20, startY + 10);
            
            // Guardar PDF
            doc.save('TruchaShop-Pedido.pdf');
            
            Swal.fire({
                icon: 'success',
                title: 'PDF Generado',
                text: 'El detalle de tu compra ha sido descargado correctamente',
                confirmButtonColor: '#2c3e50'
            });
        });
    }
    
    // Proceso de checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Carrito vacío',
                    text: 'Agrega productos al carrito antes de finalizar la compra'
                });
                return;
            }
            
            // Aquí puedes redirigir a una página de checkout o mostrar un modal
            Swal.fire({
                title: 'Finalizar compra',
                html: `
                    <form id="checkoutForm" class="checkout-form">
                        <div class="form-group">
                            <label for="name">Nombre completo:</label>
                            <input type="text" id="name" class="swal2-input" placeholder="Ingresa tu nombre" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Correo electrónico:</label>
                            <input type="email" id="email" class="swal2-input" placeholder="Ingresa tu correo" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Teléfono:</label>
                            <input type="tel" id="phone" class="swal2-input" placeholder="Ingresa tu teléfono" required>
                        </div>
                        <div class="form-group">
                            <label for="address">Dirección de entrega:</label>
                            <textarea id="address" class="swal2-textarea" placeholder="Ingresa tu dirección" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Método de pago:</label>
                            <div class="payment-options">
                                <label>
                                    <input type="radio" name="payment" value="transferencia" checked> Transferencia Bancaria
                                </label>
                                <label>
                                    <input type="radio" name="payment" value="efectivo"> Pago en Efectivo
                                </label>
                            </div>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Confirmar Pedido',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#2c3e50',
                cancelButtonColor: '#e74c3c',
                preConfirm: () => {
                    const form = document.getElementById('checkoutForm');
                    if (!form.checkValidity()) {
                        form.reportValidity();
                        return false;
                    }
                    
                    return {
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value,
                        payment: document.querySelector('input[name="payment"]:checked').value
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Aquí enviarías los datos a tu backend o API
                    // Por ahora simularemos una compra exitosa
                    
                    Swal.fire({
                        icon: 'success',
                        title: '¡Pedido Confirmado!',
                        html: `
                            <p>Gracias por tu compra, ${result.value.name}.</p>
                            <p>Hemos enviado los detalles a tu correo: ${result.value.email}</p>
                            <p>En breve nos comunicaremos contigo para coordinar la entrega.</p>
                        `,
                        confirmButtonColor: '#2c3e50'
                    }).then(() => {
                        // Limpiar carrito después de la compra
                        cart = [];
                        updateCartUI();
                        cartDropdown.classList.remove('show');
                    });
                }
            });
        });
    }
    
    // Inicializar la UI del carrito al cargar la página
    updateCartUI();
});