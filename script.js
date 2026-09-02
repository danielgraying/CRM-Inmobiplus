document.addEventListener('DOMContentLoaded', () => {
    // 1. Capturamos los elementos del menú y las vistas
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.view-section');
    const mainActionBtn = document.getElementById('main-action-btn');

    // 2. Función para cambiar de pestaña
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que la página salte al hacer clic en el enlace '#'

            // Quitar la clase 'active' de todos los botones y ocultar todas las vistas
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.style.display = 'none');

            // Agregar 'active' al botón clickeado
            item.classList.add('active');

            // Mostrar la vista correspondiente usando el atributo data-target
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';

            // Cambiar el texto del botón principal de la esquina superior derecha
            if (targetId === 'view-inventory') {
                mainActionBtn.textContent = '+ Nueva Propiedad';
            } else if (targetId === 'view-leads') {
                mainActionBtn.textContent = '+ Nuevo Lead';
            }
        });
    });
});