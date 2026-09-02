document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. DATOS INICIALES (LOCALSTORAGE)
    // ==========================================
    const defaultProperties = [
        {
            id: 1,
            category: "Apartamento",
            price: "$120,000",
            address: "Av. Principal, Sector Norte",
            beds: 3,
            baths: 2,
            sqm: 150,
            type: "Venta"
        },
        {
            id: 2,
            category: "Casa",
            price: "$850 / mes",
            address: "Residencias El Bosque, Torre B",
            beds: 2,
            baths: 2,
            sqm: 85,
            type: "Alquiler"
        }
    ];

    const defaultLeads = [
        {
            id: "lead_1",
            name: "Carlos Mendoza",
            intent: "Busca apto 2 habs - Zona Norte",
            budget: "$80k - $100k",
            status: "new",
            time: "Hace 2h"
        },
        {
            id: "lead_2",
            name: "Ana Silva",
            intent: "Alquiler casa c/ patio",
            budget: "Hasta $900/mes",
            status: "new",
            time: "Hace 5h"
        },
        {
            id: "lead_3",
            name: "Luis Pérez",
            intent: "Interesado en Res. El Bosque",
            budget: "Pre-aprobado",
            status: "contacted",
            time: "Ayer"
        }
    ];

    let properties = JSON.parse(localStorage.getItem('inmo_properties')) || defaultProperties;
    let leads = JSON.parse(localStorage.getItem('inmo_leads')) || defaultLeads;

    // ==========================================
    // 2. RENDER Y FILTRADO DE PROPIEDADES
    // ==========================================
    const grid = document.getElementById('property-grid');
    const filterType = document.getElementById('filter-property-type');
    const filterOp = document.getElementById('filter-operation');
    const filterBeds = document.getElementById('filter-beds');
    const btnClearFilters = document.getElementById('btn-clear-filters');

    function renderProperties() {
        if (!grid) return;

        const valType = filterType.value;
        const valOp = filterOp.value;
        const valBeds = filterBeds.value ? parseInt(filterBeds.value, 10) : 0;

        const filtered = properties.filter(prop => {
            const matchesType = !valType || prop.category === valType;
            const matchesOp = !valOp || prop.type === valOp;
            const matchesBeds = !valBeds || parseInt(prop.beds, 10) >= valBeds;
            return matchesType && matchesOp && matchesBeds;
        });

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No se encontraron inmuebles con estos filtros.</p>';
        } else {
            filtered.forEach(prop => {
                const isVenta = prop.type === 'Venta';
                const badgeClass = isVenta ? 'status-active' : 'status-rent';
                const card = document.createElement('article');
                card.className = 'property-card';
                card.innerHTML = `
                    <div class="card-media">
                        <span class="status-badge ${badgeClass}">En ${prop.type}</span>
                        <span class="category-tag">${prop.category || 'Inmueble'}</span>
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
                        <button class="btn-whatsapp" onclick="sendWhatsApp('${encodeURIComponent(prop.address)}', '${prop.price}')">Enviar 💬</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        updateDashboardKPIs();
    }

    [filterType, filterOp, filterBeds].forEach(el => el.addEventListener('change', renderProperties));

    btnClearFilters.addEventListener('click', () => {
        filterType.value = '';
        filterOp.value = '';
        filterBeds.value = '';
        renderProperties();
    });

    window.sendWhatsApp = (address, price) => {
        const text = `Hola, te comparto la ficha de esta propiedad disponible: ${decodeURIComponent(address)} - Precio: ${price}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    // ==========================================
    // 3. RENDER Y DRAG & DROP DE LEADS
    // ==========================================
    const colNew = document.getElementById('col-new');
    const colContacted = document.getElementById('col-contacted');
    const colVisited = document.getElementById('col-visited');
    const colOffer = document.getElementById('col-offer');

    const columnMap = {
        'new': colNew,
        'contacted': colContacted,
        'visited': colVisited,
        'offer': colOffer
    };

    let draggedCard = null;

    function renderLeads() {
        Object.values(columnMap).forEach(col => { if (col) col.innerHTML = ''; });

        leads.forEach(lead => {
            const targetCol = columnMap[lead.status] || colNew;
            if (targetCol) {
                const card = createLeadCardElement(lead);
                targetCol.appendChild(card);
            }
        });

        updateColumnCounters();
        updateDashboardKPIs();
    }

    function createLeadCardElement(lead) {
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-id', lead.id);
        card.innerHTML = `
            <div class="lead-header">
                <h4>${lead.name}</h4>
                <span class="time-tag">${lead.time || 'Reciente'}</span>
            </div>
            <p class="lead-intent">${lead.intent}</p>
            <div class="lead-footer">
                <span class="budget-tag">${lead.budget}</span>
            </div>
        `;

        attachDragEvents(card);
        return card;
    }

    function attachDragEvents(card) {
        card.addEventListener('dragstart', () => {
            draggedCard = card;
            setTimeout(() => card.style.display = 'none', 0);
        });

        card.addEventListener('dragend', () => {
            setTimeout(() => {
                if (draggedCard) draggedCard.style.display = 'block';
                draggedCard = null;
                updateColumnCounters();
                saveLeadsState();
            }, 0);
        });
    }

    const dropZones = document.querySelectorAll('.column-content');
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
                const newStatus = zone.closest('.kanban-column').getAttribute('data-status');
                const leadId = draggedCard.getAttribute('data-id');
                const targetLead = leads.find(l => l.id == leadId);
                if (targetLead) {
                    targetLead.status = newStatus;
                }
            }
        });
    });

    function updateColumnCounters() {
        document.querySelectorAll('.kanban-column').forEach(col => {
            const countBadge = col.querySelector('.count-badge');
            const totalCards = col.querySelectorAll('.lead-card').length;
            if (countBadge) countBadge.textContent = totalCards;
        });
    }

    function saveLeadsState() {
        localStorage.setItem('inmo_leads', JSON.stringify(leads));
        updateDashboardKPIs();
    }

    // ==========================================
    // 4. ACTUALIZACIÓN DEL DASHBOARD
    // ==========================================
    function updateDashboardKPIs() {
        const kpiProps = document.getElementById('kpi-properties-count');
        const kpiLeads = document.getElementById('kpi-leads-count');
        const kpiVisits = document.getElementById('kpi-visits-count');

        if (kpiProps) kpiProps.textContent = properties.length;
        if (kpiLeads) kpiLeads.textContent = leads.length;
        if (kpiVisits) {
            const visitedCount = leads.filter(l => l.status === 'visited').length;
            kpiVisits.textContent = visitedCount;
        }
    }

    // ==========================
    // 5. NAVEGACIÓN ENTRE PANTALLAS (SPA)
    // ==========================
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
            if (targetView) targetView.style.display = 'block';

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
    // 6. MODALES Y FORMULARIOS
    // ==========================================
    // Modal Inmuebles
    const propModal = document.getElementById('property-modal');
    const closePropModal = document.getElementById('close-modal-btn');
    const cancelPropModal = document.getElementById('cancel-modal-btn');
    const propForm = document.getElementById('property-form');

    // Modal Leads
    const leadModal = document.getElementById('lead-modal');
    const closeLeadModal = document.getElementById('close-lead-modal-btn');
    const cancelLeadModal = document.getElementById('cancel-lead-modal-btn');
    const leadForm = document.getElementById('lead-form');
    const btnOpenLeadModal = document.getElementById('btn-open-lead-modal');

    function openModal(modalEl) { modalEl.style.display = 'flex'; }
    function closeModal(modalEl, formEl) {
        modalEl.style.display = 'none';
        if (formEl) formEl.reset();
    }

    // Botón superior dinámico
    mainActionBtn.addEventListener('click', () => {
        const activeNav = document.querySelector('.nav-item.active');
        const target = activeNav ? activeNav.getAttribute('data-target') : '';
        if (target === 'view-inventory') openModal(propModal);
        else if (target === 'view-leads') openModal(leadModal);
    });

    if (btnOpenLeadModal) btnOpenLeadModal.addEventListener('click', () => openModal(leadModal));

    closePropModal.addEventListener('click', () => closeModal(propModal, propForm));
    cancelPropModal.addEventListener('click', () => closeModal(propModal, propForm));

    closeLeadModal.addEventListener('click', () => closeModal(leadModal, leadForm));
    cancelLeadModal.addEventListener('click', () => closeModal(leadModal, leadForm));

    // Submit Inmueble
    propForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let rawPrice = document.getElementById('prop-price').value.trim();
        if (!rawPrice.startsWith('$')) rawPrice = '$' + rawPrice;

        const newProp = {
            id: Date.now(),
            category: document.getElementById('prop-category').value,
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
        closeModal(propModal, propForm);
    });

    // Submit Lead
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLead = {
            id: 'lead_' + Date.now(),
            name: document.getElementById('lead-name').value.trim(),
            intent: document.getElementById('lead-intent').value.trim(),
            budget: document.getElementById('lead-budget').value.trim(),
            status: document.getElementById('lead-status').value,
            time: 'Ahora'
        };

        leads.push(newLead);
        saveLeadsState();
        renderLeads();
        closeModal(leadModal, leadForm);
    });

    // Inicializar renders
    renderProperties();
    renderLeads();
});
