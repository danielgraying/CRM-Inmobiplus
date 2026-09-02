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

    properties.forEach(p => {
        if (typeof p.price === 'string') {
            p.price = parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0;
        }
    });

    function formatCurrency(val, type) {
        return `$${Number(val).toLocaleString('en-US')}${type === 'Alquiler' ? ' / mes' : ''}`;
    }

    // ==========================================
    // 3. RENDER Y FILTROS (SUB-SIDEBAR)
    // ==========================================
    const grid = document.getElementById('property-grid');
    const globalSearch = document.getElementById('global-search');
    const filterMaxPrice = document.getElementById('filter-max-price');
    const btnClearAllFilters = document.getElementById('btn-clear-all-filters');

    function getSelectedFacet(name) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    function renderProperties() {
        if (!grid) return;

        const valSearch = globalSearch ? globalSearch.value.toLowerCase().trim() : '';
        const valType = getSelectedFacet('facet-type');
        const valOp = getSelectedFacet('facet-op');
        const valMaxPrice = filterMaxPrice && filterMaxPrice.value ? parseFloat(filterMaxPrice.value) : Infinity;

        const filtered = properties.filter(prop => {
            const matchesSearch = !valSearch || 
                prop.address.toLowerCase().includes(valSearch) || 
                prop.category.toLowerCase().includes(valSearch);
            const matchesType = !valType || prop.category === valType;
            const matchesOp = !valOp || prop.type === valOp;
            const matchesPrice = isNaN(valMaxPrice) || prop.price <= valMaxPrice;

            return matchesSearch && matchesType && matchesOp && matchesPrice;
        });

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; padding: 20px 0;">No se encontraron inmuebles.</p>';
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
                            <span>📐 ${prop.sqm}m²</span>
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

    document.querySelectorAll('input[name="facet-type"], input[name="facet-op"]').forEach(radio => {
        radio.addEventListener('change', renderProperties);
    });

    if (filterMaxPrice) filterMaxPrice.addEventListener('input', renderProperties);

    if (btnClearAllFilters) {
        btnClearAllFilters.addEventListener('click', () => {
            const defaultType = document.querySelector('input[name="facet-type"][value=""]');
            const defaultOp = document.querySelector('input[name="facet-op"][value=""]');
            if (defaultType) defaultType.checked = true;
            if (defaultOp) defaultOp.checked = true;
            if (filterMaxPrice) filterMaxPrice.value = '';
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
                <div class="detail-meta-item"><strong>Área</strong><span>${prop.sqm} m²</span></div>
                <div class="detail-meta-item"><strong>Estado</strong><span style="color: #10b981;">Disponible</span></div>
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
    // 8. MOBILE FAB '+' POPOVER (PandaDoc Style)
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
            baths: parseInt(document.getElementById('prop-baths').value, 10) || 0,
            sqm: parseInt(document.getElementById('prop-sqm').value, 10) || 0
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
