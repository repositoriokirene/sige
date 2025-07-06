const API_CATEGORIAS = '/api/categorias/';
let categoriaIdEditando = null;
let searchTimeout = null;
let currentPage = 1;
let pageSize = 10;
let totalItems = 0;
let currentSearch = "";

function fetchCategorias(page = 1, search = "") {
    currentPage = page;
    currentSearch = search;
    let params = new URLSearchParams();
    params.set('page', page);
    params.set('page_size', pageSize);
    if (search) params.set('search', search);

    fetch(`${API_CATEGORIAS}?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
        totalItems = data.count;
        updateTable(data.results);
        updatePagination(totalItems, currentPage);
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
                    <button data-id="${cat.id}" class="edit-cat-btn text-blue-600 hover:underline mr-2">Editar</button>
                    <button data-id="${cat.id}" class="delete-cat-btn text-red-600 hover:underline">Excluir</button>
                </td>
            </tr>
        `;
    });
    document.querySelectorAll('.edit-cat-btn').forEach(btn => {
        btn.addEventListener('click', e => abrirModalEditar(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-cat-btn').forEach(btn => {
        btn.addEventListener('click', e => removerCategoria(e.target.dataset.id));
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
            fetchCategorias(currentPage - 1, currentSearch);
        }
    };
    const nextBtn = document.getElementById('next-page');
    if (nextBtn) nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            fetchCategorias(currentPage + 1, currentSearch);
        }
    };
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            fetchCategorias(page, currentSearch);
        });
    });
}

function abrirModalAdicionar() {
    categoriaIdEditando = null;
    document.getElementById('categoria-modal-title').textContent = "Nova Categoria";
    document.getElementById('descricao').value = '';
    document.getElementById('categoria-id').value = '';
    document.getElementById('categoria-modal').classList.remove('hidden');
}

function abrirModalEditar(id) {
    fetch(`${API_CATEGORIAS}${id}/`)
    .then(res => res.json())
    .then(data => {
        categoriaIdEditando = id;
        document.getElementById('categoria-modal-title').textContent = "Editar Categoria";
        document.getElementById('descricao').value = data.descricao;
        document.getElementById('categoria-modal').classList.remove('hidden');
        document.getElementById('categoria-id').value = id;
    });
}

function fecharModalCategoria() {
    document.getElementById('categoria-modal').classList.add('hidden');
}

function removerCategoria(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    fetch(`${API_CATEGORIAS}${id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        }
    })
    .then(res => {
        if (res.ok) {
            fetchCategorias(currentPage, currentSearch);
        } else {
            res.json().then(data => showToast(parseDjangoError(data)));
        }
    });
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

document.addEventListener('DOMContentLoaded', function() {
    // Busca instantânea (debounce)
    document.getElementById('search-categories').addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const value = e.target.value;
        searchTimeout = setTimeout(() => {
            fetchCategorias(1, value);
        }, 400);
    });

    // Carrega categorias ao abrir a página
    fetchCategorias();

    // Adicionar nova categoria
    document.getElementById('add-category').addEventListener('click', abrirModalAdicionar);

    // Cancelar modal
    document.getElementById('cancelar-categoria').addEventListener('click', e => {
        e.preventDefault();
        fecharModalCategoria();
    });

    // Salvar (add/edit) categoria
    document.getElementById('categoria-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const descricao = document.getElementById('descricao').value;
        const id = document.getElementById('categoria-id').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_CATEGORIAS}${id}/` : API_CATEGORIAS;
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ descricao })
        })
        .then(res => {
            if (res.ok) {
                fecharModalCategoria();
                fetchCategorias(currentPage, currentSearch);
            } else {
                res.json().then(data => {
                    showToast(parseDjangoError(data));
                });
            }
        });
    });
});