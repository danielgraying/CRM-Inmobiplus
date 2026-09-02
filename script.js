// ABRIR MODAL PARA CREAR O EDITAR
    const propModalTitle = document.getElementById('property-modal-title');
    const propEditId = document.getElementById('prop-edit-id');
    const propLat = document.getElementById('prop-lat');
    const propLng = document.getElementById('prop-lng');

    window.openEditPropertyModal = (id) => {
        const prop = properties.find(p => p.id === id);
        if (!prop) return;

        propEditId.value = prop.id;
        propModalTitle.textContent = "Editar Propiedad";

        document.getElementById('prop-address').value = prop.address;
        document.getElementById('prop-country').value = prop.country;
        
        updateLocationSelectors(prop.country, propSubdivLabel, propSubdivision, propCityLabel, propCity, false);
        propSubdivision.value = prop.subdivision;
        updateCitySelector(prop.country, prop.subdivision, propCityLabel, propCity, false);
        propCity.value = prop.city;

        propLat.value = prop.lat || '';
        propLng.value = prop.lng || '';
        document.getElementById('prop-category').value = prop.category;
        document.getElementById('prop-type').value = prop.type;
        document.getElementById('prop-price').value = prop.price;
        document.getElementById('prop-image').value = (prop.images && prop.images.length > 0) ? prop.images[0] : '';
        document.getElementById('prop-beds').value = prop.beds;
        document.getElementById('prop-baths').value = prop.baths;
        document.getElementById('prop-parking').value = prop.parking || 0;
        document.getElementById('prop-sqm-build').value = prop.sqmBuild || 0;
        document.getElementById('prop-sqmLot').value = prop.sqmLot || 0;
        document.getElementById('prop-pool').checked = !!prop.pool;
        document.getElementById('prop-pets').checked = !!prop.pets;
        document.getElementById('prop-furnished').checked = !!prop.furnished;

        closeDetailsModal();
        openM(propModal);
    };

    window.deleteProperty = (id) => {
        const prop = properties.find(p => p.id === id);
        if (prop && confirm(`¿Deseas eliminar permanentemente el inmueble en "${prop.address}"?`)) {
            properties = properties.filter(p => p.id !== id);
            visits = visits.filter(v => v.propId !== id);
            localStorage.setItem('inmo_properties', JSON.stringify(properties));
            localStorage.setItem('inmo_visits', JSON.stringify(visits));

            renderHistogram(0, MAX_RANGE_LIMIT);
            renderProperties();
            renderVisits();
            closeDetailsModal();
        }
    };

    // FORMULARIO CREAR / EDITAR SUBMIT
    propForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = propEditId.value ? Number(propEditId.value) : null;
        const rawPrice = parseFloat(document.getElementById('prop-price').value) || 0;
        const imgInput = document.getElementById('prop-image').value.trim();

        const defaultGallery = [
            imgInput || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80"
        ];

        const latitude = parseFloat(propLat.value) || 7.7885;
        const longitude = parseFloat(propLng.value) || -72.2156;

        if (editId) {
            // Modo Edición
            const existingProp = properties.find(p => p.id === editId);
            if (existingProp) {
                existingProp.address = document.getElementById('prop-address').value.trim();
                existingProp.country = document.getElementById('prop-country').value;
                existingProp.subdivision = document.getElementById('prop-subdivision').value;
                existingProp.city = document.getElementById('prop-city').value;
                existingProp.lat = latitude;
                existingProp.lng = longitude;
                existingProp.category = document.getElementById('prop-category').value;
                existingProp.type = document.getElementById('prop-type').value;
                existingProp.price = rawPrice;
                existingProp.beds = parseInt(document.getElementById('prop-beds').value, 10) || 0;
                existingProp.baths = parseFloat(document.getElementById('prop-baths').value) || 0;
                existingProp.parking = parseInt(document.getElementById('prop-parking').value, 10) || 0;
                existingProp.sqmBuild = parseFloat(document.getElementById('prop-sqm-build').value) || 0;
                existingProp.sqmLot = parseFloat(document.getElementById('prop-sqm-lot').value) || 0;
                existingProp.pool = document.getElementById('prop-pool').checked;
                existingProp.pets = document.getElementById('prop-pets').checked;
                existingProp.furnished = document.getElementById('prop-furnished').checked;
                if (imgInput) existingProp.images[0] = imgInput;
            }
        } else {
            // Modo Creación
            const newProp = {
                id: Date.now(),
                category: document.getElementById('prop-category').value,
                country: document.getElementById('prop-country').value,
                subdivision: document.getElementById('prop-subdivision').value,
                city: document.getElementById('prop-city').value,
                address: document.getElementById('prop-address').value.trim(),
                lat: latitude,
                lng: longitude,
                price: rawPrice,
                type: document.getElementById('prop-type').value,
                beds: parseInt(document.getElementById('prop-beds').value, 10) || 0,
                baths: parseFloat(document.getElementById('prop-baths').value) || 0,
                parking: parseInt(document.getElementById('prop-parking').value, 10) || 0,
                sqmBuild: parseFloat(document.getElementById('prop-sqm-build').value) || 0,
                sqmLot: parseFloat(document.getElementById('prop-sqm-lot').value) || 0,
                pool: document.getElementById('prop-pool').checked,
                pets: document.getElementById('prop-pets').checked,
                furnished: document.getElementById('prop-furnished').checked,
                images: defaultGallery
            };
            properties.push(newProp);
        }

        localStorage.setItem('inmo_properties', JSON.stringify(properties));
        renderHistogram(0, MAX_RANGE_LIMIT);
        renderProperties();
        closeM(propModal, propForm);
    });

    // ACTUALIZACIÓN DE FICHA DETALLE CON BOTONES DE EDITAR Y BORRAR
    window.viewPropertyDetails = (id) => {
        const prop = properties.find(p => p.id === id);
        if (!prop) return;

        const formattedPrice = formatCurrency(prop.price, prop.type);
        const imagesList = (prop.images && prop.images.length > 0) ? prop.images : [prop.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'];
        
        const fullAddressQuery = encodeURIComponent(`${prop.address}, ${prop.city}, ${prop.subdivision}, ${prop.country}`);
        const googleMapsEmbedUrl = prop.lat && prop.lng 
            ? `https://maps.google.com/maps?q=${prop.lat},${prop.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`
            : `https://maps.google.com/maps?q=${fullAddressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        const googleMapsDirectUrl = `https://www.google.com/maps/search/?api=1&query=${fullAddressQuery}`;

        detailContent.innerHTML = `
            <div class="gallery-container">
                <img src="${imagesList[0]}" id="gallery-active-img" class="gallery-main-img" alt="${prop.address}">
                <div class="gallery-thumbs no-print">
                    ${imagesList.map((img, idx) => `
                        <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="switchGalleryImg('${img}', this)" alt="Thumbnail ${idx + 1}">
                    `).join('')}
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span class="property-location-tag" style="font-size: 0.8rem;">📍 ${prop.city || 'Ubicación'}, ${prop.subdivision || ''} (${prop.country || 'LATAM'})</span>
                <div class="no-print" style="display: flex; gap: 6px;">
                    <button class="btn-icon-action" onclick="openEditPropertyModal(${prop.id})" title="Editar Propiedad">✏️</button>
                    <button class="btn-icon-action delete" onclick="deleteProperty(${prop.id})" title="Eliminar Propiedad">🗑️</button>
                </div>
            </div>

            <h4 style="font-size: 1.35rem; color: var(--brand-green); margin: 4px 0;">${formattedPrice}</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 12px;">${prop.address}</p>
            
            <div class="detail-meta-grid">
                <div class="detail-meta-item"><strong>Tipo</strong><span>${prop.category}</span></div>
                <div class="detail-meta-item"><strong>Operación</strong><span>${prop.type}</span></div>
                <div class="detail-meta-item"><strong>Habitaciones</strong><span>${prop.beds}</span></div>
                <div class="detail-meta-item"><strong>Baños</strong><span>${prop.baths}</span></div>
                <div class="detail-meta-item"><strong>Estacionamiento</strong><span>${prop.parking || 0} puestos</span></div>
                <div class="detail-meta-item"><strong>Construcción</strong><span>${prop.sqmBuild || 0} m²</span></div>
                <div class="detail-meta-item"><strong>Terreno Total</strong><span>${prop.sqmLot || 0} m²</span></div>
                <div class="detail-meta-item"><strong>Coordenadas GPS</strong><span style="font-size: 0.78rem;">${prop.lat || 0}, ${prop.lng || 0}</span></div>
            </div>

            <div style="margin-top: 10px;">
                <strong style="font-size: 0.8rem; color: var(--text-muted);">Amenities:</strong>
                <p style="font-size: 0.88rem; margin-top: 4px;">
                    ${[prop.pool ? 'Piscina' : null, prop.pets ? 'Acepta Mascotas' : null, prop.furnished ? 'Amoblado' : null].filter(Boolean).join(' • ') || 'Sin extras especificados'}
                </p>
            </div>

            <div class="embedded-map-container no-print">
                <div class="map-header-row">
                    <strong style="font-size: 0.8rem; color: var(--text-muted);">Ubicación Exacta:</strong>
                    <a href="${googleMapsDirectUrl}" target="_blank" class="btn-gmaps-link">
                        🗺️ Abrir en Google Maps
                    </a>
                </div>
                <iframe class="embedded-map-frame" src="${googleMapsEmbedUrl}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        `;

        detailWhatsAppBtn.onclick = () => sendWhatsApp(encodeURIComponent(prop.address), formattedPrice);
        detailsModal.style.display = 'flex';
    };
