document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.view-section');
    const mainActionBtn = document.getElementById('main-action-btn');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 

            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.style.display = 'none');

            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';

            // Cambiar el texto del botón principal según la vista
            if (targetId === 'view-inventory') {
                mainActionBtn.textContent = '+ Nueva Propiedad';
            } else if (targetId === 'view-leads') {
                mainActionBtn.textContent = '+ Nuevo Lead';
            } else if (targetId === 'view-dashboard') {
                mainActionBtn.textContent = 'Descargar Reporte';
            }
        });
    });
});
