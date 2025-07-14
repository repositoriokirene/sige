// Ícones personalizados (ajuste o caminho conforme necessário)
const iconVerde = L.icon({
    iconUrl: "/static/img/eicon-v.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});
const iconAmarelo = L.icon({
    iconUrl: "/static/img/eicon-a.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});
const iconVermelho = L.icon({
    iconUrl: "/static/img/eicon-vr.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

let estabelecimentosData = [];
let map, markersLayer;

// Inicializa o mapa centralizado nas coordenadas passadas
function inicializarMapa(centerLat, centerLng) {
    map = L.map('map').setView([centerLat, centerLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
}

// Renderiza marcadores no mapa a partir do array de estabelecimentos
function renderMarkers(estabs) {
    markersLayer.clearLayers();
    estabs.forEach(e => {
        let icone = iconVerde;
        if (e.situacao === 'pendente') icone = iconAmarelo;
        else if (e.situacao === 'fora') icone = iconVermelho;

        const marker = L.marker([e.latitude, e.longitude], { icon: icone })
            .bindPopup(`
                <strong>${e.nome}</strong>
                <br>NIF: ${e.nif}
                <br>Número de Estabelecimento: ${e.numero_estabelecimento}
                <br>Categoria: ${e.categoria_descricao}
                <br>Situação: ${e.situacao_display}
                <br>Latitude: ${e.latitude}
                <br>Longitude: ${e.longitude}
            `);
        marker.addTo(markersLayer);
        // Salva referência do marker no objeto para uso posterior
        e._marker = marker;
    });
}

// Função para buscar todos os estabelecimentos de todas as páginas
async function fetchAllEstabelecimentos() {
    let url = '/api/estabelecimentos/?page=1&page_size=100';
    let results = [];
    let next = url;
    while (next) {
        const res = await fetch(next);
        const data = await res.json();
        results = results.concat(data.results);
        next = data.next;
    }
    return results;
}

// Inicialização: pega localização e carrega estabelecimentos
navigator.geolocation.getCurrentPosition(function (position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    inicializarMapa(latitude, longitude);

    fetchAllEstabelecimentos().then(data => {
        estabelecimentosData = data;
        renderMarkers(estabelecimentosData);
    });
}, function (error) {
    console.error("Erro ao obter localização:", error);
    inicializarMapa(-8.8399876, 13.2894368);
    fetchAllEstabelecimentos().then(data => {
        estabelecimentosData = data;
        renderMarkers(estabelecimentosData);
    });
});

// Manipulação da busca no mapa
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-map');
    if (!searchInput) return;
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            renderMarkers(estabelecimentosData);
            return;
        }
        // Filtra por nome ou NIF
        const filtrados = estabelecimentosData.filter(e =>
            (e.nome && e.nome.toLowerCase().includes(query)) ||
            (e.nif && e.nif.toLowerCase().includes(query))
        );
        renderMarkers(filtrados);

        // Se só um resultado, centraliza e abre popup
        if (filtrados.length === 1) {
            const est = filtrados[0];
            map.setView([est.latitude, est.longitude], 16);
            setTimeout(() => {
                est._marker.openPopup();
            }, 150);
        }
    });
});