document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const medico = params.get("medico") || "";
  const especialidade = params.get("especialidade") || "";

  const campoMedico = document.getElementById("medico");
  const campoEspecialidade = document.getElementById("especialidade");
  const campoNome = document.getElementById("nome");
  const campoCpf = document.getElementById("cpf");
  const selectData = document.getElementById("data");
  const formAgendamento = document.getElementById("formAgendamento");
  const botaoAgendar = document.getElementById("btnAgendar") || formAgendamento.querySelector("button[type='submit']");

  const API_BASE = "https://clinica-saude-backend-hpzl.onrender.com";

  campoMedico.value = medico;
  campoEspecialidade.value = especialidade;

  campoCpf.addEventListener("input", () => {
    let valor = campoCpf.value.replace(/\D/g, "");
    valor = valor.slice(0, 11);
    campoCpf.value = valor;
  });

  fetch("data/disponibilidade.json")
    .then((res) => res.json())
    .then((dados) => {
      const itemMedico = dados.find((item) => item.medico === medico);

      if (!itemMedico || !Array.isArray(itemMedico.datas)) {
        selectData.innerHTML = '<option value="">Nenhuma data disponível</option>';
        return;
      }

      selectData.innerHTML = '<option value="">Selecione uma data</option>';

      itemMedico.datas.forEach((data) => {
        const option = document.createElement("option");
        option.value = data;
        option.textContent = data;
        selectData.appendChild(option);
      });
    })
    .catch((erro) => {
      console.error("Erro ao carregar disponibilidade:", erro);
      selectData.innerHTML = '<option value="">Erro ao carregar datas</option>';
    });

  function mostrarMensagem(texto, tipo) {
    let msgDiv = document.getElementById("mensagemRetorno");
    if (!msgDiv) {
      msgDiv = document.createElement("div");
      msgDiv.id = "mensagemRetorno";
      formAgendamento.insertAdjacentElement("afterend", msgDiv);
    }
    msgDiv.className = `alert alert-${tipo} mt-3`;
    msgDiv.textContent = texto;
    msgDiv.scrollIntoView({ behavior: "smooth" });
  }

  function setBotaoCarregando(carregando) {
    if (carregando) {
      botaoAgendar.disabled = true;
      botaoAgendar.textContent = "⏳ Aguarde, conectando ao servidor...";
    } else {
      botaoAgendar.disabled = false;
      botaoAgendar.textContent = "Agendar";
    }
  }

  formAgendamento.addEventListener("submit", (event) => {
    event.preventDefault();

    const medicoValor = campoMedico.value.trim();
    const especialidadeValor = campoEspecialidade.value.trim();
    const nomeValor = campoNome.value.trim();
    const cpfValor = campoCpf.value.trim();
    const dataValor = selectData.value;

    if (!medicoValor || !especialidadeValor || !nomeValor || !cpfValor || !dataValor) {
      mostrarMensagem("Preencha todos os campos obrigatórios.", "warning");
      return;
    }

    if (cpfValor.length !== 11) {
      mostrarMensagem("O CPF deve conter exatamente 11 números.", "warning");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("medico", medicoValor);
    formData.append("especialidade", especialidadeValor);
    formData.append("nome", nomeValor);
    formData.append("cpf", cpfValor);
    formData.append("data", dataValor);

    setBotaoCarregando(true);
    mostrarMensagem("⏳ Conectando ao servidor, aguarde alguns segundos...", "info");

    fetch(`${API_BASE}/agendar_consulta.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })
      .then(async (res) => {
        const texto = await res.text();
        try {
          return JSON.parse(texto);
        } catch {
          throw new Error(`Resposta inválida do servidor: ${texto}`);
        }
      })
      .then((resultadoAgendamento) => {
        if (resultadoAgendamento.sucesso) {
          mostrarMensagem("✅ Consulta agendada com sucesso!", "success");
          campoNome.value = "";
          campoCpf.value = "";
          selectData.value = "";
        } else {
          mostrarMensagem(resultadoAgendamento.mensagem || "Erro ao agendar consulta.", "danger");
        }
      })
      .catch((erro) => {
        console.error("Erro ao agendar consulta:", erro);
        mostrarMensagem("⚠️ O servidor demorou para responder. Verifique sua conexão e tente novamente.", "warning");
      })
      .finally(() => {
        setBotaoCarregando(false);
      });
  });
});
