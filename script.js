document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. ESTADO INICIAL Y LOCALSTORAGE
    // ==========================================
    const defaultProperties = [
        {
            id: 1,
            price: "$120,000",
            address: "Av. Principal, Sector Norte",
            beds: 3,
            baths: 2,
            sqm: 150,
            type: "Venta"
        },
        {
            id: 2,
            price: "$850 / mes",
            address: "Residencias El Bosque, Torre B",
            beds: 2,
            baths: 2,
            sqm: 85,
            type: "Alquiler"
        }
    ];

    let properties = JSON.parse(localStorage.getItem('inmo_properties')) || defaultProperties;

    // Renderizar propiedades en la grilla
    function renderProperties() {
        const grid = document.getElementById('property-grid');
        const kpiCount = document.getElementById('kpi-properties-count');
        if (!grid) return;

        grid.innerHTML = '';
        properties.forEach(prop => {
            const isVenta = prop.type === 'Venta';
            const badgeClass = isVenta ? 'status-active' : 'status-rent';
            const card = document.createElement('article');
            card.className = 'property-card';
            card.innerHTML = `
                <div class="card-media">
                    <span class="status-badge ${badgeClass}">En ${prop.type}</span>
                    <div class="photo-placeholder" style="background-color: ${isVenta ? '#94a3b8' : '#cbd5e1'};"></div>
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <h3 class="property-price">${prop.price}</h3>
                        <p class="property-address">${prop.address}</p>
                    </div>
                    <div class="property-specs">
                        <div class="spec-item"><span>🛏️</span> ${prop.beds} Hab</div>
                        <div class="spec-item"><span>🛁</span> ${prop.baths} Baños</div>
                        <div class="spec-item"><span>📐</span> ${prop.sqm}m²</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-secondary">Ver Ficha</button>
                    <button class="btn-whatsapp">Enviar 💬</button>
                </div>
            `;
            grid.appendChild(card);
        });

        if (kpiCount) {
            kpiCount.textContent = properties.length;
        }
    }

    renderProperties();

    // ==========================================
    // 2. NAVEGACIÓN ENTRE VISTAS (SPA)
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
                mainActionBtn.style.display = 'block';
            } else if (targetId === 'view-leads') {
                mainActionBtn.textContent = '+ Nuevo Lead';
                mainActionBtn.style.display = 'block';
            } else if (targetId === 'view-dashboard') {
                mainActionBtn.textContent = 'Descargar Reporte';
                mainActionBtn.style.display = 'block';
            }
        });
    });

    // ==========================================
    // 3. MODAL DE NUEVA PROPIEDAD
    // ==========================================
    const modal = document.getElementById('property-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const propertyForm = document.getElementById('property-form');

    function openModal() {
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        propertyForm.reset();
    }

    mainActionBtn.addEventListener('click', () => {
        // Si estamos en inventario, abre el modal de propiedad
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav && activeNav.getAttribute('data-target') === 'view-inventory') {
            openModal();
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    // Guardar inmueble desde el formulario
    propertyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let rawPrice = document.getElementById('prop-price').value.trim();
        if (!rawPrice.startsWith('$')) rawPrice = '$' + rawPrice;

        const newProp = {
            id: Date.now(),
            address: document.getElementById('prop-address').value.trim(),
            price: rawPrice,
            type: document.getElementById('prop-type').value,
            beds: document.getElementById('prop-beds').value,
            baths: document.getElementById('prop-baths').value,
            sqm: document.getElementById('prop-sqm').value
        };

        properties.push(newProp);
        localStorage.setItem('inmo_properties', JSON.stringify(properties));

        renderProperties();
        closeModal();
    });

    // ==========================================
    // 4. SISTEMA KANBAN: DRAG & DROP
    // ==========================================
    const leadCards = document.querySelectorAll('.lead-card');
    const dropZones = document.querySelectorAll('.column-content');
    let draggedCard = null;

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

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
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
