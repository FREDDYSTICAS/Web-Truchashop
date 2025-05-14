// JavaScript para la página de login
document.addEventListener('DOMContentLoaded', function() {
    // Animación simple para los botones de login
    const loginButtons = document.querySelectorAll('.login-btn');
    
    loginButtons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Si hay mensajes flash (errores o notificaciones), mostrarlos
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        // Mostrar mensaje por 5 segundos y luego desaparecer
        setTimeout(() => {
            message.classList.add('fade-out');
            
            // Eliminar después de la animación
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
});