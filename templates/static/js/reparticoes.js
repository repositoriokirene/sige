const API_REPARTICOES_URL = '/api/reparticoes/';

async function carregarTodasReparticoes(url, acumulador = []) {
    const res = await fetch(url);
    const data = await res.json();
    const novas = data.results;
    const todas = acumulador.concat(novas);

    if (data.next) {
        return carregarTodasReparticoes(data.next, todas);
    } else {
        return todas;
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const regiaoSelect = document.getElementById("regiao_tributaria");
    const provinciaSelect = document.getElementById("provincia");
    const municipioSelect = document.getElementById("municipio");
    const reparticaoInput = document.getElementById("reparticao");
    const referenciaInput = document.getElementById("referencia");

    let todasReparticoes = await carregarTodasReparticoes(API_REPARTICOES_URL);

    // Preencher regiao_tributaria sem repetir
    const regioesUnicas = [...new Set(todasReparticoes.map(r => r.regiao_tributaria))];
    regioesUnicas.forEach(regiao => {
        const opt = document.createElement("option");
        opt.value = regiao;
        opt.textContent = regiao;
        regiaoSelect.appendChild(opt);
    });

    // Ao mudar regiao_tributaria
    regiaoSelect.addEventListener("change", function () {
        const regiaoSelecionada = this.value;

        // Limpar selects dependentes
        provinciaSelect.innerHTML = '<option value="">Selecione a província</option>';
        municipioSelect.innerHTML = '<option value="">Selecione o município</option>';
        reparticaoInput.value = "";
        referenciaInput.value = "";

        if (!regiaoSelecionada) return;

        // Filtrar pelas províncias únicas da região
        const provincias = [
            ...new Set(
                todasReparticoes
                    .filter(r => r.regiao_tributaria === regiaoSelecionada)
                    .map(r => r.provincia)
            )
        ];

        provincias.forEach(prov => {
            const opt = document.createElement("option");
            opt.value = prov;
            opt.textContent = prov;
            provinciaSelect.appendChild(opt);
        });
    });

    // Ao mudar província
    provinciaSelect.addEventListener("change", function () {
        const provSelecionada = this.value;
        const regiaoSelecionada = regiaoSelect.value;

        municipioSelect.innerHTML = '<option value="">Selecione o município</option>';
        reparticaoInput.value = "";
        referenciaInput.value = "";

        if (!provSelecionada) return;

        // Filtrar municípios únicos da região + província
        const municipios = [
            ...new Set(
                todasReparticoes
                    .filter(r => r.regiao_tributaria === regiaoSelecionada && r.provincia === provSelecionada)
                    .map(r => r.municipio)
            )
        ];

        municipios.forEach(mun => {
            const opt = document.createElement("option");
            opt.value = mun;
            opt.textContent = mun;
            municipioSelect.appendChild(opt);
        });
    });

    const reparticaoSelect = document.getElementById("reparticao");

    // Ao mudar município
    municipioSelect.addEventListener("change", function () {
        const municipioSelecionado = this.value;
        const regiaoSelecionada = regiaoSelect.value;
        const provSelecionada = provinciaSelect.value;

        reparticaoSelect.innerHTML = '<option value="">Selecione a repartição</option>';
        referenciaInput.value = "";

        if (!municipioSelecionado) return;

        // Filtrar repartições correspondentes
        const reparticoesFiltradas = todasReparticoes.filter(
            r =>
                r.regiao_tributaria === regiaoSelecionada &&
                r.provincia === provSelecionada &&
                r.municipio === municipioSelecionado
        );

        reparticoesFiltradas.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;  // Ou pode ser r.reparticao se preferir
            opt.textContent = r.reparticao;
            opt.dataset.referencia = r.referencia;  // Guarda a referência associada
            reparticaoSelect.appendChild(opt);
        });
    });

    // Ao mudar repartição
    reparticaoSelect.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        const referencia = selectedOption.dataset.referencia || "";
        referenciaInput.value = referencia;
    });
});
