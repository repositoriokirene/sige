const API_CATEGORIAS = '/api/categorias/';
let currentPage = 1;
let pageSize = 10;
let totalItems = 0;
let currentFilters = {};
let removerId = null;

function montaQuery(page, filters) {
    let params = new URLSearchParams();
    params.set('page', page);
    params.set('page_size', pageSize);
    if (filters.search) params.set('search', filters.search);
    return params.toString();
}

function fetchCategorias(page = 1, filters = {}) {
    const params = montaQuery(page, filters);
    fetch(`${API_CATEGORIAS}?${params}`)
        .then(res => res.json())
        .then(data => {
            updateTable(data.results);
            totalItems = data.count;
            updatePagination(totalItems, page);
            document.getElementById('total-items').textContent = totalItems;
        });
}

function updateTable(categorias) {
    const tbody = document.getElementById('categories-table-body');
    tbody.innerHTML = '';
    if (!categorias || categorias.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500">Nenhuma categoria encontrada.</td></tr>`;
        return;
    }
    categorias.forEach(cat => {
        tbody.innerHTML += `
            <tr>
                <td class="px-6 py-4">${cat.id}</td>
                <td class="px-6 py-4">${cat.descricao}</td>
                <td class="px-6 py-4 text-right">
                    <button data-id="${cat.id}" class="edit-btn text-blue-600 hover:underline mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-id="${cat.id}" class="delete-btn text-red-600 hover:underline">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
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

    // Prev button
    pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" id="prev-page" ${page <= 1 ? 'disabled style="opacity:0.5;"' : ''}><i class="fas fa-chevron-left"></i></button>`;
    // Pages
    for (let i=1; i<=totalPages; i++) {
        if (i === page) {
            pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg bg-blue-600 text-white">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= page-1 && i <= page+1)) {
            pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 page-btn" data-page="${i}">${i}</button>`;
        } else if (i === page-2 || i === page+2) {
            pagination.innerHTML += `<span class="px-3 py-1">...</span>`;
        }
    }
    // Next button
    pagination.innerHTML += `<button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" id="next-page" ${page >= totalPages ? 'disabled style="opacity:0.5;"' : ''}><i class="fas fa-chevron-right"></i></button>`;

    // Eventos de paginação
    const prevBtn = document.getElementById('prev-page');
    if (prevBtn) prevBtn.onclick = () => {
        if (currentPage > 1) {
            fetchCategorias(currentPage - 1, currentFilters);
        }
    };
    const nextBtn = document.getElementById('next-page');
    if (nextBtn) nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            fetchCategorias(currentPage + 1, currentFilters);
        }
    };
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            fetchCategorias(page, currentFilters);
        });
    });
}

function abrirModalAdicionar() {
    limparModal();
    document.getElementById('modal-title').textContent = "Nova Categoria";
    document.getElementById('categoria-modal').classList.remove('hidden');
}

// abrir modal pra editar
function abrirModalEditar(id) {
    fetch(`${API_CATEGORIAS}${id}/`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('modal-title').textContent = "Editar Categoria";
        document.getElementById('categoria-id').value = data.id;
        document.getElementById('descricao').value = data.descricao;
        document.getElementById('categoria-modal').classList.remove('hidden');
    });
}

// fechar o modal
function fecharModal() {
    document.getElementById('categoria-modal').classList.add('hidden');
}

// Limpar os campos do modal após sair
function limparModal() {
    document.getElementById('categoria-id').value = '';
    document.getElementById('descricao').value = '';
}

// Modal remover
function abrirModalRemover() {
    document.getElementById('confirm-modal').classList.remove('hidden');
}
function fecharModalRemover() {
    document.getElementById('confirm-modal').classList.add('hidden');
    removerId = null;
}

function fecharModalVer() {
    document.getElementById('ver-modal').classList.add('hidden');
}

function parseDjangoError(data) {
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
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
    document.getElementById('search-categorias').addEventListener('input', function(e) {
        currentFilters.search = e.target.value;
        currentPage = 1;
        fetchCategorias(currentPage, currentFilters);
    });

    // Modal Adicionar
    document.getElementById('add-categoria').addEventListener('click', abrirModalAdicionar);

    // Fechar modal (X ou cancelar)
    document.getElementById('close-modal').addEventListener('click', fecharModal);
    document.getElementById('cancelar-modal').addEventListener('click', fecharModal);

    // Salvar (add/edit)
    document.getElementById('categoria-form').addEventListener('submit', function(e) {
        e.preventDefault();
        let id = document.getElementById('categoria-id').value;
        let payload = {
            descricao: document.getElementById('descricao').value,
        }
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_CATEGORIAS}${id}/` : API_CATEGORIAS;
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.ok) {
                fecharModal();
                fetchCategorias(currentPage, currentFilters);
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
            fetch(`${API_CATEGORIAS}${removerId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
            .then(res => {
                fecharModalRemover();
                fetchCategorias(currentPage, currentFilters);
            });
        }
    });


    fetchCategorias();

});