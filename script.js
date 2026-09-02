document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. NAVEGACIÓN ENTRE VISTAS (SPA)
    // ==========================================
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
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.style.display = 'block';
            }

            if (targetId === 'view-inventory') {
                mainActionBtn.textContent = '+ Nueva Propiedad';
            } else if (targetId === 'view-leads') {
                mainActionBtn.textContent = '+ Nuevo Lead';
            } else if (targetId === 'view-dashboard') {
                mainActionBtn.textContent = 'Descargar Reporte';
            }
        });
    });

    // ==========================================
    // 2. SISTEMA KANBAN: DRAG & DROP
    // ==========================================
    const leadCards = document.querySelectorAll('.lead-card');
    const dropZones = document.querySelectorAll('.column-content');

    let draggedCard = null;

    // Eventos para las tarjetas que se arrastran
    leadCards.forEach(card => {
        card.addEventListener('dragstart', () => {
            draggedCard = card;
            setTimeout(() => card.style.display = 'none', 0);
        });

        card.addEventListener('dragend', () => {
            setTimeout(() => {
                draggedCard.style.display = 'block';
                draggedCard = null;
                updateColumnCounters();
            }, 0);
        });
    });

    // Eventos para las zonas donde se sueltan las tarjetas
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necesario para permitir soltar elementos
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (draggedCard) {
                zone.appendChild(draggedCard);
            }
        });
    });

    // Función para recalcular los contadores numéricos de cada columna
    function updateColumnCounters() {
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(col => {
            const countBadge = col.querySelector('.count-badge');
            const totalCards = col.querySelectorAll('.lead-card').length;
            if (countBadge) {
                countBadge.textContent = totalCards;
            }
        });
    }
});
