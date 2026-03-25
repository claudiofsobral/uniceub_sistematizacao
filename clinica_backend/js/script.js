let profissionais = [];

fetch("data/profissionais.json")
  .then((res) => res.json())
  .then((data) => {
    profissionais = data;
  });

function exibirProfissionais(lista) {
  const container = document.getElementById("listaProfissionais");

  if (lista.length === 0) {
    container.innerHTML = "<p class='text-center'>Nenhum profissional encontrado.</p>";
    return;
  }

  container.innerHTML = lista
    .map((p) => {
      return `
      <div class="col-md-3 text-center">
        <img src="${p.imagem}" 
             class="img-fluid rounded-circle mb-2"
             alt="${p.nome}"
             onerror="this.src='img/default.jpg'">
        <h5>${p.nome}</h5>
        <p>${p.especialidade}</p>

        <a href="agendamento.html?medico=${encodeURIComponent(p.nome)}&especialidade=${encodeURIComponent(p.especialidade)}"
        class="btn btn-primary mt-2">
        Marcar Consulta
        </a>

      </div>
    `;
    })
    .join("");
}

function filtrar() {
  const nomeInput = document.getElementById("buscaNome").value.trim().toLowerCase();
  const especialidade = document.getElementById("filtroEspecialidade").value;

  if (nomeInput === "" && especialidade === "") {
    document.getElementById("listaProfissionais").innerHTML =
      "<p class='text-muted text-center'>Digite um nome ou selecione uma especialidade para buscar.</p>";
    return;
  }

  const filtrados = profissionais.filter((p) => {
    const nomeMatch = p.nome.toLowerCase().includes(nomeInput);
    const especialidadeMatch = especialidade === "" || p.especialidade === especialidade;

    return nomeMatch && especialidadeMatch;
  });

  exibirProfissionais(filtrados);
}

// Eventos
document.getElementById("buscaNome").addEventListener("input", filtrar);
document.getElementById("filtroEspecialidade").addEventListener("change", filtrar);
