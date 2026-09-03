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
    // 2. FUNCIÓN DE NORMALIZACIÓN DE TEXTO (IGNORA MAYÚSCULAS/TILDES)
    // ==========================================
    function normalizeText(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // ==========================================
    // 3. DICCIONARIO DE LOCALIZACIÓN DINÁMICA
    // ==========================================
    const latamLocations = {
        "Argentina": {
            subdivName: "Provincia",
            cityName: "Ciudad / Partido",
            defaultCoords: [-34.6037, -58.3816],
            subdivisions: {
                "Buenos Aires": ["CABA (Palermo)", "CABA (Recoleta)", "San Isidro", "Vicente López", "La Plata"],
                "Córdoba": ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto"],
                "Santa Fe": ["Rosario", "Santa Fe Capital"]
            }
        },
        "Chile": {
            subdivName: "Región",
            cityName: "Comuna / Ciudad",
            defaultCoords: [-33.4489, -70.6693],
            subdivisions: {
                "Región Metropolitana": ["Santiago Centro", "Las Condes", "Providencia", "Vitacura", "Ñuñoa"],
                "Valparaíso": ["Viña del Mar", "Valparaíso", "Concón"]
            }
        },
        "Colombia": {
            subdivName: "Departamento",
            cityName: "Ciudad / Municipio",
            defaultCoords: [4.7110, -74.0721],
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
            defaultCoords: [19.4326, -99.1332],
            subdivisions: {
                "CDMX": ["Cuauhtémoc", "Benito Juárez", "Miguel Hidalgo", "Coyoacán", "Polanco"],
                "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Puerto Vallarta"],
                "Nuevo León": ["Monterrey", "San Pedro Garza García", "San Nicolás", "Guadalupe"],
                "Quintana Roo": ["Cancún", "Playa del Carmen", "Tulum"]
            }
        },
        "Perú": {
            subdivName: "Departamento",
            cityName: "Provincia / Distrito",
            defaultCoords: [-12.0464, -77.0428],
            subdivisions: {
                "Lima": ["Miraflores", "San Isidro", "Santiago de Surco", "Barranco", "San Borja"],
                "Arequipa": ["Arequipa", "Yanahuara", "Cayma"],
                "Cusco": ["Cusco", "Wanchaq", "San Jerónimo"]
            }
        },
        "Uruguay": {
            subdivName: "Departamento",
            cityName: "Ciudad / Barrio",
            defaultCoords: [-34.9011, -56.1645],
            subdivisions: {
                "Montevideo": ["Pocitos", "Carrasco", "Punta Carretas", "Buceo", "Cordón"],
                "Maldonado": ["Punta del Este", "Maldonado", "Piriápolis"],
                "Canelones": ["Ciudad de la Costa", "Atlántida"]
            }
        },
        "Venezuela": {
            subdivName: "Estado",
            cityName: "Municipio / Ciudad",
            defaultCoords: [7.7885, -72.2156],
            subdivisions: {
                "Táchira": ["San Cristóbal", "Táriba", "Palo Gordo", "Rubio", "San Antonio"],
                "Miranda": ["Chacao", "Baruta", "El Hatillo", "Los Teques", "Guatire"],
                "Distrito Capital": ["Caracas", "Libertador"],
                "Carabobo": ["Valencia", "Naguanagua", "San Diego", "Puerto Cabello"],
                "Zulia": ["Maracaibo", "San Francisco", "Cabimas"]
            }
        }
    };

    // ==========================================
    // 4. BASE DE DATOS INICIAL (30 PROPIEDADES REALES)
    // ==========================================
    const defaultProperties = [
        {
            id: 1,
            category: "Apartamento",
            price: 120000,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "San Cristóbal",
            address: "Av. Ferrero Tamayo, Residencias Altamira Suite, Pueblo Nuevo",
            lat: 7.7885,
            lng: -72.2156,
            beds: 3,
            baths: 2,
            parking: 2,
            sqmBuild: 135,
            sqmLot: 135,
            pool: false,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 2,
            category: "Casa",
            price: 850,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "San Cristóbal",
            address: "Urb. Las Lomas, Calle Principal #14-22, Qta. Villa Real",
            lat: 7.7812,
            lng: -72.2289,
            beds: 3,
            baths: 2.5,
            parking: 2,
            sqmBuild: 180,
            sqmLot: 240,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 3,
            category: "Apartamento",
            price: 70000,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "San Cristóbal",
            address: "Altos de Pirineos, Av. Principal, Res. Terrazas del Este",
            lat: 7.7715,
            lng: -72.2140,
            beds: 2,
            baths: 2,
            parking: 1,
            sqmBuild: 88,
            sqmLot: 88,
            pool: false,
            pets: false,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1502005229762-ee152da915d6?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 4,
            category: "Townhouse",
            price: 165000,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "San Cristóbal",
            address: "Av. 19 de Abril, Conjunto Residencial Santa Inés, Casa 5",
            lat: 7.7748,
            lng: -72.2215,
            beds: 4,
            baths: 3.5,
            parking: 2,
            sqmBuild: 210,
            sqmLot: 230,
            pool: true,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 5,
            category: "Townhouse",
            price: 240000,
            country: "Venezuela",
            subdivision: "Miranda",
            city: "Chacao",
            address: "Av. San Juan Bosco con 2da Transversal, Altamira Norte",
            lat: 10.4995,
            lng: -66.8512,
            beds: 4,
            baths: 3.5,
            parking: 3,
            sqmBuild: 280,
            sqmLot: 320,
            pool: true,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 6,
            category: "Apartamento",
            price: 155000,
            country: "Venezuela",
            subdivision: "Miranda",
            city: "Baruta",
            address: "Calle París con Mucuchíes, Torre Santa María, Las Mercedes",
            lat: 10.4820,
            lng: -66.8610,
            beds: 3,
            baths: 2.5,
            parking: 2,
            sqmBuild: 142,
            sqmLot: 142,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 7,
            category: "Casa",
            price: 340000,
            country: "Venezuela",
            subdivision: "Distrito Capital",
            city: "Caracas",
            address: "Calle Los Cedros, Urb. Alto Prado, Qta. Bella Vista",
            lat: 10.4430,
            lng: -66.8625,
            beds: 5,
            baths: 4.5,
            parking: 4,
            sqmBuild: 410,
            sqmLot: 650,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 8,
            category: "Apartamento",
            price: 65000,
            country: "Venezuela",
            subdivision: "Carabobo",
            city: "Valencia",
            address: "Calle 139A con Av. Monseñor Adams, El Viñedo",
            lat: 10.2180,
            lng: -68.0055,
            beds: 2,
            baths: 1,
            parking: 1,
            sqmBuild: 68,
            sqmLot: 68,
            pool: false,
            pets: false,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 9,
            category: "Apartamento",
            price: 450,
            country: "Venezuela",
            subdivision: "Táchira",
            city: "Táriba",
            address: "Av. 1 con Calle 7, Centro Urbano Táriba, Res. El Parque 3A",
            lat: 7.8180,
            lng: -72.2245,
            beds: 1,
            baths: 1,
            parking: 1,
            sqmBuild: 48,
            sqmLot: 48,
            pool: false,
            pets: false,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 10,
            category: "Local",
            price: 180000,
            country: "Colombia",
            subdivision: "Antioquia",
            city: "Medellín",
            address: "Carrera 25A #1A Sur-45, El Tesoro Parque Comercial",
            lat: 6.1985,
            lng: -75.5580,
            beds: 0,
            baths: 1,
            parking: 2,
            sqmBuild: 85,
            sqmLot: 85,
            pool: false,
            pets: false,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 11,
            category: "Apartamento",
            price: 165000,
            country: "Colombia",
            subdivision: "Antioquia",
            city: "El Poblado",
            address: "Calle 10A #34-22, Sector Provenza / El Poblado",
            lat: 6.2085,
            lng: -75.5670,
            beds: 3,
            baths: 3,
            parking: 2,
            sqmBuild: 190,
            sqmLot: 190,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 12,
            category: "Casa",
            price: 1500,
            country: "Colombia",
            subdivision: "Cundinamarca",
            city: "Bogotá",
            address: "Carrera 6 #118-20, Santa Bárbara / Usaquén",
            lat: 4.6975,
            lng: -74.0305,
            beds: 3,
            baths: 3,
            parking: 2,
            sqmBuild: 210,
            sqmLot: 300,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 13,
            category: "Terreno",
            price: 95000,
            country: "Colombia",
            subdivision: "Cundinamarca",
            city: "Chía",
            address: "Vereda La Balsa, Sector El Guaymaral Lote 12",
            lat: 4.8620,
            lng: -74.0530,
            beds: 0,
            baths: 0,
            parking: 0,
            sqmBuild: 0,
            sqmLot: 850,
            pool: false,
            pets: false,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 14,
            category: "Townhouse",
            price: 195000,
            country: "Colombia",
            subdivision: "Santander",
            city: "Bucaramanga",
            address: "Calle 48 #34-11, Cabecera del Llano",
            lat: 7.1165,
            lng: -73.1090,
            beds: 3,
            baths: 2.5,
            parking: 2,
            sqmBuild: 165,
            sqmLot: 190,
            pool: false,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 15,
            category: "Apartamento",
            price: 550,
            country: "Colombia",
            subdivision: "Valle del Cauca",
            city: "Cali",
            address: "Carrera 105 #14-30, Ciudad Jardín Sur",
            lat: 3.3680,
            lng: -76.5340,
            beds: 2,
            baths: 1.5,
            parking: 1,
            sqmBuild: 75,
            sqmLot: 75,
            pool: false,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 16,
            category: "Casa",
            price: 2200,
            country: "Colombia",
            subdivision: "Bolívar",
            city: "Cartagena",
            address: "Calle de la Mantilla #3-44, Centro Histórico Amurallado",
            lat: 10.4240,
            lng: -75.5515,
            beds: 4,
            baths: 4.5,
            parking: 3,
            sqmBuild: 350,
            sqmLot: 500,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 17,
            category: "Casa",
            price: 420000,
            country: "México",
            subdivision: "CDMX",
            city: "Polanco",
            address: "Campos Elíseos 204, Polanco V Sección, Miguel Hidalgo",
            lat: 19.4285,
            lng: -99.1930,
            beds: 6,
            baths: 5,
            parking: 6,
            sqmBuild: 560,
            sqmLot: 1200,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 18,
            category: "Apartamento",
            price: 1400,
            country: "México",
            subdivision: "CDMX",
            city: "Cuauhtémoc",
            address: "Calle Orizaba 84, Col. Roma Norte, Cuauhtémoc",
            lat: 19.4180,
            lng: -99.1595,
            beds: 3,
            baths: 3,
            parking: 2,
            sqmBuild: 160,
            sqmLot: 160,
            pool: true,
            pets: false,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 19,
            category: "Local",
            price: 1200,
            country: "México",
            subdivision: "Jalisco",
            city: "Guadalajara",
            address: "Avenida Chapultepec Sur 340, Col. Americana",
            lat: 20.6720,
            lng: -103.3685,
            beds: 0,
            baths: 2,
            parking: 1,
            sqmBuild: 110,
            sqmLot: 110,
            pool: false,
            pets: false,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 20,
            category: "Apartamento",
            price: 98000,
            country: "México",
            subdivision: "Nuevo León",
            city: "Monterrey",
            address: "Av. Anillo Periférico 101, Col. San Jerónimo",
            lat: 25.6790,
            lng: -100.3640,
            beds: 2,
            baths: 2,
            parking: 1,
            sqmBuild: 88,
            sqmLot: 88,
            pool: false,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 21,
            category: "Local",
            price: 350000,
            country: "México",
            subdivision: "Nuevo León",
            city: "San Pedro Garza García",
            address: "Calzada del Valle 400 Oriente, San Pedro Garza García",
            lat: 25.6580,
            lng: -100.3590,
            beds: 0,
            baths: 4,
            parking: 6,
            sqmBuild: 420,
            sqmLot: 420,
            pool: false,
            pets: false,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 22,
            category: "Terreno",
            price: 145000,
            country: "México",
            subdivision: "Quintana Roo",
            city: "Tulum",
            address: "Región 15, Calle 7 Poniente Lote Ecoturístico 45",
            lat: 20.2010,
            lng: -87.4720,
            beds: 0,
            baths: 0,
            parking: 0,
            sqmBuild: 0,
            sqmLot: 2400,
            pool: false,
            pets: false,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 23,
            category: "Casa",
            price: 175000,
            country: "Argentina",
            subdivision: "Buenos Aires",
            city: "San Isidro",
            address: "Calle Blanco Encalada 1200, Las Lomas de San Isidro",
            lat: -34.4820,
            lng: -58.5380,
            beds: 4,
            baths: 2,
            parking: 2,
            sqmBuild: 220,
            sqmLot: 280,
            pool: false,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 24,
            category: "Townhouse",
            price: 1250,
            country: "Argentina",
            subdivision: "Buenos Aires",
            city: "CABA (Palermo)",
            address: "Pasaje Russell 5020, Palermo Soho, CABA",
            lat: -34.5880,
            lng: -58.4285,
            beds: 3,
            baths: 2.5,
            parking: 2,
            sqmBuild: 175,
            sqmLot: 210,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 25,
            category: "Apartamento",
            price: 78000,
            country: "Argentina",
            subdivision: "Córdoba",
            city: "Córdoba Capital",
            address: "Calle Obispo Trejo 740, Nueva Córdoba",
            lat: -31.4250,
            lng: -64.1880,
            beds: 2,
            baths: 2,
            parking: 1,
            sqmBuild: 78,
            sqmLot: 78,
            pool: false,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 26,
            category: "Casa",
            price: 285000,
            country: "Chile",
            subdivision: "Región Metropolitana",
            city: "Las Condes",
            address: "Av. Las Condes 12500, Sector San Damián",
            lat: -33.3820,
            lng: -70.5250,
            beds: 4,
            baths: 3,
            parking: 3,
            sqmBuild: 310,
            sqmLot: 450,
            pool: true,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 27,
            category: "Local",
            price: 750,
            country: "Chile",
            subdivision: "Región Metropolitana",
            city: "Providencia",
            address: "Avenida Providencia 1650, Oficina 302",
            lat: -33.4265,
            lng: -70.6180,
            beds: 0,
            baths: 1,
            parking: 1,
            sqmBuild: 55,
            sqmLot: 55,
            pool: false,
            pets: false,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Alquiler"
        },
        {
            id: 28,
            category: "Apartamento",
            price: 210000,
            country: "Chile",
            subdivision: "Valparaíso",
            city: "Viña del Mar",
            address: "Avenida Perú 100, Torre Platinum Piso 9",
            lat: -33.0210,
            lng: -71.5580,
            beds: 3,
            baths: 3.5,
            parking: 2,
            sqmBuild: 185,
            sqmLot: 185,
            pool: true,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 29,
            category: "Townhouse",
            price: 320000,
            country: "Perú",
            subdivision: "Lima",
            city: "Miraflores",
            address: "Malecón de la Reserva 610, Miraflores",
            lat: -12.1320,
            lng: -77.0280,
            beds: 4,
            baths: 4,
            parking: 3,
            sqmBuild: 340,
            sqmLot: 390,
            pool: true,
            pets: true,
            furnished: true,
            images: [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        },
        {
            id: 30,
            category: "Apartamento",
            price: 190000,
            country: "Uruguay",
            subdivision: "Montevideo",
            city: "Pocitos",
            address: "Rambla República del Perú 1120, Pocitos",
            lat: -34.9140,
            lng: -56.1480,
            beds: 3,
            baths: 2,
            parking: 1,
            sqmBuild: 110,
            sqmLot: 110,
            pool: false,
            pets: true,
            furnished: false,
            images: [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
            ],
            type: "Venta"
        }
    ];

    const defaultLeads = [
        {
            id: "lead_1",
            name: "Carlos Mendoza",
            phone: "+58 414-1234567",
            intent: "Busca apto 3 habs con 2 puestos en Pueblo Nuevo",
            budget: "$100,000 - $130,000",
            status: "new",
            notes: "Interesado preferiblemente en zona alta de San Cristóbal. Disponible sábados.",
            time: "Hace 2h"
        },
        {
            id: "lead_2",
            name: "Ana Silva",
            phone: "+58 424-9876543",
            intent: "Alquiler casa c/ piscina en Las Lomas",
            budget: "$800 - $1,000 / mes",
            status: "new",
            notes: "Tiene 2 perros medianos. Requiere estacionamiento techado.",
            time: "Hace 5h"
        },
        {
            id: "lead_3",
            name: "Luis Pérez",
            phone: "+57 310-5550199",
            intent: "Interesado en Townhouse amplio en Altamira",
            budget: "$200,000 - $250,000",
            status: "contacted",
            notes: "Crédito pre-aprobado. Busca mudanza en los próximos 60 días.",
            time: "Ayer"
        }
    ];

    const defaultVisits = [
        {
            id: "visit_1",
            leadId: "lead_1",
            leadName: "Carlos Mendoza",
            leadPhone: "+58 414-1234567",
            propId: 1,
            propAddress: "Av. Ferrero Tamayo, Residencias Altamira Suite, Pueblo Nuevo",
            date: "2026-09-05",
            time: "10:30",
            notes: "Llevar ficha impresa y llaves del portón."
        },
        {
            id: "visit_2",
            leadId: "lead_2",
            leadName: "Ana Silva",
            leadPhone: "+58 424-9876543",
            propId: 2,
            propAddress: "Urb. Las Lomas, Calle Principal #14-22, Qta. Villa Real",
            date: "2026-09-06",
            time: "15:00",
            notes: "Cliente evaluará espacio del patio para mascotas."
        }
    ];

    let properties = defaultProperties;
    localStorage.setItem('inmo_properties', JSON.stringify(properties));

    let leads = JSON.parse(localStorage.getItem('inmo_leads')) || defaultLeads;
    let visits = JSON.parse(localStorage.getItem('inmo_visits')) || defaultVisits;

    function formatCurrency(val, type) {
        return `$${Number(val).toLocaleString('en-US')}${type === 'Alquiler' ? ' / mes' : ''}`;
    }

    function formatShortPrice(val) {
        const num = Number(val);
        if (num >= 1000) return `$${Math.round(num / 1000)}K`;
        return `$${num}`;
    }

    // ==========================================
    // 5. CONTROLADORES DE LOCALIZACIÓN
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
        const countryData = latamLocations[propCountry.value];
        if (countryData && pickerMap && pickerMarker) {
            pickerMap.setView(countryData.defaultCoords, 13);
            pickerMarker.setLatLng(countryData.defaultCoords);
            document.getElementById('prop-lat').value = countryData.defaultCoords[0];
            document.getElementById('prop-lng').value = countryData.defaultCoords[1];
        }
    });

    propSubdivision.addEventListener('change', () => {
        updateCitySelector(propCountry.value, propSubdivision.value, propCityLabel, propCity, false);
    });

    updateLocationSelectors('Argentina', propSubdivLabel, propSubdivision, propCityLabel, propCity, false);

    // ==========================================
    // 6. MAPA INTERACTIVO LEAFLET (SPLIT-SCREEN)
    // ==========================================
    let leafletMap = null;
    let markersLayer = null;
    let isMapPanelOpen = false;

    const btnToggleMapView = document.getElementById('btn-toggle-map-view');
    const inventoryMapPanel = document.getElementById('inventory-map-panel');
    const btnCloseMapPanel = document.getElementById('btn-close-map-panel');

    function initLeafletMap() {
        if (leafletMap) return;
        
        leafletMap = L.map('interactive-results-map', {
            zoomControl: true
        }).setView([7.7780, -72.2240], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(leafletMap);

        markersLayer = L.layerGroup().addTo(leafletMap);
    }

    function toggleMapPanel() {
        isMapPanelOpen = !isMapPanelOpen;
        if (isMapPanelOpen) {
            inventoryMapPanel.classList.add('open');
            btnToggleMapView.classList.add('active');
            btnToggleMapView.innerHTML = '<span>✕</span> Ocultar mapa';
            initLeafletMap();
            setTimeout(() => {
                leafletMap.invalidateSize();
                renderMapMarkers(lastFilteredProperties);
            }, 300);
        } else {
            inventoryMapPanel.classList.remove('open');
            btnToggleMapView.classList.remove('active');
            btnToggleMapView.innerHTML = '<span>🗺️</span> Ver mapa';
        }
    }

    if (btnToggleMapView) btnToggleMapView.addEventListener('click', toggleMapPanel);
    if (btnCloseMapPanel) btnCloseMapPanel.addEventListener('click', toggleMapPanel);

    function renderMapMarkers(propsList) {
        if (!leafletMap || !markersLayer) return;
        markersLayer.clearLayers();

        const validMarkers = [];

        propsList.forEach(prop => {
            if (!prop.lat || !prop.lng) return;

            const shortPrice = formatShortPrice(prop.price);
            const mainImg = (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80');

            const customIcon = L.divIcon({
                className: 'custom-map-icon',
                html: `<div class="map-price-badge">${shortPrice}</div>`,
                iconSize: [54, 26],
                iconAnchor: [27, 13]
            });

            const marker = L.marker([prop.lat, prop.lng], { icon: customIcon });

            const popupHtml = `
                <div class="map-popup-card">
                    <img src="${mainImg}" class="map-popup-img" alt="${prop.address}">
                    <div class="map-popup-body">
                        <span class="map-popup-price">${formatCurrency(prop.price, prop.type)}</span>
                        <h5 class="map-popup-title">${prop.address}</h5>
                        <p class="map-popup-specs">🛏️ ${prop.beds}h • 🛁 ${prop.baths}b • 📐 ${prop.sqmBuild}m²</p>
                        <button class="map-popup-btn" onclick="viewPropertyDetails(${prop.id})">Ver Ficha Completa</button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupHtml);
            markersLayer.addLayer(marker);
            validMarkers.push([prop.lat, prop.lng]);
        });

        if (validMarkers.length > 0) {
            leafletMap.fitBounds(validMarkers, { padding: [40, 40], maxZoom: 15 });
        }
    }

    // ==========================================
    // 7. MINI-MAPA SELECTOR INTERACTIVO EN MODAL
    // ==========================================
    let pickerMap = null;
    let pickerMarker = null;

    function initPickerMap(initialLat = 7.7885, initialLng = -72.2156) {
        const lat = parseFloat(initialLat) || 7.7885;
        const lng = parseFloat(initialLng) || -72.2156;

        document.getElementById('prop-lat').value = lat;
        document.getElementById('prop-lng').value = lng;

        if (!pickerMap) {
            pickerMap = L.map('modal-picker-map', {
                zoomControl: true
            }).setView([lat, lng], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(pickerMap);

            pickerMarker = L.marker([lat, lng], { draggable: true }).addTo(pickerMap);

            pickerMarker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                document.getElementById('prop-lat').value = pos.lat;
                document.getElementById('prop-lng').value = pos.lng;
            });

            pickerMap.on('click', (e) => {
                pickerMarker.setLatLng(e.latlng);
                document.getElementById('prop-lat').value = e.latlng.lat;
                document.getElementById('prop-lng').value = e.latlng.lng;
            });
        } else {
            pickerMap.setView([lat, lng], 14);
            pickerMarker.setLatLng([lat, lng]);
        }

        setTimeout(() => {
            pickerMap.invalidateSize();
        }, 200);
    }

    // ==========================================
    // 8. MOTOR DE FILTRADO Y RENDER DE PROPIEDADES
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
    let lastFilteredProperties = [];

    let selectedOperation = "";
    const opTags = document.querySelectorAll('#filter-operation-tags .tag-filter-btn');
    opTags.forEach(tag => {
        tag.addEventListener('click', () => {
            opTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedOperation = tag.getAttribute('data-val');

            if (selectedOperation === 'Venta') {
                if (containerFilterPets) containerFilterPets.style.display = 'none';
                if (filterPets) filterPets.checked = false;
            } else {
                if (containerFilterPets) containerFilterPets.style.display = 'flex';
            }

            renderProperties();
        });
    });

    let selectedCategory = "";
    const catTags = document.querySelectorAll('#filter-category-tags .tag-filter-btn');
    catTags.forEach(tag => {
        tag.addEventListener('click', () => {
            catTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            selectedCategory = tag.getAttribute('data-val');
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

    function renderProperties() {
        if (!grid) return;

        const valSearch = normalizeText(globalSearch ? globalSearch.value : '');
        const valCountry = filterCountry.value;
        const valSubdiv = filterSubdivision.value;
        const valCity = filterCity.value;
        const valType = selectedCategory;
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
                normalizeText(prop.address).includes(valSearch) || 
                normalizeText(prop.category).includes(valSearch) ||
                normalizeText(prop.city).includes(valSearch) ||
                normalizeText(prop.subdivision).includes(valSearch) ||
                normalizeText(prop.country).includes(valSearch);

            const matchesCountry = !valCountry || prop.country === valCountry;
            const matchesSubdiv = !valSubdiv || prop.subdivision === valSubdiv;
            const matchesCity = !valCity || prop.city === valCity;

            const matchesType = !valType || prop.category.toLowerCase() === valType.toLowerCase();
            const matchesOp = !valOp || prop.type.toLowerCase() === valOp.toLowerCase();
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

        lastFilteredProperties = filtered;
        grid.innerHTML = '';
        if (filteredCountBadge) {
            filteredCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'inmueble disponible' : 'inmuebles disponibles'}`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; padding: 30px 0; text-align: center;">No hay propiedades coincidentes con estos criterios.</p>';
        } else {
            filtered.forEach(prop => {
                const isVenta = prop.type === 'Venta';
                const badgeClass = isVenta ? 'status-active' : 'status-rent';
                const mainImg = (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80');
                
                const card = document.createElement('article');
                card.className = 'property-card';
                card.innerHTML = `
                    <div class="card-media">
                        <span class="status-badge ${badgeClass}">En ${prop.type}</span>
                        <span class="category-tag">${prop.category || 'Inmueble'}</span>
                        <img src="${mainImg}" alt="${prop.address}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'">
                    </div>
                    <div class="card-body">
                        <span class="property-location-tag">📍 ${prop.city || 'Ubicación'}, ${prop.country || ''}</span>
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
                        <button class="btn-whatsapp" onclick="sendWhatsApp('${encodeURIComponent(prop.address)}', '${formatCurrency(prop.price, prop.type)}')">
                            <svg class="btn-icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.59c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.52 1.1 2.52.73 2.98.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                            </svg>
                            WhatsApp
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        if (isMapPanelOpen) {
            renderMapMarkers(filtered);
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
            document.querySelector('#filter-operation-tags .tag-filter-btn[data-val=""]').classList.add('active');
            selectedOperation = "";

            catTags.forEach(t => t.classList.remove('active'));
            document.querySelector('#filter-category-tags .tag-filter-btn[data-val=""]').classList.add('active');
            selectedCategory = "";

            if (containerFilterPets) containerFilterPets.style.display = 'flex';

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
            else if (currentView === 'view-calendar') renderVisits();
        });
    }

    window.sendWhatsApp = (address, price) => {
        const text = `Hola, te comparto la información de esta propiedad: ${decodeURIComponent(address)} - Precio: ${price}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    // ==========================================
    // 9. GESTIÓN Y EDICIÓN DE PROPIEDADES
    // ==========================================
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
        document.getElementById('prop-sqm-lot').value = prop.sqmLot || 0;
        document.getElementById('prop-pool').checked = !!prop.pool;
        document.getElementById('prop-pets').checked = !!prop.pets;
        document.getElementById('prop-furnished').checked = !!prop.furnished;

        closeDetailsModal();
        openM(propModal);
        initPickerMap(prop.lat, prop.lng);
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

    // ==========================================
    // 10. DETALLE MODAL CON MAPA EMBEDDED
    // ==========================================
    const detailsModal = document.getElementById('details-modal');
    const detailContent = document.getElementById('detail-content');
    const detailWhatsAppBtn = document.getElementById('detail-whatsapp-btn');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');

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
                <span class="property-location-tag" style="font-size: 0.8rem;">📍 ${prop.city || 'Ubicación'}, ${prop.subdivision || ''} (${prop.country || ''})</span>
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
                <div class="detail-meta-item"><strong>Estado</strong><span style="color: #10b981;">Disponible</span></div>
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

    window.switchGalleryImg = (imgUrl, thumbEl) => {
        const activeImg = document.getElementById('gallery-active-img');
        if (activeImg) activeImg.src = imgUrl;
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        if (thumbEl) thumbEl.classList.add('active');
    };

    function closeDetailsModal() { detailsModal.style.display = 'none'; }
    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', closeDetailsModal);

    // ==========================================
    // 11. CIERRE DE MODALES AL HACER CLICK EN BACKDROP
    // ==========================================
    const allModals = document.querySelectorAll('.modal-backdrop');
    allModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                const form = modal.querySelector('form');
                if (form) form.reset();
                if (propEditId) propEditId.value = '';
                if (propModalTitle) propModalTitle.textContent = 'Agregar Nueva Propiedad';
            }
        });
    });

    // ==========================================
    // 12. MOTOR DE MATCHING INTELIGENTE
    // ==========================================
    function findMatchingPropertiesForLead(lead) {
        const intentText = normalizeText(lead.intent + ' ' + lead.budget);
        
        return properties.filter(prop => {
            const propCat = normalizeText(prop.category);
            const matchesCat = intentText.includes(propCat) || intentText.includes('propiedad') || intentText.includes('inmueble');
            const matchesOp = (intentText.includes('alquiler') && prop.type === 'Alquiler') ||
                              ((intentText.includes('venta') || intentText.includes('compra') || intentText.includes('busca')) && prop.type === 'Venta') ||
                              (!intentText.includes('alquiler') && !intentText.includes('venta'));
            
            let matchesBeds = true;
            if (intentText.includes('1 hab') && prop.beds < 1) matchesBeds = false;
            if (intentText.includes('2 hab') && prop.beds < 2) matchesBeds = false;
            if (intentText.includes('3 hab') && prop.beds < 3) matchesBeds = false;
            if (intentText.includes('4 hab') && prop.beds < 4) matchesBeds = false;

            return (matchesCat || matchesOp) && matchesBeds;
        }).slice(0, 4);
    }

    // ==========================================
    // 13. KANBAN LEADS & DRAWER
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
    let isDragging = false;

    const leadDrawer = document.getElementById('lead-drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const closeLeadDrawerBtn = document.getElementById('close-lead-drawer-btn');
    const btnToggleEditLead = document.getElementById('btn-toggle-edit-lead');
    const btnDeleteLead = document.getElementById('btn-delete-lead');
    
    const drawerViewMode = document.getElementById('drawer-view-mode');
    const drawerEditForm = document.getElementById('drawer-edit-form');
    const drawerViewFooter = document.getElementById('drawer-view-footer');
    const btnCancelEditLead = document.getElementById('btn-cancel-edit-lead');

    const drawerLeadAvatar = document.getElementById('drawer-lead-avatar');
    const drawerLeadName = document.getElementById('drawer-lead-name');
    const drawerLeadTime = document.getElementById('drawer-lead-time');
    const drawerLeadIntent = document.getElementById('drawer-lead-intent');
    const drawerLeadBudget = document.getElementById('drawer-lead-budget');
    const drawerLeadPhone = document.getElementById('drawer-lead-phone');
    const drawerLeadNotes = document.getElementById('drawer-lead-notes');
    const btnSaveLeadNotes = document.getElementById('btn-save-lead-notes');
    const drawerMatchesCount = document.getElementById('drawer-matches-count');
    const drawerMatchesList = document.getElementById('drawer-matches-list');
    const drawerWhatsAppBtn = document.getElementById('drawer-whatsapp-btn');

    const editLeadName = document.getElementById('edit-lead-name');
    const editLeadPhone = document.getElementById('edit-lead-phone');
    const editLeadStatus = document.getElementById('edit-lead-status');
    const editLeadIntent = document.getElementById('edit-lead-intent');
    const editLeadBudget = document.getElementById('edit-lead-budget');

    let currentActiveLeadId = null;

    function renderLeads() {
        Object.values(columnMap).forEach(col => { if (col) col.innerHTML = ''; });
        const valSearch = normalizeText(globalSearch ? globalSearch.value : '');

        const filtered = leads.filter(l => {
            return !valSearch || 
                normalizeText(l.name).includes(valSearch) || 
                normalizeText(l.intent).includes(valSearch);
        });

        filtered.forEach(lead => {
            const targetCol = columnMap[lead.status] || colNew;
            if (targetCol) {
                const matches = findMatchingPropertiesForLead(lead);
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
                        ${matches.length > 0 ? `<span class="lead-matches-badge">✨ ${matches.length} matches</span>` : ''}
                    </div>
                `;

                card.addEventListener('dragstart', () => {
                    isDragging = true;
                    draggedCard = card;
                    setTimeout(() => card.style.display = 'none', 0);
                });

                card.addEventListener('dragend', () => {
                    setTimeout(() => {
                        if (draggedCard) draggedCard.style.display = 'block';
                        draggedCard = null;
                        isDragging = false;
                        updateKanbanCounters();
                        saveLeadsState();
                    }, 0);
                });

                card.addEventListener('click', () => {
                    if (!isDragging) openLeadDrawer(lead.id);
                });

                targetCol.appendChild(card);
            }
        });

        updateKanbanCounters();
        updateDashboardStats();
    }

    function openLeadDrawer(leadId) {
        const lead = leads.find(l => l.id == leadId);
        if (!lead) return;

        currentActiveLeadId = lead.id;
        showViewMode();

        const initials = lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        drawerLeadAvatar.textContent = initials;
        drawerLeadName.textContent = lead.name;
        drawerLeadTime.textContent = lead.time || 'Reciente';
        drawerLeadIntent.textContent = lead.intent;
        drawerLeadBudget.textContent = lead.budget;
        drawerLeadPhone.textContent = lead.phone || '+58 414-0000000';
        drawerLeadNotes.value = lead.notes || '';

        editLeadName.value = lead.name;
        editLeadPhone.value = lead.phone || '';
        editLeadStatus.value = lead.status || 'new';
        editLeadIntent.value = lead.intent;
        editLeadBudget.value = lead.budget;

        const matches = findMatchingPropertiesForLead(lead);
        drawerMatchesCount.textContent = `${matches.length} ${matches.length === 1 ? 'coincidencia' : 'coincidencias'}`;
        drawerMatchesList.innerHTML = '';

        if (matches.length === 0) {
            drawerMatchesList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No hay propiedades que coincidan directamente con este requerimiento.</p>';
        } else {
            matches.forEach(prop => {
                const mainImg = (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80');
                const card = document.createElement('div');
                card.className = 'drawer-match-card';
                card.innerHTML = `
                    <img src="${mainImg}" class="match-img" alt="${prop.address}">
                    <div class="match-info">
                        <span class="match-price">${formatCurrency(prop.price, prop.type)}</span>
                        <span class="match-address">${prop.address}</span>
                        <span class="match-specs">🛏️ ${prop.beds}h • 🛁 ${prop.baths}b • 📐 ${prop.sqmBuild}m²</span>
                    </div>
                `;
                card.onclick = () => viewPropertyDetails(prop.id);
                drawerMatchesList.appendChild(card);
            });
        }

        drawerWhatsAppBtn.onclick = () => {
            const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
            const msg = `Hola ${lead.name}, te contacto de inmoderno respecto a tu búsqueda de inmueble: "${lead.intent}". ¿Cómo estás?`;
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        };

        leadDrawer.classList.add('open');
        drawerBackdrop.style.display = 'block';
    }

    function showViewMode() {
        drawerViewMode.style.display = 'block';
        drawerEditForm.style.display = 'none';
        drawerViewFooter.style.display = 'block';
    }

    function showEditMode() {
        drawerViewMode.style.display = 'none';
        drawerEditForm.style.display = 'flex';
        drawerViewFooter.style.display = 'none';
    }

    function closeLeadDrawer() {
        leadDrawer.classList.remove('open');
        drawerBackdrop.style.display = 'none';
        currentActiveLeadId = null;
        showViewMode();
    }

    if (closeLeadDrawerBtn) closeLeadDrawerBtn.addEventListener('click', closeLeadDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeLeadDrawer);

    if (btnToggleEditLead) btnToggleEditLead.addEventListener('click', showEditMode);
    if (btnCancelEditLead) btnCancelEditLead.addEventListener('click', showViewMode);

    drawerEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentActiveLeadId) return;

        const lead = leads.find(l => l.id == currentActiveLeadId);
        if (lead) {
            lead.name = editLeadName.value.trim();
            lead.phone = editLeadPhone.value.trim();
            lead.status = editLeadStatus.value;
            lead.intent = editLeadIntent.value.trim();
            lead.budget = editLeadBudget.value.trim();

            saveLeadsState();
            renderLeads();
            openLeadDrawer(lead.id);
        }
    });

    if (btnDeleteLead) {
        btnDeleteLead.addEventListener('click', () => {
            if (!currentActiveLeadId) return;
            const lead = leads.find(l => l.id == currentActiveLeadId);
            if (lead && confirm(`¿Deseas eliminar permanentemente al prospecto "${lead.name}"?`)) {
                leads = leads.filter(l => l.id !== currentActiveLeadId);
                visits = visits.filter(v => v.leadId !== currentActiveLeadId);
                localStorage.setItem('inmo_visits', JSON.stringify(visits));

                saveLeadsState();
                renderLeads();
                renderVisits();
                closeLeadDrawer();
            }
        });
    }

    if (btnSaveLeadNotes) {
        btnSaveLeadNotes.addEventListener('click', () => {
            if (!currentActiveLeadId) return;
            const lead = leads.find(l => l.id == currentActiveLeadId);
            if (lead) {
                lead.notes = drawerLeadNotes.value.trim();
                saveLeadsState();
                alert('¡Notas del cliente guardadas correctamente!');
            }
        });
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
    // 14. GESTIÓN DE AGENDA Y GOOGLE CALENDAR
    // ==========================================
    const visitsList = document.getElementById('visits-list');
    const visitLeadSelect = document.getElementById('visit-lead-select');
    const visitPropSelect = document.getElementById('visit-prop-select');

    function populateVisitSelects() {
        if (!visitLeadSelect || !visitPropSelect) return;
        visitLeadSelect.innerHTML = '';
        visitPropSelect.innerHTML = '';

        leads.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.textContent = `${l.name} (${l.phone || 'Sin telf'})`;
            visitLeadSelect.appendChild(opt);
        });

        properties.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.address} - ${formatCurrency(p.price, p.type)}`;
            visitPropSelect.appendChild(opt);
        });
    }

    function generateGoogleCalendarUrl(visit) {
        const title = encodeURIComponent(`Visita inmoderno: ${visit.leadName}`);
        const location = encodeURIComponent(visit.propAddress);
        const details = encodeURIComponent(`Cita programada con el cliente ${visit.leadName} (${visit.leadPhone}).\nPropiedad: ${visit.propAddress}\nNotas: ${visit.notes || 'Ninguna'}`);

        const startDateTime = new Date(`${visit.date}T${visit.time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        const formatIsoUtc = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        const datesParam = `${formatIsoUtc(startDateTime)}/${formatIsoUtc(endDateTime)}`;

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
    }

    function renderVisits() {
        if (!visitsList) return;
        visitsList.innerHTML = '';

        if (visits.length === 0) {
            visitsList.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No tienes visitas agendadas por el momento.</p>';
            return;
        }

        visits.forEach(v => {
            const gcalUrl = generateGoogleCalendarUrl(v);
            const cleanPhone = (v.leadPhone || '').replace(/[^0-9]/g, '');
            const waMsg = encodeURIComponent(`Hola ${v.leadName}, te confirmo nuestra visita al inmueble en "${v.propAddress}" para el día ${v.date} a las ${v.time}. ¡Nos vemos allá!`);

            const card = document.createElement('div');
            card.className = 'visit-card';
            card.innerHTML = `
                <div class="visit-card-header">
                    <div>
                        <h4 class="visit-lead-name">👤 ${v.leadName}</h4>
                        <p class="visit-prop-title">🏢 ${v.propAddress}</p>
                    </div>
                    <span class="visit-date-badge">📅 ${v.date} • ${v.time}</span>
                </div>
                ${v.notes ? `<p style="font-size: 0.8rem; color: var(--text-muted);">📝 ${v.notes}</p>` : ''}
                <div class="visit-actions-strip">
                    <a href="${gcalUrl}" target="_blank" class="btn-gcal" title="Añadir a Google Calendar">
                        <svg class="btn-icon-svg" viewBox="0 0 24 24" width="16" height="16">
                            <rect x="3" y="4" width="18" height="18" rx="2" fill="#fff" stroke="#dadce0"/>
                            <path d="M3 4h18v4H3z" fill="#4285F4"/>
                            <path d="M7 2v4M17 2v4" stroke="#4285F4" stroke-width="2" stroke-linecap="round"/>
                            <text x="12" y="17" font-size="9" font-family="Inter,sans-serif" font-weight="bold" fill="#3c4043" text-anchor="middle">31</text>
                        </svg>
                        Google Calendar
                    </a>
                    <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" class="btn-whatsapp" style="font-size: 0.78rem;">
                        <svg class="btn-icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.59c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.52 1.1 2.52.73 2.98.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                        </svg>
                        WhatsApp
                    </a>
                    <button class="btn-secondary" style="font-size: 0.78rem;" onclick="deleteVisit('${v.id}')">Eliminar</button>
                </div>
            `;
            visitsList.appendChild(card);
        });

        updateDashboardStats();
    }

    window.deleteVisit = (id) => {
        if (confirm('¿Deseas eliminar esta cita de la agenda?')) {
            visits = visits.filter(v => v.id !== id);
            localStorage.setItem('inmo_visits', JSON.stringify(visits));
            renderVisits();
        }
    };

    // ==========================================
    // 15. STATS DASHBOARD
    // ==========================================
    function updateDashboardStats() {
        const kpiProps = document.getElementById('kpi-properties-count');
        const kpiLeadsNew = document.getElementById('kpi-leads-new');
        const kpiLeadsOffer = document.getElementById('kpi-leads-offer');
        const kpiVisits = document.getElementById('kpi-visits-count');

        if (kpiProps) kpiProps.textContent = properties.length;
        if (kpiLeadsNew) kpiLeadsNew.textContent = leads.filter(l => l.status === 'new').length;
        if (kpiLeadsOffer) kpiLeadsOffer.textContent = leads.filter(l => l.status === 'offer').length;
        if (kpiVisits) kpiVisits.textContent = visits.length;
    }

    // ==========================================
    // 16. SPA NAVIGATION & DRAWER MOBILE
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
            if (targetId === 'view-calendar') renderVisits();

            closeMobileSidebar();
        });
    });

    // ==========================================
    // 17. POPOVERS (DESKTOP & MOBILE FAB)
    // ==========================================
    const mobileFabCreate = document.getElementById('mobile-fab-create');
    const mobileCreatePopover = document.getElementById('mobile-create-popover');
    const popoverBtnProp = document.getElementById('popover-btn-prop');
    const popoverBtnLead = document.getElementById('popover-btn-lead');
    const popoverBtnVisit = document.getElementById('popover-btn-visit');
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

    const btnQuickCreate = document.getElementById('btn-quick-create');
    const desktopCreatePopover = document.getElementById('desktop-create-popover');
    const deskPopoverBtnProp = document.getElementById('desk-popover-btn-prop');
    const deskPopoverBtnLead = document.getElementById('desk-popover-btn-lead');
    const deskPopoverBtnVisit = document.getElementById('desk-popover-btn-visit');
    const deskPopoverBtnBackup = document.getElementById('desk-popover-btn-backup');

    if (btnQuickCreate && desktopCreatePopover) {
        btnQuickCreate.addEventListener('click', (e) => {
            e.stopPropagation();
            desktopCreatePopover.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!desktopCreatePopover.contains(e.target) && e.target !== btnQuickCreate) {
                desktopCreatePopover.classList.remove('show');
            }
        });
    }

    if (deskPopoverBtnProp) deskPopoverBtnProp.addEventListener('click', () => {
        desktopCreatePopover.classList.remove('show');
        openM(propModal);
        initPickerMap(7.7885, -72.2156);
    });
    if (deskPopoverBtnLead) deskPopoverBtnLead.addEventListener('click', () => {
        desktopCreatePopover.classList.remove('show');
        openM(leadModal);
    });
    if (deskPopoverBtnVisit) deskPopoverBtnVisit.addEventListener('click', () => {
        desktopCreatePopover.classList.remove('show');
        populateVisitSelects();
        openM(visitModal);
    });
    if (deskPopoverBtnBackup) deskPopoverBtnBackup.addEventListener('click', () => {
        desktopCreatePopover.classList.remove('show');
        exportData();
    });

    // ==========================================
    // 18. FORMULARIOS Y MODALES
    // ==========================================
    const propModal = document.getElementById('property-modal');
    const leadModal = document.getElementById('lead-modal');
    const visitModal = document.getElementById('visit-modal');

    const propForm = document.getElementById('property-form');
    const leadForm = document.getElementById('lead-form');
    const visitForm = document.getElementById('visit-form');

    function openM(el) { 
        el.style.display = 'flex'; 
        if (mobileCreatePopover) {
            mobileCreatePopover.classList.remove('show');
            mobileFabCreate.classList.remove('active');
        }
        if (desktopCreatePopover) {
            desktopCreatePopover.classList.remove('show');
        }
    }
    function closeM(el, f) { 
        el.style.display = 'none'; 
        if(f) f.reset(); 
        if (propEditId) propEditId.value = '';
        if (propModalTitle) propModalTitle.textContent = 'Agregar Nueva Propiedad';
    }

    const btnOpenPropDesktop = document.getElementById('btn-open-prop-modal');
    if (btnOpenPropDesktop) btnOpenPropDesktop.addEventListener('click', () => {
        openM(propModal);
        initPickerMap(7.7885, -72.2156);
    });
    const dashBtnAddProp = document.getElementById('dash-btn-add-prop');
    if (dashBtnAddProp) dashBtnAddProp.addEventListener('click', () => {
        openM(propModal);
        initPickerMap(7.7885, -72.2156);
    });
    const btnOpenLeadDesktop = document.getElementById('btn-open-lead-modal');
    if (btnOpenLeadDesktop) btnOpenLeadDesktop.addEventListener('click', () => openM(leadModal));
    const btnOpenVisitDesktop = document.getElementById('btn-open-visit-modal');
    if (btnOpenVisitDesktop) {
        btnOpenVisitDesktop.addEventListener('click', () => {
            populateVisitSelects();
            openM(visitModal);
        });
    }

    if (popoverBtnProp) popoverBtnProp.addEventListener('click', () => {
        openM(propModal);
        initPickerMap(7.7885, -72.2156);
    });
    if (popoverBtnLead) popoverBtnLead.addEventListener('click', () => openM(leadModal));
    if (popoverBtnVisit) {
        popoverBtnVisit.addEventListener('click', () => {
            populateVisitSelects();
            openM(visitModal);
        });
    }
    if (popoverBtnBackup) popoverBtnBackup.addEventListener('click', exportData);

    document.getElementById('close-modal-btn').addEventListener('click', () => closeM(propModal, propForm));
    document.getElementById('cancel-modal-btn').addEventListener('click', () => closeM(propModal, propForm));
    document.getElementById('close-lead-modal-btn').addEventListener('click', () => closeM(leadModal, leadForm));
    document.getElementById('cancel-lead-modal-btn').addEventListener('click', () => closeM(leadModal, leadForm));
    document.getElementById('close-visit-modal-btn').addEventListener('click', () => closeM(visitModal, visitForm));
    document.getElementById('cancel-visit-modal-btn').addEventListener('click', () => closeM(visitModal, visitForm));

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

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLead = {
            id: 'lead_' + Date.now(),
            name: document.getElementById('lead-name').value.trim(),
            phone: document.getElementById('lead-phone').value.trim() || '+58 414-0000000',
            intent: document.getElementById('lead-intent').value.trim(),
            budget: document.getElementById('lead-budget').value.trim(),
            status: document.getElementById('lead-status').value,
            notes: '',
            time: 'Ahora'
        };

        leads.push(newLead);
        saveLeadsState();
        renderLeads();
        closeM(leadModal, leadForm);
    });

    visitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const leadId = document.getElementById('visit-lead-select').value;
        const propId = document.getElementById('visit-prop-select').value;

        const targetLead = leads.find(l => l.id == leadId);
        const targetProp = properties.find(p => p.id == propId);

        if (targetLead && targetProp) {
            const newVisit = {
                id: 'visit_' + Date.now(),
                leadId: targetLead.id,
                leadName: targetLead.name,
                leadPhone: targetLead.phone || '',
                propId: targetProp.id,
                propAddress: targetProp.address,
                date: document.getElementById('visit-date').value,
                time: document.getElementById('visit-time').value,
                notes: document.getElementById('visit-notes').value.trim()
            };

            visits.push(newVisit);
            localStorage.setItem('inmo_visits', JSON.stringify(visits));
            renderVisits();
            closeM(visitModal, visitForm);
        }
    });

    // ==========================================
    // 19. EXPORTAR / IMPORTAR BACKUP JSON
    // ==========================================
    function exportData() {
        const data = {
            inmo_properties: properties,
            inmo_leads: leads,
            inmo_visits: visits,
            exported_at: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inmoderno_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
                    visits = parsed.inmo_visits || [];
                    localStorage.setItem('inmo_properties', JSON.stringify(properties));
                    localStorage.setItem('inmo_leads', JSON.stringify(leads));
                    localStorage.setItem('inmo_visits', JSON.stringify(visits));
                    renderHistogram(0, MAX_RANGE_LIMIT);
                    renderProperties();
                    renderLeads();
                    renderVisits();
                    alert('¡Datos restaurados con éxito!');
                }
            } catch (err) {
                alert('Archivo JSON no válido.');
            }
        };
        reader.readAsText(file);
    });

    // Inicializar vistas
    renderHistogram(0, MAX_RANGE_LIMIT);
    renderProperties();
    renderLeads();
    renderVisits();
});
