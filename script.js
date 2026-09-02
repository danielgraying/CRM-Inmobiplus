document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. GESTOR DE TEMA OSCURO / CLARO
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
    // 2. ESTADO Y LOCALSTORAGE
    // ==========================================
    const defaultProperties = [
        {
            id: 1,
            category: "Apartamento",
            price: 120000,
            address: "Av. Principal, Sector Norte",
            beds: 3,
            baths: 2,
            parking: 2,
            sqmBuild: 150,
            sqmLot: 150,
            pool: false,
            pets: true,
            furnished: false,
            type: "Venta"
        },
        {
            id: 2,
            category: "Casa",
            price: 850,
            address: "Residencias El Bosque, Calle Los Pinos",
            beds: 2,
            baths: 2,
            parking: 1,
            sqmBuild: 85,
            sqmLot: 200,
            pool: true,
            pets: true,
            furnished: true,
            type: "Alquiler"
        },
        {
            id: 3,
            category: "Townhouse",
            price: 240000,
            address: "Conjunto Residencial Las Villas",
            beds: 4,
            baths: 3.5,
            parking: 3,
            sqmBuild: 280,
            sqmLot: 350,
            pool: true,
            pets: true,
            furnished: false,
            type: "Venta"
        }
    ];

    const defaultLeads = [
        {
            id: "lead_1",
            name: "Carlos Mendoza",
            intent: "Busca apto 3 habs con 2 puestos",
            budget: "$100k - $130k",
            status: "new",
            time: "Hace 2h"
        },
        {
            id: "lead_2",
            name: "Ana Silva",
            intent: "Alquiler casa c/ piscina y mascotas",
            budget: "Hasta $900/mes",
            status: "new",
            time: "Hace 5h"
        },
        {
            id: "lead_3",
            name: "Luis Pérez",
            intent: "Interesado en Townhouse en Las Villas",
            budget: "Pre-aprobado",
            status: "contacted",
            time: "Ayer"
        }
    ];

    let properties = JSON.parse(localStorage.getItem('inmo_properties')) || defaultProperties;
    let leads = JSON.parse(localStorage.getItem('inmo_leads')) || defaultLeads;

    // Normalizar formato numérico
    properties.forEach(p => {
        if (typeof p.price === 'string') p.price = parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0;
        p.beds = parseInt(p.beds, 10) || 0;
        p.baths = parseFloat(p.baths) || 0;
        p.parking = parseInt(p.parking, 10) || 0;
        p.sqmBuild = parseFloat(p.sqmBuild || p.sqm) || 0;
        p.sqmLot = parseFloat(p.sqmLot || p.sqmBuild || p.sqm) || 0;
        p.pool = Boolean(p.pool);
        p.pets = Boolean(p.pets);
        p.furnished = Boolean(p.furnished);
    });

    function formatCurrency(val, type) {
        return `$${Number(val).toLocaleString('en-US')}${type === 'Alquiler' ? ' / mes' : ''}`;
    }

    // ==========================================
    // 3. MOTOR DE FILTRADO ZILLOW STYLE
    // ==========================================
    const grid = document.getElementById('property-grid');
    const filteredCountBadge = document.getElementById('filtered-count-badge');
    const globalSearch = document.getElementById('global-search');

    // Elementos de Filtro
    const filterMinPrice = document.getElementById('filter-min-price');
    const filterMaxPrice = document.getElementById('filter-max-price');
    const filterMinSqmBuild = document.getElementById('filter-min-sqm-build');
    const filterMaxSqmBuild = document.getElementById('filter-max-sqm-build');
    const filterMinSqmLot = document.getElementById('filter-min-sqm-lot');
    const filterMaxSqmLot = document.getElementById('filter-max-sqm-lot');

    // Checkboxes Amenities
    const filterPool = document.getElementById('filter-pool');
    const filterPets = document.getElementById('filter-pets');
    const filterFurnished = document.getElementById('filter-furnished');

    const btnClearAllFilters = document.getElementById('btn-clear-all-filters');

    // Helper para obtener el valor del Pill Group activo
    function getPillValue(containerId) {
        const activeBtn = document.querySelector(`#${containerId} .pill-btn.active`);
        return activeBtn ? activeBtn.getAttribute('data-val') : '';
    }

    function setupPillGroup(containerId) {
        const buttons = document.querySelectorAll(`#${containerId} .pill-btn`);
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderProperties();
            });
        });
    }

    setupPillGroup('filter-beds-pills');
    setupPillGroup('filter-baths-pills');
    setupPillGroup('filter-parking-pills');

    function getSelectedFacet(name) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    function renderProperties() {
        if (!grid) return;

        const valSearch = globalSearch ? globalSearch.value.toLowerCase().trim() : '';
        const valType = getSelectedFacet('facet-type');
        const valOp = getSelectedFacet('facet-op');

        // Precios
        const minPrice = filterMinPrice && filterMinPrice.value ? parseFloat(filterMinPrice.value) : 0;
        const maxPrice = filterMaxPrice && filterMaxPrice.value ? parseFloat(filterMaxPrice.value) : Infinity;

        // Distribución
        const bedsVal = getPillValue('filter-beds-pills');
        const minBeds = bedsVal ? parseInt(bedsVal, 10) : 0;

        const bathsVal = getPillValue('filter-baths-pills');
        const minBaths = bathsVal ? parseFloat(bathsVal) : 0;

        const parkingVal = getPillValue('filter-parking-pills');
        const minParking = parkingVal ? parseInt(parkingVal, 10) : 0;

        // Metrajes
        const minSqmBuild = filterMinSqmBuild && filterMinSqmBuild.value ? parseFloat(filterMinSqmBuild.value) : 0;
        const maxSqmBuild = filterMaxSqmBuild && filterMaxSqmBuild.value ? parseFloat(filterMaxSqmBuild.value) : Infinity;

        const minSqmLot = filterMinSqmLot && filterMinSqmLot.value ? parseFloat(filterMinSqmLot.value) : 0;
        const maxSqmLot = filterMaxSqmLot && filterMaxSqmLot.value ? parseFloat(filterMaxSqmLot.value) : Infinity;

        // Amenities
        const reqPool = filterPool ? filterPool.checked : false;
        const reqPets = filterPets ? filterPets.checked : false;
        const reqFurnished = filterFurnished ? filterFurnished.checked : false;

        const filtered = properties.filter(prop => {
            // Buscador global
            const matchesSearch = !valSearch || 
                prop.address.toLowerCase().includes(valSearch) || 
                prop.category.toLowerCase().includes(valSearch);

            // Operación y Tipo
            const matchesType = !valType || prop.category === valType;
            const matchesOp = !valOp || prop.type === valOp;

            // Rango de Precios
            const matchesPrice = prop.price >= minPrice && prop.price <= maxPrice;

            // Distribución
            const matchesBeds = prop.beds >= minBeds;
            const matchesBaths = prop.baths >= minBaths;
            const matchesParking = (prop.parking || 0) >= minParking;

            // Superficies
            const matchesSqmBuild = (prop.sqmBuild || 0) >= minSqmBuild && (prop.sqmBuild || 0) <= maxSqmBuild;
            const matchesSqmLot = (prop.sqmLot || 0) >= minSqmLot && (prop.sqmLot || 0) <= maxSqmLot;

            // Amenities
            const matchesPool = !reqPool || prop.pool === true;
            const matchesPets = !reqPets || prop.pets === true;
            const matchesFurnished = !reqFurnished || prop.furnished === true;

            return matchesSearch && matchesType && matchesOp && matchesPrice &&
                   matchesBeds && matchesBaths && matchesParking &&
                   matchesSqmBuild && matchesSqmLot &&
                   matchesPool && matchesPets && matchesFurnished;
        });

        grid.innerHTML = '';
        if (filteredCountBadge) {
            filteredCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; padding: 30px 0; text-align: center;">No hay propiedades que coincidan con estos criterios de búsqueda.</p>';
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
                        <div class="photo-placeholder" style="background-color: ${isVenta ? '#526071' : '#7c8ba1'};"></div>
                    </div>
                    <div class="card-body">
                        <div>
                            <h3 class="property-price">${formatCurrency(prop.price, prop.type)}</h3>
                            <p class="property-address">${prop.address}</p>
                        </div>
                        <div class="property-specs">
                            <span>🛏️ ${prop.beds} Hab</span>
                            <span>🛁 ${prop.baths} Baños</span>
                            <span>🚗 ${prop.parking || 0} Estac.</span>
                            <span>📐 ${prop.sqmBuild || 0}m² const.</span>
                        </div>
                        <div class="card-amenities-tags">
                            ${prop.pool ? '<span class="mini-amenity-tag">🏊‍♂️ Piscina</span>' : ''}
                            ${prop.pets ? '<span class="mini-amenity-tag">🐾 Mascotas</span>' : ''}
                            ${prop.furnished ? '<span class="mini-amenity-tag">🛋️ Amoblado</span>' : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="viewPropertyDetails(${prop.id})">Ver Ficha</button>
                        <button class="btn-whatsapp" onclick="sendWhatsApp('${encodeURIComponent(prop.address)}', '${formatCurrency(prop.price, prop.type)}')">WhatsApp 💬</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        updateDashboardStats();
    }

    // Listeners para todos los filtros
    document.querySelectorAll('input[name="facet-type"], input[name="facet-op"]').forEach(radio => {
        radio.addEventListener('change', renderProperties);
    });

    [
        filterMinPrice, filterMaxPrice,
        filterMinSqmBuild, filterMaxSqmBuild,
        filterMinSqmLot, filterMaxSqmLot
    ].forEach(input => {
        if (input) input.addEventListener('input', renderProperties);
    });

    [filterPool, filterPets, filterFurnished].forEach(chk => {
        if (chk) chk.addEventListener('change', renderProperties);
    });

    if (btnClearAllFilters) {
        btnClearAllFilters.addEventListener('click', () => {
            const defaultType = document.querySelector('input[name="facet-type"][value=""]');
            const defaultOp = document.querySelector('input[name="facet-op"][value=""]');
            if (defaultType) defaultType.checked = true;
            if (defaultOp) defaultOp.checked = true;

            [filterMinPrice, filterMaxPrice, filterMinSqmBuild, filterMaxSqmBuild, filterMinSqmLot, filterMaxSqmLot].forEach(i => { if (i) i.value = ''; });
            [filterPool, filterPets, filterFurnished].forEach(c => { if (c) c.checked = false; });

            ['filter-beds-pills', 'filter-baths-pills', 'filter-parking-pills'].forEach(id => {
                const btns = document.querySelectorAll(`#${id} .pill-btn`);
                btns.forEach(b => b.classList.remove('active'));
                const first = document.querySelector(`#${id} .pill-btn[data-val=""]`);
                if (first) first.classList.add('active');
            });

            if (globalSearch) globalSearch.value = '';
            renderProperties();
        });
    }

    if (globalSearch) {
        globalSearch.addEventListener('input', () => {
            const activeNav = document.querySelector('.p-nav-item.active');
            const currentView = activeNav ? activeNav.getAttribute('data-target') : '';
            if (currentView === 'view-inventory') renderProperties();
            else if (currentView === 'view-leads') renderLeads();
        });
    }

    window.sendWhatsApp = (address, price) => {
        const text = `Hola, te comparto la información de esta propiedad: ${decodeURIComponent(address)} - Precio: ${price}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    // ==========================================
    // 4. DETALLE MODAL
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
            <h4 style="font-size: 1.25rem; color: var(--brand-green); margin-bottom: 4px;">${formattedPrice}</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">${prop.address}</p>
            <div class="detail-meta-grid">
                <div class="detail-meta-item"><strong>Tipo</strong><span>${prop.category}</span></div>
                <div class="detail-meta-item"><strong>Operación</strong><span>${prop.type}</span></div>
                <div class="detail-meta-item"><strong>Habitaciones</strong><span>${prop.beds}</span></div>
                <div class="detail-meta-item"><strong>Baños</strong><span>${prop.baths}</span></div>
                <div class="detail-meta-item"><strong>Estacionamiento</strong><span>${prop.parking || 0} puestos</span></div>
                <div class="detail-meta-item"><strong>Construcción</strong><span>${prop.sqmBuild || 0} m²</span></div>
                <div class="detail-meta-item"><strong>Terreno Total</strong><span>${prop.sqmLot || 0} m²</span></div>
                <div class="detail-meta-item"><strong>Estado</strong><span style="color: #10b981;">Disponible</span></div>
            </div>
            <div style="margin-top: 10px;">
                <strong style="font-size: 0.8rem; color: var(--text-muted);">Amenities:</strong>
                <p style="font-size: 0.88rem; margin-top: 4px;">
                    ${[prop.pool ? 'Piscina' : null, prop.pets ? 'Acepta Mascotas' : null, prop.furnished ? 'Amoblado' : null].filter(Boolean).join(' • ') || 'Sin extras especificados'}
                </p>
            </div>
        `;

        detailWhatsAppBtn.onclick = () => sendWhatsApp(encodeURIComponent(prop.address), formattedPrice);
        detailsModal.style.display = 'flex';
    };

    function closeDetailsModal() { detailsModal.style.display = 'none'; }
    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
    if (closeDetailsBottomBtn) closeDetailsBottomBtn.addEventListener('click', closeDetailsModal);

    // ==========================================
    // 5. KANBAN LEADS
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

        const filtered = leads.filter(l => {
            return !valSearch || 
                l.name.toLowerCase().includes(valSearch) || 
                l.intent.toLowerCase().includes(valSearch);
        });

        filtered.forEach(lead => {
            const targetCol = columnMap[lead.status] || colNew;
            if (targetCol) {
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

                card.addEventListener('dragstart', () => {
                    draggedCard = card;
                    setTimeout(() => card.style.display = 'none', 0);
                });

                card.addEventListener('dragend', () => {
                    setTimeout(() => {
                        if (draggedCard) draggedCard.style.display = 'block';
                        draggedCard = null;
                        updateKanbanCounters();
                        saveLeadsState();
                    }, 0);
                });

                targetCol.appendChild(card);
            }
        });

        updateKanbanCounters();
        updateDashboardStats();
    }

    document.querySelectorAll('.column-content').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (draggedCard) {
                zone.appendChild(draggedCard);
                const newStatus = zone.closest('.kanban-column').getAttribute('data-status');
                const leadId = draggedCard.getAttribute('data-id');
                const targetLead = leads.find(l => l.id == leadId);
                if (targetLead) targetLead.status = newStatus;
            }
        });
    });

    function updateKanbanCounters() {
        document.querySelectorAll('.kanban-column').forEach(col => {
            const countBadge = col.querySelector('.count-badge');
            const total = col.querySelectorAll('.lead-card').length;
            if (countBadge) countBadge.textContent = total;
        });
    }

    function saveLeadsState() {
        localStorage.setItem('inmo_leads', JSON.stringify(leads));
        updateDashboardStats();
    }

    // ==========================================
    // 6. STATS DASHBOARD
    // ==========================================
    function updateDashboardStats() {
        const kpiProps = document.getElementById('kpi-properties-count');
        const kpiLeadsNew = document.getElementById('kpi-leads-new');
        const kpiLeadsOffer = document.getElementById('kpi-leads-offer');
        const kpiVisits = document.getElementById('kpi-visits-count');

        if (kpiProps) kpiProps.textContent = properties.length;
        if (kpiLeadsNew) kpiLeadsNew.textContent = leads.filter(l => l.status === 'new').length;
        if (kpiLeadsOffer) kpiLeadsOffer.textContent = leads.filter(l => l.status === 'offer').length;
        if (kpiVisits) kpiVisits.textContent = leads.filter(l => l.status === 'visited').length;
    }

    // ==========================================
    // 7. SPA NAVIGATION & DRAWER MOBILE
    // ==========================================
    const navItems = document.querySelectorAll('.p-nav-item[data-target]');
    const views = document.querySelectorAll('.view-section');
    const primarySidebar = document.getElementById('primary-sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const mobileFabMenu = document.getElementById('mobile-fab-menu');
    const mobileSidebarClose = document.getElementById('mobile-sidebar-close');

    function closeMobileSidebar() {
        primarySidebar.classList.remove('open');
        sidebarBackdrop.style.display = 'none';
    }

    function openMobileSidebar() {
        primarySidebar.classList.add('open');
        sidebarBackdrop.style.display = 'block';
    }

    if (mobileFabMenu) mobileFabMenu.addEventListener('click', openMobileSidebar);
    if (mobileSidebarClose) mobileSidebarClose.addEventListener('click', closeMobileSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.style.display = 'none');

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.style.display = 'block';

            if (globalSearch) globalSearch.value = '';
            if (targetId === 'view-inventory') renderProperties();
            if (targetId === 'view-leads') renderLeads();

            closeMobileSidebar();
        });
    });

    // ==========================================
    // 8. MOBILE FAB '+' POPOVER
    // ==========================================
    const mobileFabCreate = document.getElementById('mobile-fab-create');
    const mobileCreatePopover = document.getElementById('mobile-create-popover');
    const popoverBtnProp = document.getElementById('popover-btn-prop');
    const popoverBtnLead = document.getElementById('popover-btn-lead');
    const popoverBtnBackup = document.getElementById('popover-btn-backup');

    if (mobileFabCreate) {
        mobileFabCreate.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileCreatePopover.classList.toggle('show');
            mobileFabCreate.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!mobileCreatePopover.contains(e.target) && e.target !== mobileFabCreate) {
                mobileCreatePopover.classList.remove('show');
                mobileFabCreate.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 9. FORMULARIOS Y MODALES
    // ==========================================
    const propModal = document.getElementById('property-modal');
    const leadModal = document.getElementById('lead-modal');
    const propForm = document.getElementById('property-form');
    const leadForm = document.getElementById('lead-form');

    function openM(el) { 
        el.style.display = 'flex'; 
        if (mobileCreatePopover) {
            mobileCreatePopover.classList.remove('show');
            mobileFabCreate.classList.remove('active');
        }
    }
    function closeM(el, f) { el.style.display = 'none'; if(f) f.reset(); }

    document.getElementById('btn-quick-create').addEventListener('click', () => openM(propModal));
    const btnOpenPropDesktop = document.getElementById('btn-open-prop-modal');
    if (btnOpenPropDesktop) btnOpenPropDesktop.addEventListener('click', () => openM(propModal));
    document.getElementById('dash-btn-add-prop').addEventListener('click', () => openM(propModal));
    const btnOpenLeadDesktop = document.getElementById('btn-open-lead-modal');
    if (btnOpenLeadDesktop) btnOpenLeadDesktop.addEventListener('click', () => openM(leadModal));

    if (popoverBtnProp) popoverBtnProp.addEventListener('click', () => openM(propModal));
    if (popoverBtnLead) popoverBtnLead.addEventListener('click', () => openM(leadModal));
    if (popoverBtnBackup) popoverBtnBackup.addEventListener('click', exportData);

    document.getElementById('close-modal-btn').addEventListener('click', () => closeM(propModal, propForm));
    document.getElementById('cancel-modal-btn').addEventListener('click', () => closeM(propModal, propForm));
    document.getElementById('close-lead-modal-btn').addEventListener('click', () => closeM(leadModal, leadForm));
    document.getElementById('cancel-lead-modal-btn').addEventListener('click', () => closeM(leadModal, leadForm));

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
            baths: parseFloat(document.getElementById('prop-baths').value) || 0,
            parking: parseInt(document.getElementById('prop-parking').value, 10) || 0,
            sqmBuild: parseFloat(document.getElementById('prop-sqm-build').value) || 0,
            sqmLot: parseFloat(document.getElementById('prop-sqm-lot').value) || 0,
            pool: document.getElementById('prop-pool').checked,
            pets: document.getElementById('prop-pets').checked,
            furnished: document.getElementById('prop-furnished').checked
        };

        properties.push(newProp);
        localStorage.setItem('inmo_properties', JSON.stringify(properties));
        renderProperties();
        closeM(propModal, propForm);
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
        closeM(leadModal, leadForm);
    });

    // ==========================================
    // 10. EXPORTAR / IMPORTAR BACKUP JSON
    // ==========================================
    function exportData() {
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

    document.getElementById('btn-export-json').addEventListener('click', exportData);
    document.getElementById('btn-backup-quick').addEventListener('click', exportData);

    document.getElementById('import-json-input').addEventListener('change', (e) => {
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
                    alert('¡Datos restaurados con éxito!');
                }
            } catch (err) {
                alert('Archivo JSON no válido.');
            }
        };
        reader.readAsText(file);
    });

    // Inicializar renders
    renderProperties();
    renderLeads();
});
