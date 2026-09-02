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
    // 2. DICCIONARIO DE LOCALIZACIÓN DINÁMICA (LATAM)
    // ==========================================
    const latamLocations = {
        "Venezuela": {
            subdivName: "Estado",
            cityName: "Municipio / Ciudad",
            subdivisions: {
                "Táchira": ["San Cristóbal", "Táriba", "Palo Gordo", "Rubio", "San Antonio"],
                "Miranda": ["Chacao", "Baruta", "El Hatillo", "Los Teques", "Guatire"],
                "Distrito Capital": ["Caracas", "Libertador"],
                "Carabobo": ["Valencia", "Naguanagua", "San Diego", "Puerto Cabello"],
                "Zulia": ["Maracaibo", "San Francisco", "Cabimas"]
            }
        },
        "Colombia": {
            subdivName: "Departamento",
            cityName: "Ciudad / Municipio",
            subdivisions: {
                "Cundinamarca": ["Bogotá", "Chía", "Zipaquirá", "Soacha", "Cota"],
                "Antioquia": ["Medellín", "Envigado", "El Poblado", "Rionegro", "Sabaneta"],
                "Valle del Cauca": ["Cali", "Palmira", "Buga", "Yumbo"],
                "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"],
                "Bolívar": ["Cartagena", "Turbaco", "Magangué"]
            }
        },
        "México": {
            subdivName: "Estado",
            cityName: "Municipio / Alcaldía",
            subdivisions: {
                "CDMX": ["Cuauhtémoc", "Benito Juárez", "Miguel Hidalgo", "Coyoacán", "Polanco"],
                "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Puerto Vallarta"],
                "Nuevo León": ["Monterrey", "San Pedro Garza García", "San Nicolás", "Guadalupe"],
                "Quintana Roo": ["Cancún", "Playa del Carmen", "Tulum"]
            }
        },
        "Argentina": {
            subdivName: "Provincia",
            cityName: "Ciudad / Partido",
            subdivisions: {
                "Buenos Aires": ["CABA (Palermo)", "CABA (Recoleta)", "San Isidro", "Vicente López", "La Plata"],
                "Córdoba": ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto"],
                "Santa Fe": ["Rosario", "Santa Fe Capital"]
            }
        },
        "Chile": {
            subdivName: "Región",
            cityName: "Comuna / Ciudad",
            subdivisions: {
                "Región Metropolitana": ["Santiago Centro", "Las Condes", "Providencia", "Vitacura", "Ñuñoa"],
                "Valparaíso": ["Viña del Mar", "Valparaíso", "Concón"]
            }
        },
        "Perú": {
            subdivName: "Departamento",
            cityName: "Provincia / Distrito",
            subdivisions: {
                "Lima": ["Miraflores", "San Isidro", "Santiago de Surco", "Barranco", "San Borja"],
                "Arequipa": ["Arequipa", "Yanahuara", "Cayma"],
                "Cusco": ["Cusco", "Wanchaq", "San Jerónimo"]
            }
        }
    };

    // ==========================================
    // 3. BASE DE DATOS INICIAL (30 PROPIEDADES)
    // ==========================================
    const defaultProperties = [
        {
            id: 1,
            category: "Apartamento",
            price: 120000,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "San Cristóbal",
            address: "Av. Ferrero Tamayo, Edificio Altamira Suite 4B",
            beds: 3,
            baths: 2,
            parking: 2,
            sqmBuild: 135,
            sqmLot: 135,
            pool: false,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 2,
            category: "Casa",
            price: 850,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "San Cristóbal",
            address: "Residencias El Bosque, Calle Los Pinos #12",
            beds: 2,
            baths: 2,
            parking: 1,
            sqmBuild: 90,
            sqmLot: 180,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 3,
            category: "Townhouse",
            price: 240000,
            country: "Venezuela",
            subdivision: "Miranda",
            city: "Chacao",
            address: "Conjunto Residencial Las Villas, Casa 8",
            beds: 4,
            baths: 3.5,
            parking: 3,
            sqmBuild: 280,
            sqmLot: 320,
            pool: true,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 4,
            category: "Apartamento",
            price: 65000,
            country: "Venezuela",
            subdivision: "Carabobo",
            city: "Valencia",
            address: "Edificio Vista Real, El Viñedo, Piso 6, Apto 62",
            beds: 2,
            baths: 1,
            parking: 1,
            sqmBuild: 68,
            sqmLot: 68,
            pool: false,
            pets: false,
            furnished: true,
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 5,
            category: "Casa",
            price: 340000,
            country: "Venezuela",
            subdivision: "Distrito Capital",
            city: "Caracas",
            address: "Urbanización Alto Prado, Quinta Bella Vista",
            beds: 5,
            baths: 4.5,
            parking: 4,
            sqmBuild: 410,
            sqmLot: 650,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 6,
            category: "Apartamento",
            price: 450,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "Táriba",
            address: "Centro Urbano, Torres del Parque 3A",
            beds: 1,
            baths: 1,
            parking: 1,
            sqmBuild: 48,
            sqmLot: 48,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 7,
            category: "Local",
            price: 180000,
            country: "Colombia",
            subdivision: "Antioquia",
            city: "Medellín",
            address: "Centro Comercial El Tesoro, Nivel 1, Local 14",
            beds: 0,
            baths: 1,
            parking: 2,
            sqmBuild: 85,
            sqmLot: 85,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 8,
            category: "Terreno",
            price: 95000,
            country: "Colombia",
            subdivision: "Cundinamarca",
            city: "Chía",
            address: "Sector La Campiña, Parcela B-12",
            beds: 0,
            baths: 0,
            parking: 0,
            sqmBuild: 0,
            sqmLot: 850,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 9,
            category: "Apartamento",
            price: 165000,
            country: "Colombia",
            subdivision: "Antioquia",
            city: "El Poblado",
            address: "Torre Horizon, Penthouse 1402",
            beds: 3,
            baths: 3,
            parking: 2,
            sqmBuild: 190,
            sqmLot: 190,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 10,
            category: "Casa",
            price: 1500,
            country: "Colombia",
            subdivision: "Cundinamarca",
            city: "Bogotá",
            address: "Usaquén, Calle 119 #5-20, Casa Colonial",
            beds: 3,
            baths: 3,
            parking: 2,
            sqmBuild: 210,
            sqmLot: 300,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 11,
            category: "Townhouse",
            price: 195000,
            country: "Colombia",
            subdivision: "Santander",
            city: "Bucaramanga",
            address: "Residencias Cabecera, Módulo 3, Casa 11",
            beds: 3,
            baths: 2.5,
            parking: 2,
            sqmBuild: 165,
            sqmLot: 190,
            pool: false,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 12,
            category: "Apartamento",
            price: 550,
            country: "Colombia",
            subdivision: "Valle del Cauca",
            city: "Cali",
            address: "Ciudad Jardín, Edificio Primavera 2B",
            beds: 2,
            baths: 1.5,
            parking: 1,
            sqmBuild: 75,
            sqmLot: 75,
            pool: false,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 13,
            category: "Casa",
            price: 420000,
            country: "México",
            subdivision: "CDMX",
            city: "Polanco",
            address: "Campos Elíseos, Mansión Los Robles",
            beds: 6,
            baths: 5,
            parking: 6,
            sqmBuild: 560,
            sqmLot: 1200,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 14,
            category: "Local",
            price: 1200,
            country: "México",
            subdivision: "Jalisco",
            city: "Guadalajara",
            address: "Avenida Chapultepec Sur, Local 4",
            beds: 0,
            baths: 2,
            parking: 1,
            sqmBuild: 110,
            sqmLot: 110,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 15,
            category: "Apartamento",
            price: 98000,
            country: "México",
            subdivision: "Nuevo León",
            city: "Monterrey",
            address: "San Jerónimo, Torre Norte 8C",
            beds: 2,
            baths: 2,
            parking: 1,
            sqmBuild: 88,
            sqmLot: 88,
            pool: false,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 16,
            category: "Terreno",
            price: 145000,
            country: "México",
            subdivision: "Quintana Roo",
            city: "Tulum",
            address: "Región 15, Lote Ecoturístico 45",
            beds: 0,
            baths: 0,
            parking: 0,
            sqmBuild: 0,
            sqmLot: 2400,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 17,
            category: "Apartamento",
            price: 1400,
            country: "México",
            subdivision: "CDMX",
            city: "Cuauhtémoc",
            address: "Colonia Roma Norte, Edificio Grand View 11A",
            beds: 3,
            baths: 3,
            parking: 2,
            sqmBuild: 160,
            sqmLot: 160,
            pool: true,
            pets: false,
            furnished: true,
            image: "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 18,
            category: "Casa",
            price: 175000,
            country: "Argentina",
            subdivision: "Buenos Aires",
            city: "San Isidro",
            address: "Las Lomas de San Isidro, Casa 104",
            beds: 4,
            baths: 2,
            parking: 2,
            sqmBuild: 220,
            sqmLot: 280,
            pool: false,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 19,
            category: "Townhouse",
            price: 1250,
            country: "Argentina",
            subdivision: "Buenos Aires",
            city: "CABA (Palermo)",
            address: "Palermo Soho, Pasaje Russell, TH-19",
            beds: 3,
            baths: 2.5,
            parking: 2,
            sqmBuild: 175,
            sqmLot: 210,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 20,
            category: "Apartamento",
            price: 78000,
            country: "Argentina",
            subdivision: "Córdoba",
            city: "Córdoba Capital",
            address: "Nueva Córdoba, Calle Obispo Trejo, Torre 2",
            beds: 2,
            baths: 2,
            parking: 1,
            sqmBuild: 78,
            sqmLot: 78,
            pool: false,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 21,
            category: "Casa",
            price: 285000,
            country: "Chile",
            subdivision: "Región Metropolitana",
            city: "Las Condes",
            address: "Avenida Las Condes #12500, Casa 45",
            beds: 4,
            baths: 3,
            parking: 3,
            sqmBuild: 310,
            sqmLot: 450,
            pool: true,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 22,
            category: "Local",
            price: 750,
            country: "Chile",
            subdivision: "Región Metropolitana",
            city: "Providencia",
            address: "Avenida Providencia, Oficina 302",
            beds: 0,
            baths: 1,
            parking: 1,
            sqmBuild: 55,
            sqmLot: 55,
            pool: false,
            pets: false,
            furnished: true,
            image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 23,
            category: "Apartamento",
            price: 210000,
            country: "Chile",
            subdivision: "Valparaíso",
            city: "Viña del Mar",
            address: "Avenida Perú, Torre Platinum 901",
            beds: 3,
            baths: 3.5,
            parking: 2,
            sqmBuild: 185,
            sqmLot: 185,
            pool: true,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 24,
            category: "Casa",
            price: 680,
            country: "Perú",
            subdivision: "Arequipa",
            city: "Yanahuara",
            address: "Calle Los Cedros 204, Casa 7",
            beds: 2,
            baths: 1,
            parking: 1,
            sqmBuild: 80,
            sqmLot: 150,
            pool: false,
            pets: true,
            furnished: false,
            image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 25,
            category: "Terreno",
            price: 60000,
            country: "Perú",
            subdivision: "Cusco",
            city: "San Jerónimo",
            address: "Valle Sagrado, Lote 18",
            beds: 0,
            baths: 0,
            parking: 0,
            sqmBuild: 0,
            sqmLot: 500,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 26,
            category: "Townhouse",
            price: 320000,
            country: "Perú",
            subdivision: "Lima",
            city: "Miraflores",
            address: "Malecón de la Reserva, TH-01",
            beds: 4,
            baths: 4,
            parking: 3,
            sqmBuild: 340,
            sqmLot: 390,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 27,
            category: "Apartamento",
            price: 89000,
            country: "Perú",
            subdivision: "Lima",
            city: "San Isidro",
            address: "Calle Los Conquistadores, Apto 5B",
            beds: 3,
            baths: 2,
            parking: 1,
            sqmBuild: 95,
            sqmLot: 95,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 28,
            category: "Casa",
            price: 2200,
            country: "Colombia",
            subdivision: "Bolívar",
            city: "Cartagena",
            address: "Ciudad Amurallada, Quinta Coral",
            beds: 4,
            baths: 4.5,
            parking: 3,
            sqmBuild: 350,
            sqmLot: 500,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
            type: "Alquiler"
        },
        {
            id: 29,
            category: "Local",
            price: 350000,
            country: "México",
            subdivision: "Nuevo León",
            city: "San Pedro Garza García",
            address: "Calzada del Valle, Edificio Corporativo",
            beds: 0,
            baths: 4,
            parking: 6,
            sqmBuild: 420,
            sqmLot: 420,
            pool: false,
            pets: false,
            furnished: false,
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
            type: "Venta"
        },
        {
            id: 30,
            category: "Apartamento",
            price: 155000,
            country: "Venezuela",
            subdivision: "Miranda",
            city: "Baruta",
            address: "Las Mercedes, Torre Santa María, Piso 8",
            beds: 3,
            baths: 2.5,
            parking: 2,
            sqmBuild: 142,
            sqmLot: 142,
            pool: true,
            pets: true,
            furnished: true,
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
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

    let savedProps = JSON.parse(localStorage.getItem('inmo_properties'));
    let properties = (savedProps && savedProps.length >= 10 && savedProps[0].country) ? savedProps : defaultProperties;
    localStorage.setItem('inmo_properties', JSON.stringify(properties));

    let leads = JSON.parse(localStorage.getItem('inmo_leads')) || defaultLeads;

    function formatCurrency(val, type) {
        return `$${Number(val).toLocaleString('en-US')}${type === 'Alquiler' ? ' / mes' : ''}`;
    }

    // ==========================================
    // 4. CONTROLADORES DE LOCALIZACIÓN DINÁMICA
    // ==========================================
    const filterCountry = document.getElementById('filter-country');
    const filterSubdivContainer = document.getElementById('filter-subdiv-container');
    const filterSubdivLabel = document.getElementById('filter-subdiv-label');
    const filterSubdivision = document.getElementById('filter-subdivision');
    const filterCityContainer = document.getElementById('filter-city-container');
    const filterCityLabel = document.getElementById('filter-city-label');
    const filterCity = document.getElementById('filter-city');

    const propCountry = document.getElementById('prop-country');
    const propSubdivLabel = document.getElementById('prop-subdiv-label');
    const propSubdivision = document.getElementById('prop-subdivision');
    const propCityLabel = document.getElementById('prop-city-label');
    const propCity = document.getElementById('prop-city');

    function updateLocationSelectors(countryVal, subdivLabelEl, subdivSelectEl, cityLabelEl, citySelectEl, isFilter = true) {
        if (!countryVal || !latamLocations[countryVal]) {
            if (isFilter) {
                filterSubdivContainer.style.display = 'none';
                filterCityContainer.style.display = 'none';
            }
            subdivSelectEl.innerHTML = '<option value="">Todos</option>';
            citySelectEl.innerHTML = '<option value="">Todas</option>';
            return;
        }

        const countryData = latamLocations[countryVal];
        subdivLabelEl.textContent = countryData.subdivName;
        cityLabelEl.textContent = countryData.cityName;

        if (isFilter) {
            filterSubdivContainer.style.display = 'flex';
            filterCityContainer.style.display = 'none';
        }

        subdivSelectEl.innerHTML = isFilter ? `<option value="">Todos los ${countryData.subdivName.toLowerCase()}s</option>` : '';
        Object.keys(countryData.subdivisions).forEach(subdiv => {
            const opt = document.createElement('option');
            opt.value = subdiv;
            opt.textContent = subdiv;
            subdivSelectEl.appendChild(opt);
        });

        updateCitySelector(countryVal, subdivSelectEl.value, cityLabelEl, citySelectEl, isFilter);
    }

    function updateCitySelector(countryVal, subdivVal, cityLabelEl, citySelectEl, isFilter = true) {
        if (!countryVal || !subdivVal || !latamLocations[countryVal] || !latamLocations[countryVal].subdivisions[subdivVal]) {
            if (isFilter) filterCityContainer.style.display = 'none';
            citySelectEl.innerHTML = '<option value="">Todas</option>';
            return;
        }

        const countryData = latamLocations[countryVal];
        const cities = countryData.subdivisions[subdivVal];

        if (isFilter) filterCityContainer.style.display = 'flex';
        citySelectEl.innerHTML = isFilter ? `<option value="">Todas las ${countryData.cityName.toLowerCase()}s</option>` : '';

        cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            citySelectEl.appendChild(opt);
        });
    }

    filterCountry.addEventListener('change', () => {
        updateLocationSelectors(filterCountry.value, filterSubdivLabel, filterSubdivision, filterCityLabel, filterCity, true);
        renderProperties();
    });

    filterSubdivision.addEventListener('change', () => {
        updateCitySelector(filterCountry.value, filterSubdivision.value, filterCityLabel, filterCity, true);
        renderProperties();
    });

    filterCity.addEventListener('change', renderProperties);

    propCountry.addEventListener('change', () => {
        updateLocationSelectors(propCountry.value, propSubdivLabel, propSubdivision, propCityLabel, propCity, false);
    });

    propSubdivision.addEventListener('change', () => {
        updateCitySelector(propCountry.value, propSubdivision.value, propCityLabel, propCity, false);
    });

    updateLocationSelectors('Venezuela', propSubdivLabel, propSubdivision, propCityLabel, propCity, false);

    // ==========================================
    // 5. MOTOR DE FILTRADO Y AMENITIES CONTEXTUALES
    // ==========================================
    const grid = document.getElementById('property-grid');
    const filteredCountBadge = document.getElementById('filtered-count-badge');
    const globalSearch = document.getElementById('global-search');

    const histogramBarsContainer = document.getElementById('histogram-bars');
    const rangeSliderMin = document.getElementById('range-slider-min');
    const rangeSliderMax = document.getElementById('range-slider-max');
    const labelMinPrice = document.getElementById('label-min-price');
    const labelMaxPrice = document.getElementById('label-max-price');

    const filterMinPrice = document.getElementById('filter-min-price');
    const filterMaxPrice = document.getElementById('filter-max-price');
    const filterMinSqmBuild = document.getElementById('filter-min-sqm-build');
    const filterMaxSqmBuild = document.getElementById('filter-max-sqm-build');
    const filterMinSqmLot = document.getElementById('filter-min-sqm-lot');
    const filterMaxSqmLot = document.getElementById('filter-max-sqm-lot');

    const filterPool = document.getElementById('filter-pool');
    const filterPets = document.getElementById('filter-pets');
    const containerFilterPets = document.getElementById('container-filter-pets');
    const filterFurnished = document.getElementById('filter-furnished');
    const btnClearAllFilters = document.getElementById('btn-clear-all-filters');

    const HISTOGRAM_BUCKETS = 20;
    const MAX_RANGE_LIMIT = 500000;

    // Control de Tags de Operación y Amenity Contextual
    const opTags = document.querySelectorAll('#filter-operation-tags .op-tag');
    let selectedOperation = "";

    opTags.forEach(tag => {
        tag.addEventListener('click', () => {
            opTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedOperation = tag.getAttribute('data-val');

            // Lógica de Amenity Contextual (Mascotas solo aplica para Alquiler o Todas)
            if (selectedOperation === 'Venta') {
                if (containerFilterPets) containerFilterPets.style.display = 'none';
                if (filterPets) filterPets.checked = false;
            } else {
                if (containerFilterPets) containerFilterPets.style.display = 'flex';
            }

            renderProperties();
        });
    });

    function renderHistogram(currentMin, currentMax) {
        if (!histogramBarsContainer) return;
        histogramBarsContainer.innerHTML = '';

        const bucketSize = MAX_RANGE_LIMIT / HISTOGRAM_BUCKETS;
        const counts = new Array(HISTOGRAM_BUCKETS).fill(0);

        properties.forEach(p => {
            const bucketIndex = Math.min(Math.floor(p.price / bucketSize), HISTOGRAM_BUCKETS - 1);
            counts[bucketIndex]++;
        });

        const maxCount = Math.max(...counts, 1);

        counts.forEach((count, i) => {
            const bucketPriceMin = i * bucketSize;
            const bucketPriceMax = (i + 1) * bucketSize;
            const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 15) : 6;

            const bar = document.createElement('div');
            bar.className = 'histogram-bar';
            bar.style.height = `${heightPct}%`;

            const inRange = bucketPriceMax >= currentMin && bucketPriceMin <= currentMax;
            if (inRange && count > 0) {
                bar.classList.add('active');
            }

            histogramBarsContainer.appendChild(bar);
        });
    }

    function syncPriceSlidersAndInputs(source) {
        let minVal = parseFloat(rangeSliderMin.value);
        let maxVal = parseFloat(rangeSliderMax.value);

        if (source === 'slider') {
            if (minVal > maxVal) {
                const temp = minVal;
                minVal = maxVal;
                maxVal = temp;
            }
            filterMinPrice.value = minVal === 0 ? '' : minVal;
            filterMaxPrice.value = maxVal === MAX_RANGE_LIMIT ? '' : maxVal;
        } else if (source === 'input') {
            minVal = filterMinPrice.value ? parseFloat(filterMinPrice.value) : 0;
            maxVal = filterMaxPrice.value ? parseFloat(filterMaxPrice.value) : MAX_RANGE_LIMIT;
            rangeSliderMin.value = Math.min(minVal, MAX_RANGE_LIMIT);
            rangeSliderMax.value = Math.min(maxVal, MAX_RANGE_LIMIT);
        }

        labelMinPrice.textContent = `$${Number(minVal).toLocaleString('en-US')}`;
        labelMaxPrice.textContent = maxVal >= MAX_RANGE_LIMIT ? `$500K+` : `$${Number(maxVal).toLocaleString('en-US')}`;

        renderHistogram(minVal, maxVal);
        renderProperties();
    }

    if (rangeSliderMin && rangeSliderMax) {
        rangeSliderMin.addEventListener('input', () => syncPriceSlidersAndInputs('slider'));
        rangeSliderMax.addEventListener('input', () => syncPriceSlidersAndInputs('slider'));
    }

    if (filterMinPrice && filterMaxPrice) {
        filterMinPrice.addEventListener('input', () => syncPriceSlidersAndInputs('input'));
        filterMaxPrice.addEventListener('input', () => syncPriceSlidersAndInputs('input'));
    }

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
        const valCountry = filterCountry.value;
        const valSubdiv = filterSubdivision.value;
        const valCity = filterCity.value;
        const valType = getSelectedFacet('facet-type');
        const valOp = selectedOperation;

        const minPrice = filterMinPrice && filterMinPrice.value ? parseFloat(filterMinPrice.value) : 0;
        const maxPrice = filterMaxPrice && filterMaxPrice.value ? parseFloat(filterMaxPrice.value) : Infinity;

        const bedsVal = getPillValue('filter-beds-pills');
        const minBeds = bedsVal ? parseInt(bedsVal, 10) : 0;

        const bathsVal = getPillValue('filter-baths-pills');
        const minBaths = bathsVal ? parseFloat(bathsVal) : 0;

        const parkingVal = getPillValue('filter-parking-pills');
        const minParking = parkingVal ? parseInt(parkingVal, 10) : 0;

        const minSqmBuild = filterMinSqmBuild && filterMinSqmBuild.value ? parseFloat(filterMinSqmBuild.value) : 0;
        const maxSqmBuild = filterMaxSqmBuild && filterMaxSqmBuild.value ? parseFloat(filterMaxSqmBuild.value) : Infinity;

        const minSqmLot = filterMinSqmLot && filterMinSqmLot.value ? parseFloat(filterMinSqmLot.value) : 0;
        const maxSqmLot = filterMaxSqmLot && filterMaxSqmLot.value ? parseFloat(filterMaxSqmLot.value) : Infinity;

        const reqPool = filterPool ? filterPool.checked : false;
        const reqPets = (valOp !== 'Venta' && filterPets) ? filterPets.checked : false;
        const reqFurnished = filterFurnished ? filterFurnished.checked : false;

        const filtered = properties.filter(prop => {
            const matchesSearch = !valSearch || 
                prop.address.toLowerCase().includes(valSearch) || 
                prop.category.toLowerCase().includes(valSearch) ||
                (prop.city && prop.city.toLowerCase().includes(valSearch));

            const matchesCountry = !valCountry || prop.country === valCountry;
            const matchesSubdiv = !valSubdiv || prop.subdivision === valSubdiv;
            const matchesCity = !valCity || prop.city === valCity;

            const matchesType = !valType || prop.category === valType;
            const matchesOp = !valOp || prop.type === valOp;
            const matchesPrice = prop.price >= minPrice && prop.price <= maxPrice;

            const matchesBeds = prop.beds >= minBeds;
            const matchesBaths = prop.baths >= minBaths;
            const matchesParking = (prop.parking || 0) >= minParking;

            const matchesSqmBuild = (prop.sqmBuild || 0) >= minSqmBuild && (prop.sqmBuild || 0) <= maxSqmBuild;
            const matchesSqmLot = (prop.sqmLot || 0) >= minSqmLot && (prop.sqmLot || 0) <= maxSqmLot;

            const matchesPool = !reqPool || prop.pool === true;
            const matchesPets = !reqPets || prop.pets === true;
            const matchesFurnished = !reqFurnished || prop.furnished === true;

            return matchesSearch && matchesCountry && matchesSubdiv && matchesCity &&
                   matchesType && matchesOp && matchesPrice &&
                   matchesBeds && matchesBaths && matchesParking &&
                   matchesSqmBuild && matchesSqmLot &&
                   matchesPool && matchesPets && matchesFurnished;
        });

        grid.innerHTML = '';
        if (filteredCountBadge) {
            filteredCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'inmueble disponible' : 'inmuebles disponibles'}`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; padding: 30px 0; text-align: center;">No hay propiedades coincidentes con estos filtros.</p>';
        } else {
            filtered.forEach(prop => {
                const isVenta = prop.type === 'Venta';
                const badgeClass = isVenta ? 'status-active' : 'status-rent';
                const defaultImg = isVenta ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80';
                
                const card = document.createElement('article');
                card.className = 'property-card';
                card.innerHTML = `
                    <div class="card-media">
                        <span class="status-badge ${badgeClass}">En ${prop.type}</span>
                        <span class="category-tag">${prop.category || 'Inmueble'}</span>
                        <img src="${prop.image || defaultImg}" alt="${prop.address}" class="card-img" onerror="this.src='${defaultImg}'">
                    </div>
                    <div class="card-body">
                        <span class="property-location-tag">📍 ${prop.city || 'Ubicación'}, ${prop.country || 'LATAM'}</span>
                        <h3 class="property-price">${formatCurrency(prop.price, prop.type)}</h3>
                        <p class="property-address">${prop.address}</p>
                        
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

    [filterMinSqmBuild, filterMaxSqmBuild, filterMinSqmLot, filterMaxSqmLot].forEach(input => {
        if (input) input.addEventListener('input', renderProperties);
    });

    [filterPool, filterPets, filterFurnished].forEach(chk => {
        if (chk) chk.addEventListener('change', renderProperties);
    });

    if (btnClearAllFilters) {
        btnClearAllFilters.addEventListener('click', () => {
            filterCountry.value = '';
            filterSubdivision.innerHTML = '<option value="">Todos</option>';
            filterCity.innerHTML = '<option value="">Todas</option>';
            filterSubdivContainer.style.display = 'none';
            filterCityContainer.style.display = 'none';

            opTags.forEach(t => t.classList.remove('active'));
            document.querySelector('#filter-operation-tags .op-tag[data-val=""]').classList.add('active');
            selectedOperation = "";
            if (containerFilterPets) containerFilterPets.style.display = 'flex';

            const defaultType = document.querySelector('input[name="facet-type"][value=""]');
            if (defaultType) defaultType.checked = true;

            [filterMinSqmBuild, filterMaxSqmBuild, filterMinSqmLot, filterMaxSqmLot].forEach(i => { if (i) i.value = ''; });
            [filterPool, filterPets, filterFurnished].forEach(c => { if (c) c.checked = false; });

            if (rangeSliderMin) rangeSliderMin.value = 0;
            if (rangeSliderMax) rangeSliderMax.value = MAX_RANGE_LIMIT;
            if (filterMinPrice) filterMinPrice.value = '';
            if (filterMaxPrice) filterMaxPrice.value = '';

            ['filter-beds-pills', 'filter-baths-pills', 'filter-parking-pills'].forEach(id => {
                const btns = document.querySelectorAll(`#${id} .pill-btn`);
                btns.forEach(b => b.classList.remove('active'));
                const first = document.querySelector(`#${id} .pill-btn[data-val=""]`);
                if (first) first.classList.add('active');
            });

            if (globalSearch) globalSearch.value = '';
            syncPriceSlidersAndInputs('slider');
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
    // 6. DETALLE MODAL
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
        const defaultImg = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
        
        detailContent.innerHTML = `
            <img src="${prop.image || defaultImg}" alt="${prop.address}" class="detail-img-preview" onerror="this.src='${defaultImg}'">
            <span class="property-location-tag" style="font-size: 0.8rem;">📍 ${prop.city || 'Ubicación'}, ${prop.subdivision || ''} (${prop.country || 'LATAM'})</span>
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
    // 7. KANBAN LEADS
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
    // 8. STATS DASHBOARD
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
    // 9. SPA NAVIGATION & DRAWER MOBILE
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
            if (targetId === 'view-inventory') {
                renderHistogram(0, MAX_RANGE_LIMIT);
                renderProperties();
            }
            if (targetId === 'view-leads') renderLeads();

            closeMobileSidebar();
        });
    });

    // ==========================================
    // 10. MOBILE FAB '+' POPOVER
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
    // 11. FORMULARIOS Y MODALES
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
        const imgInput = document.getElementById('prop-image').value.trim();

        const newProp = {
            id: Date.now(),
            category: document.getElementById('prop-category').value,
            country: document.getElementById('prop-country').value,
            subdivision: document.getElementById('prop-subdivision').value,
            city: document.getElementById('prop-city').value,
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
            furnished: document.getElementById('prop-furnished').checked,
            image: imgInput || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
        };

        properties.push(newProp);
        localStorage.setItem('inmo_properties', JSON.stringify(properties));
        renderHistogram(0, MAX_RANGE_LIMIT);
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
    // 12. EXPORTAR / IMPORTAR BACKUP JSON
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
                    renderHistogram(0, MAX_RANGE_LIMIT);
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

    // Inicializar renders e histograma
    renderHistogram(0, MAX_RANGE_LIMIT);
    renderProperties();
    renderLeads();
});
