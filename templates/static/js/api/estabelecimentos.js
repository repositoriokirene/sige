const API_URL = '/api/estabelecimentos/';
let currentPage = 1;
let pageSize = 10;
let totalItems = 0;
let currentFilters = {};
let removerId = null;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function montaQuery(page, filters) {
    let params = new URLSearchParams();
    params.set('page', page);
    params.set('page_size', pageSize);
    if (filters.search) params.set('search', filters.search);
    if (filters.categoria) params.set('categoria', filters.categoria);
    if (filters.situacao) params.set('situacao', filters.situacao);
    if (filters.data_inicial) params.set('data_inicial', filters.data_inicial);
    if (filters.data_final) params.set('data_final', filters.data_final);
    return params.toString();
}

function fetchEstablishments(page = 1, filters = {}) {
    const params = montaQuery(page, filters);
    fetch(`${API_URL}?${params}`)
        .then(res => res.json())
        .then(data => {
            updateTable(data.results);
            totalItems = data.count;
            updatePagination(totalItems, page);
            document.getElementById('total-items').textContent = totalItems;
        });
}

function updateTable(establishments) {
    const tbody = document.getElementById('establishments-table-body');
    tbody.innerHTML = '';
    if (!establishments || establishments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-500">Nenhum estabelecimento encontrado.</td></tr>`;
        return;
    }
    establishments.forEach(est => {
        let statusClass = '';

        switch (est.situacao) {
            case 'regulada':
                statusClass = 'bg-green-100 text-green-800';
                break;
            case 'pendente':
                statusClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'fora':
                statusClass = 'bg-red-100 text-red-800';
                break;
        }
        tbody.innerHTML += `
            <tr>
                <td class="px-6 py-4">${est.nome}</td>
                <td class="px-6 py-4">${est.categoria_descricao}</td>
                <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${est.situacao_display}
                    </span>
                </td>
                <td class="px-6 py-4">${new Date(est.criado_em).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-right">
                    <button data-id="${est.id}" class="ver-btn text-green-600 hover:underline mr-2">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button data-id="${est.id}" class="edit-btn text-blue-600 hover:underline mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-id="${est.id}" class="delete-btn text-red-600 hover:underline">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    // Ver
    document.querySelectorAll('.ver-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            abrirModalVer(id);
        });
    });
    // Editar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            abrirModalEditar(id);
        });
    });
    // Remover
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removerId = e.target.closest('button').dataset.id;
            abrirModalRemover();
        });
    });
}

function updatePagination(total, page) {
    const pagination = document.getElementById('pagination-buttons');
    pagination.innerHTML = '';
    let totalPages = Math.ceil(total / pageSize);
    let from = (page-1) * pageSize + 1;
    let to = Math.min(page * pageSize, total);
    document.getElementById('showing-from').textContent = total === 0 ? 0 : from;
    document.getElementById('showing-to').textContent = to;

    // Anterior
    pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" id="prev-page" ${page <= 1 ? 'disabled style="opacity:0.5;"' : ''}><i class="fas fa-chevron-left"></i></button>`;
    // Paginas
    for (let i=1; i<=totalPages; i++) {
        if (i === page) {
            pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg bg-blue-600 text-white">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= page-1 && i <= page+1)) {
            pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 page-btn" data-page="${i}">${i}</button>`;
        } else if (i === page-2 || i === page+2) {
            pagination.innerHTML += `<span class="px-3 py-1">...</span>`;
        }
    }
    // Proximo
    pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" id="next-page" ${page >= totalPages ? 'disabled style="opacity:0.5;"' : ''}><i class="fas fa-chevron-right"></i></button>`;

    // Eventos de paginação
    const prevBtn = document.getElementById('prev-page');
    if (prevBtn) prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchEstablishments(currentPage, currentFilters);
        }
    };
    const nextBtn = document.getElementById('next-page');
    if (nextBtn) nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchEstablishments(currentPage, currentFilters);
        }
    };
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            fetchEstablishments(currentPage, currentFilters);
        });
    });
}

