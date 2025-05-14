// JavaScript para el panel de administración
document.addEventListener('DOMContentLoaded', function() {
    // Manejo de la barra lateral en dispositivos móviles
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
    
    // Manejo de estados activos en el menú de navegación
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Marcar como activo el enlace que coincide con la ruta actual
        if (currentPath === linkPath || 
            (linkPath !== '/panel' && currentPath.startsWith(linkPath))) {
            link.parentElement.classList.add('active');
        }
    });
    
    // Inicialización de tooltips para la barra lateral colapsada
    if (typeof tippy !== 'undefined') {
        tippy('.sidebar.collapsed .sidebar-nav a', {
            content: (reference) => reference.querySelector('span').textContent,
            placement: 'right'
        });
    }
    
    // Animación suave para estadísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const finalValue = parseFloat(stat.textContent.replace(/[^\d.-]/g, ''));
        let startValue = 0;
        const duration = 1000;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const currentValue = Math.floor(startValue + progress * (finalValue - startValue));
                
                // Formatear el número según su tipo
                if (stat.textContent.includes('$')) {
                    stat.textContent = '$' + currentValue.toLocaleString();
                } else {
                    stat.textContent = currentValue.toLocaleString();
                }
                
                requestAnimationFrame(updateNumber);
            } else {
                stat.textContent = stat.getAttribute('data-original');
            }
        }
        
        // Guardar el contenido original para tener el formato correcto al final
        stat.setAttribute('data-original', stat.textContent);
        requestAnimationFrame(updateNumber);
    });
});