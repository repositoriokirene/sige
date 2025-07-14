const API_URL = '/api/reparticoes/';
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
    return params.toString();
}

function fetchReparticoes(page = 1, filters = {}) {
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

function updateTable(reparticoes) {
    const tbody = document.getElementById('reparticoes-table-body');
    tbody.innerHTML = '';
    if (!reparticoes || reparticoes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-500">Nenhuma reapartição encontrada.</td></tr>`;
        return;
    }
    reparticoes.forEach(r => {

        tbody.innerHTML += `
            <tr>
                <td class="px-6 py-4">${r.regiao_tributaria}</td>
                <td class="px-6 py-4">${r.provincia}</td>
                <td class="px-6 py-4">${r.municipio}</td>
                <td class="px-6 py-4">${r.reparticao}</td>
                <td class="px-6 py-4">${r.referencia}</td>
                <td class="px-6 py-4 text-right">
                    <button data-id="${r.id}" class="edit-btn text-blue-600 hover:underline mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-id="${r.id}" class="delete-btn text-red-600 hover:underline">
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
            fetchReparticoes(currentPage, currentFilters);
        }
    };
    const nextBtn = document.getElementById('next-page');
    if (nextBtn) nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchReparticoes(currentPage, currentFilters);
        }
    };
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            fetchReparticoes(currentPage, currentFilters);
        });
    });
}

// Modal helpers
function abrirModalAdicionar() {
    limparModal();
    document.getElementById('modal-title').textContent = "Nova Repartição";
    document.getElementById('reparticao-modal').classList.remove('hidden');
}

// abrir modal pra editar
function abrirModalEditar(id) {
    fetch(`${API_URL}${id}/`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('modal-title').textContent = "Editar Repartição";
            document.getElementById('reparticao-id').value = data.id;
            document.getElementById('regiao_tributaria').value = data.regiao_tributaria;
            document.getElementById('provincia').value = data.provincia;
            document.getElementById('municipio').value = data.municipio;
            document.getElementById('reparticao').value = data.reparticao;
            document.getElementById('referencia').value = data.referencia;
            document.getElementById('reparticao-modal').classList.remove('hidden');
        });
}

// fechar o modal
function fecharModal() {
    document.getElementById('reparticao-modal').classList.add('hidden');
}

// Limpar os campos do modal após sair
function limparModal() {
    document.getElementById('reparticao-id').value = '';
    document.getElementById('regiao_tributaria').value = '';
    document.getElementById('provincia').value = '';
    document.getElementById('municipio').value = '';
    document.getElementById('reparticao').value = '';
    document.getElementById('referencia').value = '';
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
                <div class="mb-2"><strong>Região Tributária:</strong> ${data.regiao_tributaria}</div>
                <div class="mb-2"><strong>Província:</strong> ${data.provincia}</div>
                <div class="mb-2"><strong>Município:</strong> ${data.municipio}</div>
                <div class="mb-2"><strong>Repartição:</strong> ${data.reparticao}</div>
                <div class="mb-2"><strong>Referência:</strong> ${data.referencia}</div>
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
    // Busca instantânea
    document.getElementById('search-reparticoes').addEventListener('input', function(e) {
        currentFilters.search = e.target.value;
        currentPage = 1;
        fetchReparticoes(currentPage, currentFilters);
    });

    // Modal Adicionar
    document.getElementById('add-reparticao').addEventListener('click', abrirModalAdicionar);

    // Fechar modal (X ou cancelar)
    document.getElementById('close-modal').addEventListener('click', fecharModal);
    document.getElementById('cancelar-modal').addEventListener('click', fecharModal);



    // Salvar (add/edit)
    document.getElementById('reparticao-form').addEventListener('submit', function(e) {
        e.preventDefault();
        let id = document.getElementById('reparticao-id').value;
        let payload = {
            regiao_tributaria: document.getElementById('regiao_tributaria').value,
            provincia: document.getElementById('provincia').value,
            municipio: document.getElementById('municipio').value,
            reparticao: document.getElementById('reparticao').value,
            referencia: document.getElementById('referencia').value,
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
                fetchReparticoes(currentPage, currentFilters);
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
                fetchReparticoes(currentPage, currentFilters);
            });
        }
    });

    // Modal Visualizar
    document.getElementById('close-ver-modal').addEventListener('click', fecharModalVer);
    document.getElementById('fechar-ver-modal').addEventListener('click', fecharModalVer);

    fetchReparticoes();
});