// Modal helpers
function abrirModalAdicionar() {
    limparModal();
    document.getElementById('modal-title').textContent = "Novo Estabelecimento";
    document.getElementById('estabelecimento-modal').classList.remove('hidden');
}

// abrir modal pra editar
function abrirModalEditar(id) {
    fetch(`${API_URL}${id}/`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('modal-title').textContent = "Editar Estabelecimento";
            document.getElementById('estabelecimento-id').value = data.id;
            document.getElementById('nome').value = data.nome;
            document.getElementById('nif').value = data.nif;
            document.getElementById('categoria').value = data.categoria;
            document.getElementById('regiao_tributaria').value = data.regiao_tributaria;
            document.getElementById('provincia').value = data.provincia;
            document.getElementById('municipio').value = data.municipio;
            document.getElementById('reparticao').value = data.reparticao;
            document.getElementById('referencia').value = data.referencia;
            document.getElementById('numero_estabelecimento').value = data.numero_estabelecimento;
            document.getElementById('situacao').value = data.situacao;
            document.getElementById('latitude').value = data.latitude || '';
            document.getElementById('longitude').value = data.longitude || '';
            document.getElementById('estabelecimento-modal').classList.remove('hidden');
        });
}

// fechar o modal
function fecharModal() {
    document.getElementById('estabelecimento-modal').classList.add('hidden');
}

// Limpar os campos do modal após sair
function limparModal() {
    document.getElementById('estabelecimento-id').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('nif').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('regiao_tributaria').value = '';
    document.getElementById('provincia').value = '';
    document.getElementById('municipio').value = '';
    document.getElementById('reparticao').value = '';
    document.getElementById('referencia').value = '';
    document.getElementById('numero_estabelecimento').value = '';
    document.getElementById('situacao').value = 'regulada';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
}

// Modal remover
function abrirModalRemover() {
    document.getElementById('confirm-modal').classList.remove('hidden');
}
function fecharModalRemover() {
    document.getElementById('confirm-modal').classList.add('hidden');
    removerId = null;
}

// Modal Visualizar
function abrirModalVer(id) {
    fetch(`${API_URL}${id}/`)
        .then(res => res.json())
        .then(data => {
            let html = `
                <div class="mb-2"><strong>Nome:</strong> ${data.nome}</div>
                <div class="mb-2"><strong>NIF:</strong> ${data.nif || '-'}</div>
                <div class="mb-2"><strong>Categoria:</strong> ${data.categoria}</div>
                <div class="mb-2"><strong>Região Tributária:</strong> ${data.regiao_tributaria}</div>
                <div class="mb-2"><strong>Província:</strong> ${data.provincia}</div>
                <div class="mb-2"><strong>Município:</strong> ${data.municipio}</div>
                <div class="mb-2"><strong>Repartição:</strong> ${data.reparticao}</div>
                <div class="mb-2"><strong>Referência:</strong> ${data.referencia}</div>
                <div class="mb-2"><strong>Número de Estabelecimento:</strong> ${data.numero_estabelecimento}</div>
                <div class="mb-2"><strong>Status:</strong> ${data.situacao_display}</div>
                <div class="mb-2"><strong>Latitude:</strong> ${data.latitude}</div>
                <div class="mb-2"><strong>Longitude:</strong> ${data.longitude}</div>
                <div class="mb-2"><strong>Data Cadastro:</strong> ${new Date(data.criado_em).toLocaleString()}</div>
            `;
            document.getElementById('ver-conteudo').innerHTML = html;
            document.getElementById('ver-modal').classList.remove('hidden');
        });
}

function fecharModalVer() {
    document.getElementById('ver-modal').classList.add('hidden');
}

