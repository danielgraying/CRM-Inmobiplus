document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. MODO OSCURO (THEME SWITCHER)
    // ==========================================
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('inmo_theme') || 'light';

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (darkModeToggle) darkModeToggle.checked = true;
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('inmo_theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('inmo_theme', 'light');
            }
        });
    }

    // ==========================================
    // 2. DATOS INICIALES (LOCALSTORAGE)
    // ==========================================
    const defaultProperties = [
        {
            id: 1,
            category: "Apartamento",
            price: 120000,
            address: "Av. Principal, Sector Norte",
            beds: 3,
            baths: 2,
            sqm: 150,
            type: "Venta"
        },
        {
            id: 2,
            category: "Casa",
            price: 850,
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

    // Normalizar formato de precios antiguos si existieran como strings
    properties.forEach(p => {
        if (typeof p.price === 'string') {
            p.price = parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0;
        }
    });

    function formatCurrency(val, type) {
        return `$${Number(val).toLocaleString('en-US')}${type === 'Alquiler' ? ' / mes' : ''}`;
    }

    // ==========================================
    // 3. BUSCADOR GLOBAL & FILTROS DE PROPIEDADES
    // ==========================================
    const globalSearch = document.getElementById('global-search');
    const grid = document.getElementById('property-grid');
    const filterType = document.getElementById('filter-property-type');
    const filterOp = document.getElementById('filter-operation');
    const filterBeds = document.getElementById('filter-beds');
    const filterMaxPrice = document.getElementById('filter-max-price');
    const btnClearFilters = document.getElementById('btn-clear-filters');

    function renderProperties() {
        if (!grid) return;

        const valSearch = globalSearch ? globalSearch.value.toLowerCase().trim() : '';
        const valType = filterType.value;
        const valOp = filterOp.value;
        const valBeds = filterBeds.value ? parseInt(filterBeds.value, 10) : 0;
        const valMaxPrice = filterMaxPrice.value ? parseFloat(filterMaxPrice.value) : Infinity;

        const filtered = properties.filter(prop => {
            const matchesSearch = !valSearch || 
                prop.address.toLowerCase().includes(valSearch) || 
                prop.category.toLowerCase().includes(valSearch);
            const matchesType = !valType || prop.category === valType;
            const matchesOp = !valOp || prop.type === valOp;
            const matchesBeds = !valBeds || parseInt(prop.beds, 10) >= valBeds;
            const matchesPrice = isNaN(valMaxPrice) || prop.price <= valMaxPrice;

            return matchesSearch && matchesType && matchesOp && matchesBeds && matchesPrice;
        });

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No se encontraron inmuebles coincidentes.</p>';
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
                        <div class="photo-placeholder" style="background-color: ${isVenta ? '#64748b' : '#94a3b8'};"></div>
                    </div>
                    <div class="card-body">
                        <div class="card-header">
                            <h3 class="property-price">${formatCurrency(prop.price, prop.type)}</h3>
                            <p class="property-address">${prop.address}</p>
                        </div>
                        <div class="property-specs">
                            <div class="spec-item"><span>🛏️</span> ${prop.beds} Hab</div>
                            <div class="spec-item"><span>🛁</span> ${prop.baths} Baños</div>
                            <div class="spec-item"><span>📐</span> ${prop.sqm}m²</div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="viewPropertyDetails(${prop.id})">Ver Ficha</button>
                        <button class="btn-whatsapp" onclick="sendWhatsApp('${encodeURIComponent(prop.address)}', '${formatCurrency(prop.price, prop.type)}')">Enviar 💬</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        updateDashboardKPIs();
    }

    [filterType, filterOp, filterBeds, filterMaxPrice].forEach(el => {
        if (el) el.addEventListener('input', renderProperties);
    });

    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            filterType.value = '';
            filterOp.value = '';
            filterBeds.value = '';
            filterMaxPrice.value = '';
            if (globalSearch) globalSearch.value = '';
            renderProperties();
        });
    }

    // Buscador global en tiempo real (reacciona según la pantalla activa)
    if (globalSearch) {
        globalSearch.addEventListener('input', () => {
            const activeNav = document.querySelector('.nav-item.active');
            const currentView = activeNav ? activeNav.getAttribute('data-target') : '';
            if (currentView === 'view-inventory') {
                renderProperties();
            } else if (currentView === 'view-leads') {
                renderLeads();
            }
        });
    }

    window.sendWhatsApp = (address, price) => {
        const text = `Hola, te comparto la información de esta propiedad: ${decodeURIComponent(address)} - Precio: ${price}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    // ==========================================
    // 4. MODAL: VER FICHA EN DETALLE
    // ==========================================
    const detailsModal = document.getElementById('details-modal');
    const detailContent = document.getElementById('detail-content');
    const detailWhatsAppBtn = document.getElementById('detail-whatsapp-btn');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
    const closeDetailsBottomBtn = document.getElementById('close-details-bottom-btn');

    window.viewPropertyDetails = (id) => {
        const prop = properties.find(p => p.id === id);
        if (!prop) return;

        const formattedPrice = formatCurrency(prop.price, prop.type);
        detailContent.innerHTML = `
            <h4 style="font-size: 1.2rem; color: var(--primary-color); margin-bottom: 4px;">${formattedPrice}</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px;">${prop.address}</p>
            <div class="detail-meta-grid">
                <div class="detail-meta-item">
                    <strong>Tipo</strong>
                    <span>${prop.category}</span>
                </div>
                <div class="detail-meta-item">
                    <strong>Operación</strong>
                    <span>${prop.type}</span>
                </div>
                <div class="detail-meta-item">
                    <strong>Habitaciones</strong>
                    <span>${prop.beds}</span>
                </div>
                <div class="detail-meta-item">
                    <strong>Baños</strong>
                    <span>${prop.baths}</span>
                </div>
                <div class="detail-meta-item">
                    <strong>Área Construida</strong>
                    <span>${prop.sqm} m²</span>
                </div>
                <div class="detail-meta-item">
                    <strong>Estado</strong>
                    <span style="color: #10b981;">Disponible</span>
                </div>
            </div>
        `;

        detailWhatsAppBtn.onclick = () => sendWhatsApp(encodeURIComponent(prop.address), formattedPrice);
        detailsModal.style.display = 'flex';
    };

    function closeDetailsModal() { detailsModal.style.display = 'none'; }
    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
    if (closeDetailsBottomBtn) closeDetailsBottomBtn.addEventListener('click', closeDetailsModal);

    // ==========================================
    // 5. RENDER Y DRAG & DROP DE LEADS
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
        const valSearch = globalSearch ? globalSearch.value.toLowerCase().trim() : '';

        const filteredLeads = leads.filter(lead => {
            return !valSearch || 
                lead.name.toLowerCase().includes(valSearch) || 
                lead.intent.toLowerCase().includes(valSearch) || 
                lead.budget.toLowerCase().includes(valSearch);
        });

        filteredLeads.forEach(lead => {
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
    // 6. DASHBOARD KPIS
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

    // ==========================================
    // 7. NAVEGACIÓN (SPA)
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
            if (targetView) targetView.style.display = 'block';

            if (globalSearch) globalSearch.value = '';

            if (targetId === 'view-inventory') {
                mainActionBtn.textContent = '+ Nueva Propiedad';
                mainActionBtn.style.display = 'block';
                renderProperties();
            } else if (targetId === 'view-leads') {
                mainActionBtn.textContent = '+ Nuevo Lead';
                mainActionBtn.style.display = 'block';
                renderLeads();
            } else if (targetId === 'view-dashboard') {
                mainActionBtn.textContent = 'Descargar Backup';
                mainActionBtn.style.display = 'block';
            } else if (targetId === 'view-settings') {
                mainActionBtn.style.display = 'none';
            }
        });
    });

    // ==========================================
    // 8. MODALES Y FORMULARIOS
    // ==========================================
    const propModal = document.getElementById('property-modal');
    const closePropModal = document.getElementById('close-modal-btn');
    const cancelPropModal = document.getElementById('cancel-modal-btn');
    const propForm = document.getElementById('property-form');

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

    mainActionBtn.addEventListener('click', () => {
        const activeNav = document.querySelector('.nav-item.active');
        const target = activeNav ? activeNav.getAttribute('data-target') : '';
        if (target === 'view-inventory') openModal(propModal);
        else if (target === 'view-leads') openModal(leadModal);
        else if (target === 'view-dashboard') exportDatabase();
    });

    if (btnOpenLeadModal) btnOpenLeadModal.addEventListener('click', () => openModal(leadModal));

    closePropModal.addEventListener('click', () => closeModal(propModal, propForm));
    cancelPropModal.addEventListener('click', () => closeModal(propModal, propForm));

    closeLeadModal.addEventListener('click', () => closeModal(leadModal, leadForm));
    cancelLeadModal.addEventListener('click', () => closeModal(leadModal, leadForm));

    propForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawPrice = parseFloat(document.getElementById('prop-price').value) || 0;

        const newProp = {
            id: Date.now(),
            category: document.getElementById('prop-category').value,
            address: document.getElementById('prop-address').value.trim(),
            price: rawPrice,
            type: document.getElementById('prop-type').value,
            beds: parseInt(document.getElementById('prop-beds').value, 10) || 0,
            baths: parseInt(document.getElementById('prop-baths').value, 10) || 0,
            sqm: parseInt(document.getElementById('prop-sqm').value, 10) || 0
        };

        properties.push(newProp);
        localStorage.setItem('inmo_properties', JSON.stringify(properties));
        renderProperties();
        closeModal(propModal, propForm);
    });

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

    // ==========================================
    // 9. EXPORTAR / IMPORTAR BASE DE DATOS (JSON)
    // ==========================================
    const btnExportJson = document.getElementById('btn-export-json');
    const importJsonInput = document.getElementById('import-json-input');

    function exportDatabase() {
        const data = {
            inmo_properties: properties,
            inmo_leads: leads,
            exported_at: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inmocrm_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    if (btnExportJson) btnExportJson.addEventListener('click', exportDatabase);

    if (importJsonInput) {
        importJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if (parsed.inmo_properties && parsed.inmo_leads) {
                        properties = parsed.inmo_properties;
                        leads = parsed.inmo_leads;
                        localStorage.setItem('inmo_properties', JSON.stringify(properties));
                        localStorage.setItem('inmo_leads', JSON.stringify(leads));
                        renderProperties();
                        renderLeads();
                        alert('¡Base de datos importada correctamente!');
                    } else {
                        alert('El archivo no contiene un formato válido de InmoCRM.');
                    }
                } catch (err) {
                    alert('Error al leer el archivo JSON.');
                }
            };
            reader.readAsText(file);
        });
    }

    // Inicializar vistas
    renderProperties();
    renderLeads();
});