// Conv
function parseDjangoError(data) {
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
        // Se for { field: [mensagens] }
        let messages = [];
        for (const key in data) {
            if (Array.isArray(data[key])) {
                let field = key.charAt(0).toUpperCase() + key.slice(1);
                messages.push(`${field}: ${data[key].join(", ")}`);
            } else if (typeof data[key] === "string") {
                messages.push(`${key}: ${data[key]}`);
            }
        }
        return messages.join("\n");
    }
    return "Erro desconhecido.";
}

// Eventos modais e outros
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn-aplicar').addEventListener('click', () => {
        console.log('Data Inicial:', document.getElementById('filter-data-inicial').value);
        console.log('Data Final:', document.getElementById('filter-data-final').value);
        currentFilters = {
            categoria: document.getElementById('filter-categoria').value,
            situacao: document.getElementById('filter-situacao').value,
            data_inicial: document.getElementById('filter-data-inicial').value,
            data_final: document.getElementById('filter-data-final').value
        };
        currentPage = 1;
        fetchEstablishments(currentPage, currentFilters);
    });
    document.getElementById('btn-limpar').addEventListener('click', () => {
        document.getElementById('filter-categoria').value = '';
        document.getElementById('filter-situacao').value = '';
        document.getElementById('filter-data-inicial').value = '';
        document.getElementById('filter-data-final').value = '';
        document.getElementById('search-establishments').value = '';
        currentFilters = {};
        currentPage = 1;
        fetchEstablishments(currentPage, currentFilters);
    });

    // Busca instantânea
    document.getElementById('search-establishments').addEventListener('input', function(e) {
        currentFilters.search = e.target.value;
        currentPage = 1;
        fetchEstablishments(currentPage, currentFilters);
    });

    // Modal Adicionar
    document.getElementById('add-establishment').addEventListener('click', abrirModalAdicionar);

    // Fechar modal (X ou cancelar)
    document.getElementById('close-modal').addEventListener('click', fecharModal);
    document.getElementById('cancelar-modal').addEventListener('click', fecharModal);

    // Botão de Geolocalização
    document.getElementById('btn-localizacao').addEventListener('click', function(e) {
        e.preventDefault();
        capturarLocalizacao();
    });

    // Salvar (add/edit)
    document.getElementById('estabelecimento-form').addEventListener('submit', function(e) {
        e.preventDefault();
        let id = document.getElementById('estabelecimento-id').value;
        let payload = {
            nome: document.getElementById('nome').value,
            nif: document.getElementById('nif').value,
            categoria: document.getElementById('categoria').value,
            regiao_tributaria: document.getElementById('regiao_tributaria').value,
            provincia: document.getElementById('provincia').value,
            municipio: document.getElementById('municipio').value,
            reparticao: document.getElementById('reparticao').value,
            referencia: document.getElementById('referencia').value,
            numero_estabelecimento: document.getElementById('numero_estabelecimento').value,
            situacao: document.getElementById('situacao').value,
            latitude: document.getElementById('latitude').value,
            longitude: document.getElementById('longitude').value
        };
        let method = id ? 'PUT' : 'POST';
        let url = id ? `${API_URL}${id}/` : API_URL;
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.ok) {
                fecharModal();
                fetchEstablishments(currentPage, currentFilters);
            } else {
                res.json().then(data => {
                    showToast(parseDjangoError(data));
                });
            }
        });
    });

    // Modal Remover
    document.getElementById('cancelar-remocao').addEventListener('click', fecharModalRemover);
    document.getElementById('close-confirm-modal').addEventListener('click', fecharModalRemover);
    document.getElementById('confirmar-remocao').addEventListener('click', function() {
        if (removerId) {
            fetch(`${API_URL}${removerId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken
                }
            })
            .then(res => {
                fecharModalRemover();
                fetchEstablishments(currentPage, currentFilters);
            });
        }
    });

    // Modal Visualizar
    document.getElementById('close-ver-modal').addEventListener('click', fecharModalVer);
    document.getElementById('fechar-ver-modal').addEventListener('click', fecharModalVer);


    fetchEstablishments();
});